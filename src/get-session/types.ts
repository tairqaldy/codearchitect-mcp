/**
 * Types for get_session feature
 */

import type { Message } from '../shared/types.js';

export interface GetSessionParams {
  filename?: string; // Specific session filename
  date?: string; // Date folder (YYYY-MM-DD format)
  sessionsDir?: string; // Custom sessions directory
  format?: 'json' | 'toon' | 'auto'; // Output format for LLM optimization
  limit?: number; // Limit number of sessions returned (for list)
}

export interface SessionInfo {
  filename: string;
  topic: string;
  date: string;
  file: string;
  size?: number; // File size in bytes
}

export interface GetSessionResult {
  success: boolean;
  sessions?: SessionInfo[];
  session?: {
    filename: string;
    topic: string;
    date: string;
    file: string;
    content: string; // Session content (markdown)
    messages?: Message[]; // Parsed messages if format is 'messages'
    format?: 'json' | 'toon'; // Format used for response
  };
  count?: number;
  message?: string;
  error?: string;
  warning?: string;
}

