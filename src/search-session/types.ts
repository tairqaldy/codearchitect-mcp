/**
 * Types for search_session feature
 */

import type { SessionInfo } from '../get-session/types.js';

export interface SearchSessionParams {
  query: string; // Search query
  date?: string; // Filter by date (YYYY-MM-DD format)
  dateFrom?: string; // Filter from date (YYYY-MM-DD format)
  dateTo?: string; // Filter to date (YYYY-MM-DD format)
  limit?: number; // Limit number of results
  sessionsDir?: string; // Custom sessions directory
}

export interface SearchResult extends SessionInfo {
  relevanceScore?: number; // Simple relevance score (0-1)
  matchedSnippets?: string[]; // Context snippets where query was found
  matchCount?: number; // Number of matches found
}

export interface SearchSessionResult {
  success: boolean;
  results?: SearchResult[];
  count?: number;
  query?: string;
  message?: string;
  error?: string;
}


