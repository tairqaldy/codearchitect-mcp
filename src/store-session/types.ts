/**
 * Types for store_session feature
 */

import type { Message } from '../shared/types.js';

export interface StoreSessionParams {
  conversation: string | Message[];
  topic?: string;
  format?: 'plain' | 'messages';
  sessionsDir?: string; // Optional: Custom directory for storing sessions
}

export interface StoreSessionResult {
  success: boolean;
  file?: string; // Deprecated: kept for backward compatibility, use summaryFile and fullFile
  summaryFile?: string; // Path to summary file
  fullFile?: string; // Path to full context file
  filename?: string; // Base filename without suffix
  topic?: string;
  date?: string;
  message?: string;
  error?: string;
  details?: string;
  warning?: string;
}

