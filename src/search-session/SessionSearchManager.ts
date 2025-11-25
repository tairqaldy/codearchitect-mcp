/**
 * Manages searching through stored AI conversation sessions
 */

import type { SearchSessionParams, SearchResult, SearchSessionResult } from './types.js';
import {
  getSessionsDirectory,
  readFileContent,
  listFiles,
  listDirectories,
  getFileStats,
} from '../shared/filesystem.js';
import { parseSessionMarkdown } from '../get-session/markdown-parser.js';
import { SessionError } from '../shared/errors.js';
import { join } from 'path';

export class SessionSearchManager {
  /**
   * Search sessions by query
   */
  async searchSessions(params: SearchSessionParams): Promise<SearchSessionResult> {
    try {
      if (!params.query || params.query.trim().length === 0) {
        return {
          success: false,
          error: 'Search query is required',
        };
      }

      const query = params.query.toLowerCase().trim();
      const sessionsDir = getSessionsDirectory('', params.sessionsDir);
      const results: SearchResult[] = [];

      // Get all date folders
      const dateFolders = await listDirectories(sessionsDir).catch(() => []);

      // Filter by date if specified
      let filteredDateFolders = dateFolders;
      if (params.date) {
        filteredDateFolders = dateFolders.filter(d => d === params.date);
      } else if (params.dateFrom || params.dateTo) {
        filteredDateFolders = dateFolders.filter(d => {
          if (params.dateFrom && d < params.dateFrom) return false;
          if (params.dateTo && d > params.dateTo) return false;
          return true;
        });
      }

      // Sort dates descending (newest first)
      filteredDateFolders.sort().reverse();

      // Search through each date folder
      for (const dateFolder of filteredDateFolders) {
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
            // Prefer full.md for search (more content), fallback to summary.md
            const searchFile = hasFull ? 'full.md' : 'summary.md';
            const filePath = join(topicFolderPath, searchFile);
            const stats = getFileStats(filePath);

            if (stats.exists) {
              const searchResult = await this.searchInFile(filePath, query, {
                filename: topicFolder,
                date: dateFolder,
                file: filePath,
                size: stats.size,
              });

              if (searchResult) {
                results.push(searchResult);
              }
            }
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

        // Search in old structure files
        for (const [baseName, files] of fileMap.entries()) {
          // Prefer full file for search, fallback to summary, then old format
          const preferredFile = files.full || files.summary || baseName;
          const filePath = join(dateDir, preferredFile);
          const stats = getFileStats(filePath);

          if (stats.exists) {
            const searchResult = await this.searchInFile(filePath, query, {
              filename: files.full || files.summary ? baseName : preferredFile,
              date: dateFolder,
              file: filePath,
              size: stats.size,
            });

            if (searchResult) {
              results.push(searchResult);
            }
          }
        }
      }

      // Sort by relevance score (highest first), then by date (newest first)
      results.sort((a, b) => {
        const scoreA = a.relevanceScore || 0;
        const scoreB = b.relevanceScore || 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return b.date.localeCompare(a.date);
      });

      // Apply limit
      const limitedResults = params.limit ? results.slice(0, params.limit) : results;

      return {
        success: true,
        results: limitedResults,
        count: limitedResults.length,
        query: params.query,
        message: `Found ${limitedResults.length} matching session(s) for "${params.query}"`,
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
        error: `Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Search for query in a session file
   */
  private async searchInFile(
    filePath: string,
    query: string,
    baseInfo: { filename: string; date: string; file: string; size?: number }
  ): Promise<SearchResult | null> {
    try {
      const content = await readFileContent(filePath);
      const parsed = parseSessionMarkdown(content);

      // Search in topic
      const topicMatches = this.countMatches(parsed.topic, query);
      
      // Search in content
      const contentMatches = this.countMatches(parsed.content, query);
      
      // Search in messages if available
      let messageMatches = 0;
      if (parsed.messages) {
        for (const message of parsed.messages) {
          // Handle content that might be string or unknown
          const content = typeof message.content === 'string' ? message.content : String(message.content || '');
          messageMatches += this.countMatches(content, query);
        }
      }

      const totalMatches = topicMatches + contentMatches + messageMatches;

      // Only return if there are matches
      if (totalMatches === 0) {
        return null;
      }

      // Calculate relevance score (simple heuristic)
      // Topic matches are weighted higher, then content, then messages
      const topicScore = topicMatches * 3;
      const contentScore = contentMatches * 2;
      const messageScore = messageMatches;
      const totalScore = topicScore + contentScore + messageScore;
      
      // Normalize to 0-1 range (simple normalization)
      const relevanceScore = Math.min(1, totalScore / 10);

      // Extract snippets (context around matches)
      const snippets = this.extractSnippets(parsed.content, query, 3);

      return {
        filename: baseInfo.filename,
        topic: parsed.topic,
        date: baseInfo.date,
        file: baseInfo.file,
        size: baseInfo.size,
        relevanceScore,
        matchedSnippets: snippets,
        matchCount: totalMatches,
      };
    } catch {
      // If file can't be read or parsed, skip it
      return null;
    }
  }

  /**
   * Count occurrences of query in text (case-insensitive)
   */
  private countMatches(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let count = 0;
    let index = 0;
    
    while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
      count++;
      index += lowerQuery.length;
    }
    
    return count;
  }

  /**
   * Extract context snippets around matches
   */
  private extractSnippets(content: string, query: string, maxSnippets: number = 3): string[] {
    const snippets: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const snippetLength = 150; // Characters before and after match
    let index = 0;
    let foundCount = 0;

    while (foundCount < maxSnippets && (index = lowerContent.indexOf(lowerQuery, index)) !== -1) {
      const start = Math.max(0, index - snippetLength);
      const end = Math.min(content.length, index + lowerQuery.length + snippetLength);
      const snippet = content.substring(start, end).trim();
      
      // Add ellipsis if not at start/end
      const prefix = start > 0 ? '...' : '';
      const suffix = end < content.length ? '...' : '';
      
      snippets.push(`${prefix}${snippet}${suffix}`);
      
      index += lowerQuery.length;
      foundCount++;
    }

    return snippets;
  }
}

