/**
 * Extracts a topic from conversation text or uses the provided topic.
 */
export function extractTopic(conversation: string, providedTopic?: string): string {
  // Priority 1: User-provided topic
  if (providedTopic?.trim()) {
    return sanitizeTopic(providedTopic.trim());
  }

  // Priority 2: Extract from conversation
  const lines = conversation.split('\n').filter((line) => line.trim());

  // Look for first user message
  for (const line of lines) {
    const userMatch = line.match(/^(user|User|USER):\s*(.+)/i);
    if (userMatch) {
      const content = userMatch[2].trim();
      if (content.length > 5 && content.length < 100) {
        return sanitizeTopic(content);
      }
    }
  }

  // Priority 3: First non-empty line (if reasonable length)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 5 && firstLine.length < 100 && !firstLine.startsWith('AI:')) {
      return sanitizeTopic(firstLine);
    }
  }

  // Priority 4: Extract keywords from first 200 chars
  const preview = conversation.substring(0, 200);
  const keywords = extractKeywords(preview);
  if (keywords.length > 0) {
    return sanitizeTopic(keywords.join('-'));
  }

  // Fallback: timestamp-based
  return `session-${Date.now()}`;
}

/**
 * Sanitizes a topic string to be URL-safe and reasonable length.
 */
function sanitizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to one
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Max 50 chars
}

/**
 * Extracts keywords from text (simple implementation).
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction: find capitalized words or common tech terms
  const words = text
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .filter((word) => /^[A-Z]/.test(word) || /^(implement|add|create|fix|refactor|update)/i.test(word))
    .slice(0, 3);

  return words.map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ''));
}

