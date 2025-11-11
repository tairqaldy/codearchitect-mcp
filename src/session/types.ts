export interface StoreSessionParams {
  conversation: string | Message[];
  topic?: string;
  format?: 'plain' | 'messages';
  sessionsDir?: string; // Optional: Custom directory for storing sessions
}

export interface Message {
  role: string;
  content: string | unknown;
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
