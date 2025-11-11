import { StoreSessionParams, StoreSessionResult } from './types.js';
import { detectProjectRoot, ensureDirectory, generateFilename, writeFile, validatePath, getSessionsDirectory } from '../utils/filesystem.js';
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
      const dateFolder = date.toISOString().split('T')[0];
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

      // 6. Generate filename
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

      // 7. Format markdown
      const markdown = formatMarkdown(
        params.conversation,
        topic,
        params.format || 'plain'
      );

      // 8. Write file
      const filePath = join(fullSessionsDir, filename);

      // Security check: validate path
      // If custom directory is outside project, validate against sessionsDir instead
      const validationBase = params.sessionsDir || process.env.CODEARCHITECT_SESSIONS_DIR 
        ? sessionsDir 
        : projectRoot;
      
      if (!validatePath(filePath, validationBase)) {
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
