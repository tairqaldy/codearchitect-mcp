/**
 * Manages storing AI conversation sessions as markdown files
 */

import type { StoreSessionParams, StoreSessionResult } from './types.js';
import {
  detectProjectRoot,
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
import { join } from 'path';

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

      // 3. Detect project root
      // Try to detect from workspace environment variables first, then fall back to process.cwd()
      let projectRoot: string;
      try {
        // Pass undefined to use workspace detection from environment variables
        projectRoot = detectProjectRoot();
      } catch (error) {
        // Non-fatal: use current directory
        projectRoot = process.cwd();
        warning = warning ? `${warning}; Using current directory as project root` : 'Using current directory as project root';
      }

      // 4. Get sessions directory (custom, env var, or default)
      const sessionsDir = getSessionsDirectory(projectRoot, params.sessionsDir);

      // Ensure sessions directory exists
      try {
        await ensureDirectory(sessionsDir);
      } catch (error) {
        throw new SessionError(
          'DIRECTORY_CREATION_ERROR',
          'Failed to create sessions directory',
          error instanceof Error ? error.message : String(error)
        );
      }

      const date = new Date();
      // Use local date instead of UTC to match user's timezone
      const dateFolder = date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      const fullSessionsDir = join(sessionsDir, dateFolder);

      // 5. Ensure date folder exists
      try {
        await ensureDirectory(fullSessionsDir);
      } catch (error) {
        throw new SessionError(
          'DIRECTORY_CREATION_ERROR',
          'Failed to create date directory',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 6. Generate topic folder name
      let topicFolderName: string;
      try {
        topicFolderName = await generateTopicFolderName(date, topic, sessionsDir);
      } catch (error) {
        throw new SessionError(
          'FILENAME_GENERATION_ERROR',
          'Failed to generate topic folder name',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 7. Create topic folder inside date folder
      const topicFolderPath = join(fullSessionsDir, topicFolderName);
      try {
        await ensureDirectory(topicFolderPath);
      } catch (error) {
        throw new SessionError(
          'DIRECTORY_CREATION_ERROR',
          'Failed to create topic directory',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 8. Generate filenames for both files (simple names inside topic folder)
      const summaryFilename = 'summary.md';
      const fullFilename = 'full.md';
      const summaryFilePath = join(topicFolderPath, summaryFilename);
      const fullFilePath = join(topicFolderPath, fullFilename);

      // Security check: validate paths
      const validationBase = params.sessionsDir || process.env.CODEARCHITECT_SESSIONS_DIR 
        ? sessionsDir 
        : projectRoot;
      
      if (!validatePath(summaryFilePath, validationBase) || !validatePath(fullFilePath, validationBase)) {
        throw new SessionError('FILE_WRITE_ERROR', 'Invalid file path detected');
      }

      // 9. Format markdown for both files
      const summaryMarkdown = formatSummaryMarkdown(
        params.conversation,
        topic,
        params.format || 'plain',
        fullFilename
      );

      const fullMarkdown = formatFullContextMarkdown(
        params.conversation,
        topic,
        params.format || 'plain',
        summaryFilename
      );

      // 10. Write both files
      try {
        await writeFile(summaryFilePath, summaryMarkdown, 'utf-8');
        await writeFile(fullFilePath, fullMarkdown, 'utf-8');
      } catch (error) {
        throw new SessionError(
          'FILE_WRITE_ERROR',
          'Failed to write session files',
          error instanceof Error ? error.message : String(error)
        );
      }

      return {
        success: true,
        file: summaryFilePath, // Deprecated: kept for backward compatibility
        summaryFile: summaryFilePath,
        fullFile: fullFilePath,
        filename: topicFolderName, // Topic folder name (base filename)
        topic,
        date: date.toISOString(),
        message: `Session saved in folder ${topicFolderName}: ${summaryFilename} and ${fullFilename}`,
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

