/**
 * Types for store_session feature
 */

import type { Message } from '../shared/types.js';

export interface StoreSessionParams {
  conversation?: string | Message[]; // Optional: if not provided, will try to find export file
  topic?: string;
  format?: 'plain' | 'messages';
  sessionsDir?: string; // Optional: Custom directory for storing sessions
  projectDir?: string; // Optional: Project directory - if specified, saves to both config folder and project folder
  exportFilename?: string; // Optional: Pattern to match specific export file (e.g., "resolve_mcp")
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

