/**
 * Manages storing AI conversation sessions as markdown files
 */

import type { StoreSessionParams, StoreSessionResult } from './types.js';
import {
  ensureDirectory,
  generateTopicFolderName,
  writeFile,
  validatePath,
  getSessionsDirectory,
  getExportsDirectory,
  getExportFolderInstructions,
  findLatestExportFile,
  findExportFileByPattern,
  listExportFiles,
  readFileContent,
} from '../shared/filesystem.js';
import { extractTopic } from './topic-extractor.js';
import { formatSummaryMarkdown, formatFullContextMarkdown } from './markdown-formatter.js';
import { validateInput } from './input-validator.js';
import { SessionError } from '../shared/errors.js';
import { parseExport, messagesToJson, messagesToPlainText } from './export-parser.js';
import { join, resolve } from 'path';

export class SessionStoreManager {
  async storeSession(params: StoreSessionParams): Promise<StoreSessionResult> {
    try {
      let conversation: string | Array<{ role: string; content: unknown }>;
      let exportFileUsed: string | undefined;
      let warning: string | undefined;

      // 1. Determine conversation source
      if (params.conversation) {
        // Use provided conversation
        conversation = params.conversation;
      } else {
        // Try to find export file - ALWAYS in main location
        const exportsDir = getExportsDirectory();
        
        // Ensure exports directory exists (auto-create on first use)
        try {
          await ensureDirectory(exportsDir);
        } catch (error) {
          // Non-fatal, continue
        }

        let exportFile: { path: string; filename: string } | null = null;

        if (params.exportFilename) {
          // User specified a filename pattern
          exportFile = await findExportFileByPattern(exportsDir, params.exportFilename);
          if (!exportFile) {
            const allFiles = await listExportFiles(exportsDir);
            throw new SessionError(
              'EXPORT_FILE_NOT_FOUND',
              `No export file found matching pattern "${params.exportFilename}"`,
              allFiles.length > 0
                ? `Available files: ${allFiles.join(', ')}`
                : `No export files found in ${exportsDir}. Please export your conversation first.`
            );
          }
        } else {
          // Find latest export file
          const latest = await findLatestExportFile(exportsDir, 10);
          if (!latest) {
            const instructions = getExportFolderInstructions();
            const allFiles = await listExportFiles(exportsDir);
            
            throw new SessionError(
              'NO_CONVERSATION_OR_EXPORT',
              'No conversation provided and no recent export file found.',
              allFiles.length > 0
                ? `Found ${allFiles.length} export file(s) but none modified in last 10 minutes: ${allFiles.join(', ')}. Use exportFilename parameter to specify which file to use.`
                : `Export folder: ${instructions.fullPath}\n\n${instructions.instructions.join('\n')}`
            );
          }
          exportFile = { path: latest.path, filename: latest.filename };
        }

        // Read and parse export file
        try {
          const exportContent = await readFileContent(exportFile.path);
          // Use parseExport which auto-detects format (.md vs .json)
          const parsedMessages = parseExport(exportContent, exportFile.filename);
          
          if (parsedMessages.length === 0) {
            throw new SessionError(
              'EXPORT_PARSE_ERROR',
              'Export file contains no valid messages',
              'The export file may be empty or in an unsupported format.'
            );
          }

          // Convert to requested format
          if (params.format === 'messages') {
            conversation = messagesToJson(parsedMessages);
          } else {
            conversation = messagesToPlainText(parsedMessages);
          }
          
          exportFileUsed = exportFile.filename;
        } catch (error) {
          if (error instanceof SessionError) {
            throw error;
          }
          throw new SessionError(
            'EXPORT_READ_ERROR',
            `Failed to read or parse export file: ${exportFile.filename}`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }

      // 2. Validate conversation (now that we have it)
      const validation = validateInput({ ...params, conversation });
      if (!validation.valid) {
        throw new SessionError('INVALID_INPUT', validation.error!);
      }

      // Handle empty conversation (edge case)
      if (typeof conversation === 'string') {
        if (conversation.trim().length === 0) {
          warning = 'Conversation is empty';
        }
      } else {
        if (conversation.length === 0) {
          warning = 'Conversation is empty';
        }
      }

      // 3. Extract topic (use conversation text for topic extraction)
      const conversationText =
        typeof conversation === 'string'
          ? conversation
          : JSON.stringify(conversation, null, 2);
      const topic = extractTopic(conversationText, params.topic);

      // 3. Determine where to save
      // Default: main .codearchitect/ folder in user's home directory (always saves here)
      // No project detection - this is the main "second brain" location
      const mainSessionsDir = getSessionsDirectory('', params.sessionsDir);

      // Optional: project folder (if projectDir specified)
      let projectSessionsDir: string | undefined;
      if (params.projectDir) {
        const resolvedProjectDir = resolve(params.projectDir);
        projectSessionsDir = join(resolvedProjectDir, '.codearchitect', 'sessions');
      }

      const date = new Date();
      const dateFolder = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format

      // 4. Generate topic folder name (use main dir for naming)
      let topicFolderName: string;
      try {
        topicFolderName = await generateTopicFolderName(date, topic, mainSessionsDir);
      } catch (error) {
        throw new SessionError(
          'FILENAME_GENERATION_ERROR',
          'Failed to generate topic folder name',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 5. Format markdown for both files (do once, reuse)
      const summaryMarkdown = formatSummaryMarkdown(
        conversation,
        topic,
        params.format || 'plain',
        'full.md'
      );

      const fullMarkdown = formatFullContextMarkdown(
        conversation,
        topic,
        params.format || 'plain',
        'summary.md'
      );

      // 6. Save to main .codearchitect/ folder (always)
      const mainDateDir = join(mainSessionsDir, dateFolder);
      const mainTopicPath = join(mainDateDir, topicFolderName);
      
      try {
        await ensureDirectory(mainTopicPath);
      } catch (error) {
        throw new SessionError(
          'DIRECTORY_CREATION_ERROR',
          'Failed to create main directory',
          error instanceof Error ? error.message : String(error)
        );
      }

      const mainSummaryPath = join(mainTopicPath, 'summary.md');
      const mainFullPath = join(mainTopicPath, 'full.md');

      if (!validatePath(mainSummaryPath, mainSessionsDir) || !validatePath(mainFullPath, mainSessionsDir)) {
        throw new SessionError('FILE_WRITE_ERROR', 'Invalid main file path');
      }

      await writeFile(mainSummaryPath, summaryMarkdown, 'utf-8');
      await writeFile(mainFullPath, fullMarkdown, 'utf-8');

      // 7. Save to project folder (if specified)
      let projectSummaryPath: string | undefined;
      let projectFullPath: string | undefined;
      let projectSaveSuccess = false;
      
      if (projectSessionsDir) {
        const projectDateDir = join(projectSessionsDir, dateFolder);
        const projectTopicPath = join(projectDateDir, topicFolderName);
        
        try {
          await ensureDirectory(projectTopicPath);
          projectSummaryPath = join(projectTopicPath, 'summary.md');
          projectFullPath = join(projectTopicPath, 'full.md');

          if (validatePath(projectSummaryPath, projectSessionsDir) && validatePath(projectFullPath, projectSessionsDir)) {
            await writeFile(projectSummaryPath, summaryMarkdown, 'utf-8');
            await writeFile(projectFullPath, fullMarkdown, 'utf-8');
            projectSaveSuccess = true;
          }
        } catch (error) {
          // Non-fatal: continue with main folder save
          warning = warning ? `${warning}; Failed to save to project folder` : 'Failed to save to project folder';
        }
      }

      // 8. Build concise response message
      const locations: string[] = [];
      locations.push(`main: ${topicFolderName}`);
      if (projectSaveSuccess) {
        locations.push(`project: ${topicFolderName}`);
      }
      
      const locationMsg = locations.length > 1 
        ? `Saved to ${locations.join(' and ')}`
        : `Saved to ${locations[0]}`;

      let message = locationMsg;
      if (exportFileUsed) {
        message = `Detected export file '${exportFileUsed}', ${message.toLowerCase()}`;
      }
      message = `${message}. Next: use codearchitect get_session ${topicFolderName}`;

      return {
        success: true,
        file: mainSummaryPath, // Deprecated: kept for backward compatibility
        summaryFile: mainSummaryPath,
        fullFile: mainFullPath,
        filename: topicFolderName,
        topic,
        date: date.toISOString(),
        message,
        warning,
      };
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError(
        'UNKNOWN_ERROR',
        'Failed to store session',
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

