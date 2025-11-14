/**
 * TOON (Token-Oriented Object Notation) utility functions
 * Provides ~40% token reduction for uniform data structures when sending to LLMs
 */

import { encode } from '@toon-format/toon';
import type { Message } from '../shared/types.js';

/**
 * Checks if data structure is suitable for TOON encoding
 * TOON works best with uniform arrays of objects
 */
export function shouldUseToon(data: unknown[]): boolean {
  if (!Array.isArray(data) || data.length < 3) {
    return false; // Too small, overhead not worth it
  }

  if (data.length > 1000) {
    return true; // Large datasets benefit
  }

  // Check if all items are objects with same keys (uniform structure)
  if (data.length === 0) return false;
  
  const firstItem = data[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    return false;
  }

  const firstKeys = Object.keys(firstItem).sort();
  
  return data.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const itemKeys = Object.keys(item).sort();
    return (
      itemKeys.length === firstKeys.length &&
      itemKeys.every((key, idx) => key === firstKeys[idx])
    );
  });
}

/**
 * Encodes messages array to TOON format
 * Returns TOON string if suitable, otherwise returns null
 */
export function encodeMessagesToToon(messages: Message[]): string | null {
  if (!shouldUseToon(messages)) {
    return null;
  }

  try {
    return encode(
      {
        messages: messages.map((m) => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : String(m.content),
        })),
      },
      { delimiter: '\t' } // Tabs tokenize better than commas
    );
  } catch (error) {
    // If encoding fails, return null to fall back to JSON
    console.error('[TOON] Encoding failed:', error);
    return null;
  }
}

/**
 * Encodes session metadata to TOON format
 */
export function encodeSessionMetadataToToon(
  sessions: Array<{
    filename: string;
    topic: string;
    date: string;
    file: string;
  }>
): string | null {
  if (!shouldUseToon(sessions)) {
    return null;
  }

  try {
    return encode(
      {
        sessions: sessions.map((s) => ({
          filename: s.filename,
          topic: s.topic,
          date: s.date,
          file: s.file,
        })),
      },
      { delimiter: '\t' }
    );
  } catch (error) {
    console.error('[TOON] Encoding failed:', error);
    return null;
  }
}

/**
 * Formats data for LLM consumption
 * Automatically chooses TOON if beneficial, otherwise uses JSON
 */
export function formatForLLM(
  data: unknown,
  format: 'json' | 'toon' | 'auto' = 'auto'
): { content: string; format: 'json' | 'toon' } {
  if (format === 'json') {
    return {
      content: JSON.stringify(data, null, 2),
      format: 'json',
    };
  }

  if (format === 'toon') {
    try {
      const toonContent = encode(data as Record<string, unknown>, { delimiter: '\t' });
      return {
        content: toonContent,
        format: 'toon',
      };
    } catch {
      // Fallback to JSON if TOON encoding fails
      return {
        content: JSON.stringify(data, null, 2),
        format: 'json',
      };
    }
  }

  // Auto mode: choose best format
  if (Array.isArray(data) && shouldUseToon(data)) {
    try {
      const toonContent = encode(data as Record<string, unknown>[], { delimiter: '\t' });
      return {
        content: toonContent,
        format: 'toon',
      };
    } catch {
      // Fallback to JSON
    }
  }

  return {
    content: JSON.stringify(data, null, 2),
    format: 'json',
  };
}

