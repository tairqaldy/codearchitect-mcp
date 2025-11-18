/**
 * Manages retrieving stored AI conversation sessions
 */

import type { GetSessionParams, GetSessionResult, SessionInfo } from './types.js';
import type { Message } from '../shared/types.js';
import {
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

      // Get sessions directory - always use main folder (no project detection)
      const sessionsDir = getSessionsDirectory('', params.sessionsDir);

      // Determine date folder
      const dateFolder = params.date || this.extractDateFromFilename(params.filename);
      const fullSessionsDir = join(sessionsDir, dateFolder);

      // Try new folder structure first (topic folders), then fallback to old structure
      let filePath: string | undefined;
      let actualFilename: string = params.filename;
      let found = false;

      // Check if this is a topic folder name (new structure)
      // Topic folders contain summary.md and full.md files
      const topicFolders = await listDirectories(fullSessionsDir).catch(() => []);
      
      for (const topicFolder of topicFolders) {
        const topicFolderPath = join(fullSessionsDir, topicFolder);
        
        // Check if filename matches topic folder or files inside
        if (params.filename === topicFolder || 
            params.filename.startsWith(`${topicFolder}/`) ||
            params.filename === 'summary.md' || 
            params.filename === 'full.md') {
          
          // Determine which file to read
          let targetFile = 'full.md'; // Default to full
          
          if (params.filename.endsWith('summary.md') || params.filename.includes('summary')) {
            targetFile = 'summary.md';
          } else if (params.filename.endsWith('full.md') || params.filename.includes('full')) {
            targetFile = 'full.md';
          }
          
          const candidatePath = join(topicFolderPath, targetFile);
          if (getFileStats(candidatePath).exists) {
            filePath = candidatePath;
            actualFilename = topicFolder; // Use folder name as identifier
            found = true;
            break;
          }
          
          // Try the other file if preferred doesn't exist
          const altFile = targetFile === 'full.md' ? 'summary.md' : 'full.md';
          const altPath = join(topicFolderPath, altFile);
          if (getFileStats(altPath).exists) {
            filePath = altPath;
            actualFilename = topicFolder; // Use folder name as identifier
            found = true;
            break;
          }
        }
      }

      // Fallback to old structure (files directly in date folder)
      if (!found) {
        if (params.filename.endsWith('-summary.md') || params.filename.endsWith('-full.md')) {
          // User specified specific file type
          const candidatePath = join(fullSessionsDir, params.filename);
          if (getFileStats(candidatePath).exists) {
            filePath = candidatePath;
            found = true;
          }
        } else if (params.filename.endsWith('.md')) {
          // Old format file (no suffix)
          const candidatePath = join(fullSessionsDir, params.filename);
          if (getFileStats(candidatePath).exists) {
            filePath = candidatePath;
            found = true;
          }
        } else {
          // Base filename without extension - prefer full context file
          const fullFilename = `${params.filename}-full.md`;
          const fullPath = join(fullSessionsDir, fullFilename);
          const summaryFilename = `${params.filename}-summary.md`;
          const summaryPath = join(fullSessionsDir, summaryFilename);
          
          // Check which file exists
          if (getFileStats(fullPath).exists) {
            filePath = fullPath;
            actualFilename = fullFilename;
            found = true;
          } else if (getFileStats(summaryPath).exists) {
            filePath = summaryPath;
            actualFilename = summaryFilename;
            found = true;
          } else {
            // Fallback to old format
            const oldFormatPath = join(fullSessionsDir, `${params.filename}.md`);
            if (getFileStats(oldFormatPath).exists) {
              filePath = oldFormatPath;
              actualFilename = `${params.filename}.md`;
              found = true;
            }
          }
        }
      }

      if (!found || !filePath) {
        return {
          success: false,
          error: `Session file not found: ${params.filename}`,
        };
      }

      // Security check
      if (!validatePath(filePath, sessionsDir)) {
        throw new SessionError('FILE_READ_ERROR', 'Invalid file path detected');
      }

      // Check if file exists
      const stats = getFileStats(filePath);
      if (!stats.exists) {
        return {
          success: false,
          error: `Session file not found: ${actualFilename}`,
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
          filename: actualFilename,
          topic: parsed.topic,
          date: parsed.date,
          file: filePath,
          content: responseContent,
          messages,
          format: responseFormat,
        },
        message: `Session retrieved: ${actualFilename}`,
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
      // Get sessions directory - always use main folder (no project detection)
      const sessionsDir = getSessionsDirectory('', params.sessionsDir);

      const sessions: SessionInfo[] = [];

      if (params.date) {
        // List sessions for specific date
        const dateDir = join(sessionsDir, params.date);
        if (getFileStats(dateDir).exists) {
          // Check for new structure: topic folders
          const topicFolders = await listDirectories(dateDir).catch(() => []);
          const files = await listFiles(dateDir).catch(() => []);
          
          // Process topic folders (new structure)
          for (const topicFolder of topicFolders) {
            const topicFolderPath = join(dateDir, topicFolder);
            const topicFiles: string[] = await listFiles(topicFolderPath).catch(() => []);
            
            // Check if this folder contains summary.md or full.md
            const hasSummary = topicFiles.includes('summary.md');
            const hasFull = topicFiles.includes('full.md');
            
            if (hasSummary || hasFull) {
              // This is a topic folder with session files
              const preferredFile = hasFull ? 'full.md' : 'summary.md';
              const filePath = join(topicFolderPath, preferredFile);
              const stats = getFileStats(filePath);
              
              let topic = topicFolder; // Use folder name as topic
              try {
                const content = await readFileContent(filePath);
                const parsed = parseSessionMarkdown(content);
                topic = parsed.topic || topicFolder;
              } catch {
                // Use folder name as topic
              }

              sessions.push({
                filename: topicFolder, // Use folder name as identifier
                topic,
                date: params.date,
                file: filePath,
                size: stats.size,
              });
            }
          }
          
          // Process old structure: files directly in date folder
          const fileMap = new Map<string, { summary?: string; full?: string }>();
          
          for (const filename of files) {
            if (filename.endsWith('.md')) {
              if (filename.endsWith('-summary.md')) {
                const base = filename.replace('-summary.md', '');
                if (!fileMap.has(base)) {
                  fileMap.set(base, {});
                }
                fileMap.get(base)!.summary = filename;
              } else if (filename.endsWith('-full.md')) {
                const base = filename.replace('-full.md', '');
                if (!fileMap.has(base)) {
                  fileMap.set(base, {});
                }
                fileMap.get(base)!.full = filename;
              } else {
                // Old format - use filename as-is
                fileMap.set(filename, {});
              }
            }
          }

          // Process grouped files (old structure)
          for (const [baseName, files] of fileMap.entries()) {
            // Prefer full file for metadata, fallback to summary, then old format
            const preferredFile = files.full || files.summary || baseName;
            const filePath = join(dateDir, preferredFile);
            const stats = getFileStats(filePath);
            
            // Try to extract topic from filename or read file
            let topic = this.extractTopicFromFilename(baseName);
            try {
              const content = await readFileContent(filePath);
              const parsed = parseSessionMarkdown(content);
              topic = parsed.topic;
            } catch {
              // Use filename-based topic
            }

            // Use base filename for display (without suffix)
            const displayFilename = files.full || files.summary ? baseName : preferredFile;

            sessions.push({
              filename: displayFilename,
              topic,
              date: params.date,
              file: filePath,
              size: stats.size,
            });
          }
        }
      } else {
        // List all sessions from all date folders
        const dateFolders = await listDirectories(sessionsDir);
        
        // Sort dates descending (newest first)
        dateFolders.sort().reverse();

        for (const dateFolder of dateFolders) {
          const dateDir = join(sessionsDir, dateFolder);
          
          // Check for new structure: topic folders
          const topicFolders = await listDirectories(dateDir).catch(() => []);
          const files = await listFiles(dateDir).catch(() => []);
          
          // Process topic folders (new structure)
          for (const topicFolder of topicFolders) {
            const topicFolderPath = join(dateDir, topicFolder);
            const topicFiles: string[] = await listFiles(topicFolderPath).catch(() => []);
            
            // Check if this folder contains summary.md or full.md
            const hasSummary = topicFiles.includes('summary.md');
            const hasFull = topicFiles.includes('full.md');
            
            if (hasSummary || hasFull) {
              // This is a topic folder with session files
              const preferredFile = hasFull ? 'full.md' : 'summary.md';
              const filePath = join(topicFolderPath, preferredFile);
              const stats = getFileStats(filePath);
              
              let topic = topicFolder; // Use folder name as topic
              try {
                const content = await readFileContent(filePath);
                const parsed = parseSessionMarkdown(content);
                topic = parsed.topic || topicFolder;
              } catch {
                // Use folder name as topic
              }

              sessions.push({
                filename: topicFolder, // Use folder name as identifier
                topic,
                date: dateFolder,
                file: filePath,
                size: stats.size,
              });
            }
          }
          
          // Process old structure: files directly in date folder
          const fileMap = new Map<string, { summary?: string; full?: string }>();
          
          for (const filename of files) {
            if (filename.endsWith('.md')) {
              if (filename.endsWith('-summary.md')) {
                const base = filename.replace('-summary.md', '');
                if (!fileMap.has(base)) {
                  fileMap.set(base, {});
                }
                fileMap.get(base)!.summary = filename;
              } else if (filename.endsWith('-full.md')) {
                const base = filename.replace('-full.md', '');
                if (!fileMap.has(base)) {
                  fileMap.set(base, {});
                }
                fileMap.get(base)!.full = filename;
              } else {
                // Old format - use filename as-is
                fileMap.set(filename, {});
              }
            }
          }

          // Process grouped files (old structure)
          for (const [baseName, files] of fileMap.entries()) {
            // Prefer full file for metadata, fallback to summary, then old format
            const preferredFile = files.full || files.summary || baseName;
            const filePath = join(dateDir, preferredFile);
            const stats = getFileStats(filePath);
            
            let topic = this.extractTopicFromFilename(baseName);
            try {
              const content = await readFileContent(filePath);
              const parsed = parseSessionMarkdown(content);
              topic = parsed.topic;
            } catch {
              // Use filename-based topic
            }

            // Use base filename for display (without suffix)
            const displayFilename = files.full || files.summary ? baseName : preferredFile;

            sessions.push({
              filename: displayFilename,
              topic,
              date: dateFolder,
              file: filePath,
              size: stats.size,
            });
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
    // Fallback to today's date (local timezone)
    return new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
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

