/**
 * Manages retrieving stored AI conversation sessions
 */

import type { GetSessionParams, GetSessionResult, SessionInfo } from './types.js';
import type { Message } from '../shared/types.js';
import {
  detectProjectRoot,
  validatePath,
  getSessionsDirectory,
  readFileContent,
  listFiles,
  listDirectories,
  getFileStats,
} from '../shared/filesystem.js';
import { parseSessionMarkdown } from './markdown-parser.js';
import { formatForLLM, encodeMessagesToToon } from './toon-formatter.js';
import { SessionError } from '../shared/errors.js';
import { join } from 'path';

export class SessionRetrievalManager {
  /**
   * Get a specific session by filename
   */
  async getSession(params: GetSessionParams): Promise<GetSessionResult> {
    try {
      if (!params.filename) {
        throw new SessionError('INVALID_INPUT', 'Filename is required');
      }

      // Detect project root
      let projectRoot: string;
      try {
        projectRoot = detectProjectRoot();
      } catch {
        projectRoot = process.cwd();
      }

      // Get sessions directory
      const sessionsDir = getSessionsDirectory(projectRoot, params.sessionsDir);

      // Determine date folder
      const dateFolder = params.date || this.extractDateFromFilename(params.filename);
      const fullSessionsDir = join(sessionsDir, dateFolder);

      // Build file path
      const filePath = join(fullSessionsDir, params.filename);

      // Security check
      if (!validatePath(filePath, sessionsDir)) {
        throw new SessionError('FILE_READ_ERROR', 'Invalid file path detected');
      }

      // Check if file exists
      const stats = getFileStats(filePath);
      if (!stats.exists) {
        return {
          success: false,
          error: `Session file not found: ${params.filename}`,
        };
      }

      // Read file content
      const content = await readFileContent(filePath);
      const parsed = parseSessionMarkdown(content);

      // Format response based on format parameter
      const format = params.format || 'auto';
      let responseContent: string;
      let responseFormat: 'json' | 'toon' = 'json';
      let messages: Message[] | undefined;

      if (parsed.messages && parsed.messages.length > 0) {
        messages = parsed.messages;
        
        // Try TOON encoding for messages if beneficial
        if (format === 'toon' || format === 'auto') {
          const toonContent = encodeMessagesToToon(parsed.messages);
          if (toonContent) {
            responseContent = toonContent;
            responseFormat = 'toon';
          } else {
            // Fallback to JSON
            const formatted = formatForLLM(parsed.messages, 'json');
            responseContent = formatted.content;
          }
        } else {
          const formatted = formatForLLM(parsed.messages, 'json');
          responseContent = formatted.content;
        }
      } else {
        // Plain text content
        responseContent = parsed.content;
      }

      return {
        success: true,
        session: {
          filename: params.filename,
          topic: parsed.topic,
          date: parsed.date,
          file: filePath,
          content: responseContent,
          messages,
          format: responseFormat,
        },
        message: `Session retrieved: ${params.filename}`,
      };
    } catch (error) {
      if (error instanceof SessionError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: `Failed to get session: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List sessions (optionally filtered by date)
   */
  async listSessions(params: GetSessionParams = {}): Promise<GetSessionResult> {
    try {
      // Detect project root
      let projectRoot: string;
      try {
        projectRoot = detectProjectRoot();
      } catch {
        projectRoot = process.cwd();
      }

      // Get sessions directory
      const sessionsDir = getSessionsDirectory(projectRoot, params.sessionsDir);

      const sessions: SessionInfo[] = [];

      if (params.date) {
        // List sessions for specific date
        const dateDir = join(sessionsDir, params.date);
        if (getFileStats(dateDir).exists) {
          const files = await listFiles(dateDir);
          for (const filename of files) {
            if (filename.endsWith('.md')) {
              const filePath = join(dateDir, filename);
              const stats = getFileStats(filePath);
              
              // Try to extract topic from filename or read file
              let topic = this.extractTopicFromFilename(filename);
              try {
                const content = await readFileContent(filePath);
                const parsed = parseSessionMarkdown(content);
                topic = parsed.topic;
              } catch {
                // Use filename-based topic
              }

              sessions.push({
                filename,
                topic,
                date: params.date,
                file: filePath,
                size: stats.size,
              });
            }
          }
        }
      } else {
        // List all sessions from all date folders
        const dateFolders = await listDirectories(sessionsDir);
        
        // Sort dates descending (newest first)
        dateFolders.sort().reverse();

        for (const dateFolder of dateFolders) {
          const dateDir = join(sessionsDir, dateFolder);
          const files = await listFiles(dateDir);
          
          for (const filename of files) {
            if (filename.endsWith('.md')) {
              const filePath = join(dateDir, filename);
              const stats = getFileStats(filePath);
              
              let topic = this.extractTopicFromFilename(filename);
              try {
                const content = await readFileContent(filePath);
                const parsed = parseSessionMarkdown(content);
                topic = parsed.topic;
              } catch {
                // Use filename-based topic
              }

              sessions.push({
                filename,
                topic,
                date: dateFolder,
                file: filePath,
                size: stats.size,
              });
            }
          }
        }
      }

      // Sort by date descending, then by filename
      sessions.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.filename.localeCompare(a.filename);
      });

      // Apply limit
      const limitedSessions = params.limit ? sessions.slice(0, params.limit) : sessions;

      // Format sessions list if TOON format requested
      // Note: TOON formatting for session lists can be applied when sending to LLMs
      // For now, we return structured data; TOON encoding happens in getSession() for message arrays
      const formattedSessions = limitedSessions;

      return {
        success: true,
        sessions: formattedSessions,
        count: limitedSessions.length,
        message: `Found ${limitedSessions.length} session(s)`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Extract date from filename (format: session-YYYYMMDD-HHMMSS-topic.md)
   */
  private extractDateFromFilename(filename: string): string {
    const match = filename.match(/session-(\d{8})-/);
    if (match) {
      const dateStr = match[1];
      // Convert YYYYMMDD to YYYY-MM-DD
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    // Fallback to today's date
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract topic from filename
   */
  private extractTopicFromFilename(filename: string): string {
    // Remove extension and session prefix
    const withoutExt = filename.replace(/\.md$/, '');
    const parts = withoutExt.split('-');
    // Topic is usually after date-time parts
    if (parts.length > 3) {
      return parts.slice(3).join('-').replace(/-/g, ' ');
    }
    return 'Untitled';
  }
}

