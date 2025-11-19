/**
 * Parser for Cursor and VS Code chat exports
 * Supports:
 * - Cursor: Markdown format (.md files)
 * - VS Code: JSON format (.json files)
 */

export interface ParsedMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Parses a Cursor export markdown file into structured messages
 * Handles formats like:
 * - **User** / **Cursor** / **Assistant** markers
 * - Code blocks
 * - Separators (---)
 */
export function parseCursorExport(markdown: string): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  const lines = markdown.split('\n');
  
  let currentRole: 'user' | 'assistant' | null = null;
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip header/metadata (first few lines with # or export info)
    if (i < 5 && (line.startsWith('#') || line.includes('Exported on') || line.trim() === '')) {
      continue;
    }
    
    // Check for role markers
    if (line.match(/^\*\*User\*\*$/i) || line.match(/^\*\*User\s*$/i)) {
      // Save previous message if exists
      if (currentRole && currentContent.length > 0) {
        messages.push({
          role: currentRole,
          content: currentContent.join('\n').trim(),
        });
      }
      currentRole = 'user';
      currentContent = [];
      continue;
    }
    
    if (
      line.match(/^\*\*Cursor\*\*$/i) ||
      line.match(/^\*\*Assistant\*\*$/i) ||
      line.match(/^\*\*Cursor\s*$/i) ||
      line.match(/^\*\*Assistant\s*$/i)
    ) {
      // Save previous message if exists
      if (currentRole && currentContent.length > 0) {
        messages.push({
          role: currentRole,
          content: currentContent.join('\n').trim(),
        });
      }
      currentRole = 'assistant';
      currentContent = [];
      continue;
    }
    
    // Skip separator lines
    if (line.trim() === '---' || line.trim() === '') {
      // Only skip if we don't have content yet
      if (currentContent.length === 0) {
        continue;
      }
      // Otherwise, treat as part of content (might be markdown separator)
    }
    
    // Add line to current content
    if (currentRole) {
      currentContent.push(line);
    }
  }
  
  // Save last message
  if (currentRole && currentContent.length > 0) {
    messages.push({
      role: currentRole,
      content: currentContent.join('\n').trim(),
    });
  }
  
  // Filter out empty messages
  return messages.filter(msg => msg.content.trim().length > 0);
}

/**
 * Converts parsed messages to JSON array format
 */
export function messagesToJson(messages: ParsedMessage[]): Array<{ role: string; content: string }> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Parses a VS Code export JSON file into structured messages
 * VS Code exports have a complex nested structure:
 * Format: { "requests": [{ "message": { "text": "..." }, "response": [{ "value": "..." }, ...] }] }
 */
export function parseVSCodeExport(jsonContent: string): ParsedMessage[] {
  try {
    const data = JSON.parse(jsonContent);
    const parsed: ParsedMessage[] = [];
    
    // Handle VS Code's nested format with requests array
    if (data && typeof data === 'object' && 'requests' in data && Array.isArray(data.requests)) {
      for (const request of data.requests) {
        if (!request || typeof request !== 'object') continue;
        
        // Extract user message from request.message.text
        if ('message' in request && request.message && typeof request.message === 'object') {
          const message = request.message as { text?: string; parts?: Array<{ text?: string }> };
          
          if (message.text && typeof message.text === 'string' && message.text.trim()) {
            parsed.push({
              role: 'user',
              content: message.text.trim(),
            });
          } else if (message.parts && Array.isArray(message.parts)) {
            // Extract text from parts array
            const textParts = message.parts
              .map((part: { text?: string }) => part.text)
              .filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
              .join('\n');
            
            if (textParts) {
              parsed.push({
                role: 'user',
                content: textParts.trim(),
              });
            }
          }
        }
        
        // Extract assistant messages from request.response array
        if ('response' in request && Array.isArray(request.response)) {
          const responseParts: string[] = [];
          
          // Tool-related kinds to skip
          const skipKinds = new Set([
            'mcpServersStarting',
            'prepareToolInvocation',
            'toolInvocationSerialized',
            'toolInvocation',
          ]);
          
          for (const responseItem of request.response) {
            if (responseItem && typeof responseItem === 'object') {
              // Check if this is a tool invocation (skip these)
              const kind = 'kind' in responseItem ? responseItem.kind : undefined;
              if (kind && skipKinds.has(String(kind))) {
                continue; // Skip tool invocations
              }
              
              // Look for text content in 'value' field
              if ('value' in responseItem && typeof responseItem.value === 'string' && responseItem.value.trim()) {
                responseParts.push(responseItem.value.trim());
              }
            }
          }
          
          // Combine all response parts into one assistant message
          if (responseParts.length > 0) {
            parsed.push({
              role: 'assistant',
              content: responseParts.join('\n\n').trim(),
            });
          }
        }
      }
      
      return parsed;
    }
    
    // Fallback: Handle simple array format [{ "role": "user", "content": "..." }]
    if (Array.isArray(data)) {
      for (const msg of data) {
        if (msg && typeof msg === 'object' && 'role' in msg && 'content' in msg) {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          parsed.push({ role, content });
        }
      }
      return parsed;
    }
    
    // Fallback: Handle object with messages array
    if (data && typeof data === 'object' && 'messages' in data && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        if (msg && typeof msg === 'object' && 'role' in msg && 'content' in msg) {
          const role = msg.role === 'user' ? 'user' : 'assistant';
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          parsed.push({ role, content });
        }
      }
      return parsed;
    }
    
    return [];
  } catch (error) {
    throw new Error(`Failed to parse VS Code JSON export: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Detects export format and parses accordingly
 */
export function parseExport(content: string, filename: string): ParsedMessage[] {
  if (filename.endsWith('.json')) {
    return parseVSCodeExport(content);
  } else {
    return parseCursorExport(content);
  }
}

/**
 * Converts parsed messages to plain text format
 */
export function messagesToPlainText(messages: ParsedMessage[]): string {
  return messages
    .map(msg => {
      const roleLabel = msg.role === 'user' ? 'USER' : 'ASSISTANT';
      return `${roleLabel}:\n\n${msg.content}`;
    })
    .join('\n\n---\n\n');
}

