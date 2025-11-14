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
 */
export function parseSessionMarkdown(content: string): ParsedSession {
  const lines = content.split('\n');
  let topic = '';
  let date = '';
  let inConversation = false;
  let conversationStart = 0;

  // Extract topic from first heading
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract topic from # heading
    if (line.startsWith('# ') && !topic) {
      topic = line.substring(2).trim();
    }
    
    // Extract date
    if (line.startsWith('**Date:**')) {
      date = line.replace('**Date:**', '').trim();
    }
    
    // Find conversation section
    if (line.startsWith('## Conversation')) {
      inConversation = true;
      conversationStart = i + 1;
      break;
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

  // Try to parse messages if format is structured
  let messages: Message[] | undefined;
  try {
    messages = parseMessagesFromMarkdown(conversationContent);
  } catch {
    // If parsing fails, leave messages undefined
  }

  return {
    topic: topic || 'Untitled',
    date: date || new Date().toISOString(),
    content: conversationContent,
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

