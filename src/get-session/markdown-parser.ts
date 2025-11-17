/**
 * Parser utilities for reading markdown session files
 */

import type { Message } from '../shared/types.js';

export interface ParsedSession {
  topic: string;
  date: string;
  content: string;
  messages?: Message[];
}

/**
 * Parses a markdown session file to extract metadata and content
 * Handles both old format and new dual-file format (summary + full context)
 */
export function parseSessionMarkdown(content: string): ParsedSession {
  const lines = content.split('\n');
  let topic = '';
  let date = '';
  let inConversation = false;
  let conversationStart = 0;
  let isFullContext = false;
  let jsonStart = -1;
  let jsonEnd = -1;

  // Check if this is a full context file (has JSON section)
  const hasJsonSection = content.includes('## Full Conversation (JSON)');
  if (hasJsonSection) {
    isFullContext = true;
  }

  // Extract topic from first heading
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract topic from # heading (remove " - Full Context" suffix if present)
    if (line.startsWith('# ') && !topic) {
      topic = line.substring(2).trim().replace(' - Full Context', '');
    }
    
    // Extract date
    if (line.startsWith('**Date:**')) {
      date = line.replace('**Date:**', '').trim();
    }
    
    // Find JSON section in full context files
    if (isFullContext && line.startsWith('```json')) {
      jsonStart = i + 1;
    }
    if (isFullContext && jsonStart >= 0 && line.startsWith('```') && i > jsonStart) {
      jsonEnd = i;
    }
    
    // Find conversation section (old format or human-readable section)
    if (line.startsWith('## Conversation') || line.startsWith('## Human-Readable Format')) {
      inConversation = true;
      conversationStart = i + 1;
      if (!isFullContext) {
        break;
      }
    }
  }

  // Try to parse JSON first (for full context files)
  let messages: Message[] | undefined;
  if (isFullContext && jsonStart >= 0 && jsonEnd > jsonStart) {
    try {
      const jsonContent = lines.slice(jsonStart, jsonEnd).join('\n');
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed)) {
        messages = parsed;
      } else if (parsed.messages && Array.isArray(parsed.messages)) {
        messages = parsed.messages;
      }
    } catch {
      // JSON parsing failed, fall back to markdown parsing
    }
  }

  // Extract conversation content
  const conversationLines: string[] = [];
  if (inConversation) {
    for (let i = conversationStart; i < lines.length; i++) {
      const line = lines[i];
      // Stop at horizontal rule or end
      if (line.startsWith('---')) {
        break;
      }
      conversationLines.push(line);
    }
  }

  const conversationContent = conversationLines.join('\n').trim();

  // If we didn't get messages from JSON, try parsing from markdown
  if (!messages) {
    try {
      messages = parseMessagesFromMarkdown(conversationContent);
    } catch {
      // If parsing fails, leave messages undefined
    }
  }

  return {
    topic: topic || 'Untitled',
    date: date || new Date().toLocaleDateString('en-CA'), // Use local date format
    content: conversationContent || content, // Fallback to full content if no section found
    messages,
  };
}

/**
 * Parses messages from markdown format
 * Handles format: **ROLE:**\n\ncontent\n\n---
 */
function parseMessagesFromMarkdown(content: string): Message[] {
  const messages: Message[] = [];
  const sections = content.split(/\n\n---\n\n/);

  for (const section of sections) {
    const lines = section.split('\n');
    if (lines.length === 0) continue;

    // Check if first line is a role header
    const firstLine = lines[0];
    const roleMatch = firstLine.match(/^\*\*([^*]+):\*\*$/);
    
    if (roleMatch) {
      const role = roleMatch[1].toLowerCase();
      const contentLines = lines.slice(1).join('\n').trim();
      
      if (contentLines) {
        messages.push({
          role,
          content: contentLines,
        });
      }
    }
  }

  return messages.length > 0 ? messages : undefined as unknown as Message[];
}

