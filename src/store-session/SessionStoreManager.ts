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
} from '../shared/filesystem.js';
import { extractTopic } from './topic-extractor.js';
import { formatSummaryMarkdown, formatFullContextMarkdown } from './markdown-formatter.js';
import { validateInput } from './input-validator.js';
import { SessionError } from '../shared/errors.js';
import { join, resolve } from 'path';

export class SessionStoreManager {
  async storeSession(params: StoreSessionParams): Promise<StoreSessionResult> {
    try {
      // 1. Validate input
      const validation = validateInput(params);
      if (!validation.valid) {
        throw new SessionError('INVALID_INPUT', validation.error!);
      }

      // Handle empty conversation (edge case)
      let warning: string | undefined;

      if (typeof params.conversation === 'string') {
        if (params.conversation.trim().length === 0) {
          warning = 'Conversation is empty';
        }
      } else {
        if (params.conversation.length === 0) {
          warning = 'Conversation is empty';
        }
      }

      // 2. Extract topic (use conversation text for topic extraction)
      const conversationText =
        typeof params.conversation === 'string'
          ? params.conversation
          : JSON.stringify(params.conversation, null, 2);
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
        params.conversation,
        topic,
        params.format || 'plain',
        'full.md'
      );

      const fullMarkdown = formatFullContextMarkdown(
        params.conversation,
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

      return {
        success: true,
        file: mainSummaryPath, // Deprecated: kept for backward compatibility
        summaryFile: mainSummaryPath,
        fullFile: mainFullPath,
        filename: topicFolderName,
        topic,
        date: date.toISOString(),
        message: `${locationMsg}. Next: use codearchitect get_session ${topicFolderName}`,
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

