import { StoreSessionParams, StoreSessionResult } from './types.js';
import { detectProjectRoot, ensureDirectory, generateFilename, writeFile, validatePath } from '../utils/filesystem.js';
import { extractTopic } from '../utils/topic.js';
import { formatMarkdown } from '../utils/markdown.js';
import { validateInput } from '../utils/validation.js';
import { SessionError } from './errors.js';
import { join } from 'path';

export class SessionManager {
  async storeSession(params: StoreSessionParams): Promise<StoreSessionResult> {
    try {
      // 1. Validate input
      const validation = validateInput(params);
      if (!validation.valid) {
        throw new SessionError('INVALID_INPUT', validation.error!);
      }

      // Handle empty conversation (edge case)
      let conversationText: string;
      let warning: string | undefined;

      if (typeof params.conversation === 'string') {
        conversationText = params.conversation;
        if (conversationText.trim().length === 0) {
          warning = 'Conversation is empty';
        }
      } else {
        conversationText = JSON.stringify(params.conversation, null, 2);
        if (params.conversation.length === 0) {
          warning = 'Conversation is empty';
        }
      }

      // Handle very long conversations (edge case)
      const maxSize = 1024 * 1024; // 1MB
      if (conversationText.length > maxSize) {
        conversationText = conversationText.substring(0, maxSize) + '\n\n... (truncated)';
        warning = 'Conversation truncated to 1MB';
      }

      // 2. Extract topic
      const topic = extractTopic(conversationText, params.topic);

      // 3. Detect project root
      let projectRoot: string;
      try {
        projectRoot = detectProjectRoot();
      } catch (error) {
        // Non-fatal: use current directory
        projectRoot = process.cwd();
        warning = warning ? `${warning}; Using current directory as project root` : 'Using current directory as project root';
      }

      const sessionsDir = join(projectRoot, '.codearchitect', 'sessions');
      const date = new Date();
      const dateFolder = date.toISOString().split('T')[0];
      const fullSessionsDir = join(sessionsDir, dateFolder);

      // 4. Ensure directory exists
      try {
        await ensureDirectory(fullSessionsDir);
      } catch (error) {
        throw new SessionError(
          'DIRECTORY_CREATION_ERROR',
          'Failed to create sessions directory',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 5. Generate filename
      let filename: string;
      try {
        filename = await generateFilename(date, topic, sessionsDir);
      } catch (error) {
        throw new SessionError(
          'FILENAME_GENERATION_ERROR',
          'Failed to generate filename',
          error instanceof Error ? error.message : String(error)
        );
      }

      // 6. Format markdown
      const markdown = formatMarkdown(
        params.conversation,
        topic,
        params.format || 'plain'
      );

      // 7. Write file
      const filePath = join(fullSessionsDir, filename);

      // Security check: validate path
      if (!validatePath(filePath, projectRoot)) {
        throw new SessionError('FILE_WRITE_ERROR', 'Invalid file path detected');
      }

      try {
        await writeFile(filePath, markdown, 'utf-8');
      } catch (error) {
        throw new SessionError(
          'FILE_WRITE_ERROR',
          'Failed to write session file',
          error instanceof Error ? error.message : String(error)
        );
      }

      return {
        success: true,
        file: filePath,
        filename,
        topic,
        date: date.toISOString(),
        message: `Session saved to ${filename}`,
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
