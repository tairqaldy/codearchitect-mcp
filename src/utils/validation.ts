import { StoreSessionParams } from '../session/types.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates input parameters for store_session.
 */
export function validateInput(params: StoreSessionParams): ValidationResult {
  // Check conversation exists (null or undefined)
  if (params.conversation === null || params.conversation === undefined) {
    return {
      valid: false,
      error: 'Conversation parameter is required',
    };
  }

  // Check conversation type
  if (typeof params.conversation !== 'string' && !Array.isArray(params.conversation)) {
    return {
      valid: false,
      error: 'Conversation must be a string or array of messages',
    };
  }

  // Empty strings and arrays are allowed - they'll be handled with a warning in SessionManager

  // Check format if provided
  if (params.format && !['plain', 'messages'].includes(params.format)) {
    return {
      valid: false,
      error: 'Format must be either "plain" or "messages"',
    };
  }

  // Check topic length if provided
  if (params.topic && params.topic.length > 100) {
    return {
      valid: false,
      error: 'Topic must be 100 characters or less',
    };
  }

  // Check conversation size (max 10MB)
  const conversationSize = JSON.stringify(params.conversation).length;
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (conversationSize > maxSize) {
    return {
      valid: false,
      error: `Conversation too large (${conversationSize} bytes, max ${maxSize} bytes)`,
    };
  }

  return { valid: true };
}
