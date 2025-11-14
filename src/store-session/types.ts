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
  file?: string;
  filename?: string;
  topic?: string;
  date?: string;
  message?: string;
  error?: string;
  details?: string;
  warning?: string;
}

