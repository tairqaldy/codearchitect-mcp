import { extractTopic } from '../../src/store-session/topic-extractor.js';

describe('TopicExtraction', () => {
  it('should use provided topic', () => {
    const topic = extractTopic('some conversation', 'provided-topic');
    expect(topic).toBe('provided-topic');
  });

  it('should extract from "User: implement auth"', () => {
    const topic = extractTopic('User: implement auth');
    expect(topic).toBe('implement-auth');
  });

  it('should extract from first user message', () => {
    const conversation = 'User: add database connection\nAI: Let me help...';
    const topic = extractTopic(conversation);
    expect(topic).toBe('add-database-connection');
  });

  it('should extract from first line if no user prefix', () => {
    const conversation = 'implement authentication system';
    const topic = extractTopic(conversation);
    expect(topic.length).toBeGreaterThan(0);
  });

  it('should handle special characters', () => {
    const topic = extractTopic('test', 'Hello World! @#$%');
    expect(topic).toBe('hello-world');
    expect(topic).not.toMatch(/[@#$%!]/);
  });

  it('should truncate long topics', () => {
    const longTopic = 'a'.repeat(100);
    const topic = extractTopic('test', longTopic);
    expect(topic.length).toBeLessThanOrEqual(50);
  });

  it('should fallback to timestamp if no topic found', () => {
    const topic = extractTopic('   ');
    expect(topic).toMatch(/^session-\d+$/);
  });

  it('should sanitize topic properly', () => {
    const topic = extractTopic('test', '  Multiple   Spaces---Here  ');
    expect(topic).toBe('multiple-spaces-here');
    expect(topic).not.toMatch(/\s/);
    expect(topic).not.toMatch(/--+/);
  });
});

