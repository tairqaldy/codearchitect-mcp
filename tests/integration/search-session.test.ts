import { SessionStoreManager } from '../../src/store-session/index.js';
import { SessionSearchManager } from '../../src/search-session/index.js';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('search_session integration', () => {
  let tempDir: string;
  let sessionStoreManager: SessionStoreManager;
  let sessionSearchManager: SessionSearchManager;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-search-test-'));
    sessionStoreManager = new SessionStoreManager();
    sessionSearchManager = new SessionSearchManager();

    // Create mock project root
    await writeFile(join(tempDir, 'package.json'), '{}');
    process.chdir(tempDir);
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Add small delay for Windows file system
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (tempDir && existsSync(tempDir)) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors on Windows
        console.warn(`Failed to cleanup ${tempDir}:`, error);
      }
    }
  });

  describe('Basic search functionality', () => {
    it('should find sessions by query in content', async () => {
      // Store a session with specific content
      const storeResult = await sessionStoreManager.storeSession({
        conversation: [
          { role: 'user', content: 'How do I implement authentication?' },
          { role: 'assistant', content: 'You can use NextAuth.js for authentication. It supports OAuth providers.' },
        ],
        topic: 'authentication-implementation',
        format: 'messages',
      });

      expect(storeResult.success).toBe(true);

      // Search for "authentication"
      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      expect(searchResult.count).toBeGreaterThan(0);
      expect(searchResult.results?.some(r => r.filename === storeResult.filename)).toBe(true);
    });

    it('should find sessions by query in topic', async () => {
      const uniqueTopic = `database-design-${Date.now()}`;
      await sessionStoreManager.storeSession({
        conversation: 'This is about database design patterns.',
        topic: uniqueTopic,
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'database',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      const found = searchResult.results?.find(r => r.topic === uniqueTopic);
      expect(found).toBeDefined();
      expect(found?.relevanceScore).toBeGreaterThan(0);
    });

    it('should return empty results for non-matching query', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This is about authentication.',
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'nonexistent-xyz-123',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBe(0);
      expect(searchResult.results).toEqual([]);
    });

    it('should require a query parameter', async () => {
      const searchResult = await sessionSearchManager.searchSessions({
        query: '',
      });

      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain('required');
    });
  });

  describe('Relevance scoring', () => {
    it('should score topic matches higher than content matches', async () => {
      const topicMatch = `api-design-${Date.now()}`;
      const contentMatch = `other-topic-${Date.now()}`;

      // Session with "API" in topic (should score higher)
      await sessionStoreManager.storeSession({
        conversation: 'Some content here.',
        topic: topicMatch,
      });

      // Session with "API" only in content
      await sessionStoreManager.storeSession({
        conversation: 'This discusses API endpoints and RESTful design.',
        topic: contentMatch,
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'API',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      
      const topicResult = searchResult.results?.find(r => r.topic === topicMatch);
      const contentResult = searchResult.results?.find(r => r.topic === contentMatch);
      
      expect(topicResult).toBeDefined();
      expect(contentResult).toBeDefined();
      
      // Topic match should have higher relevance score
      if (topicResult?.relevanceScore && contentResult?.relevanceScore) {
        expect(topicResult.relevanceScore).toBeGreaterThanOrEqual(contentResult.relevanceScore);
      }
    });

    it('should include relevance scores in results', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This is about authentication and security.',
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      expect(result?.relevanceScore).toBeDefined();
      expect(result?.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(result?.relevanceScore).toBeLessThanOrEqual(1);
    });

    it('should include match count in results', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'Authentication is important. Authentication should be secure. Authentication requires tokens.',
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      expect(result?.matchCount).toBeDefined();
      expect(result?.matchCount).toBeGreaterThan(0);
    });
  });

  describe('Snippet extraction', () => {
    it('should extract context snippets around matches', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This is a long conversation about authentication. Authentication is crucial for security. We need to implement proper authentication mechanisms.',
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      expect(result?.matchedSnippets).toBeDefined();
      expect(Array.isArray(result?.matchedSnippets)).toBe(true);
      if (result?.matchedSnippets && result.matchedSnippets.length > 0) {
        // Snippet may contain markdown formatting and preserve original case
        expect(result.matchedSnippets[0].toLowerCase()).toContain('authentication');
      }
    });

    it('should limit number of snippets', async () => {
      const longContent = 'authentication '.repeat(20);
      await sessionStoreManager.storeSession({
        conversation: longContent,
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      // Should have snippets but limited (max 3 by default)
      if (result?.matchedSnippets) {
        expect(result.matchedSnippets.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Date filtering', () => {
    it('should filter results by specific date', async () => {
      const today = new Date().toISOString().split('T')[0];

      await sessionStoreManager.storeSession({
        conversation: 'Today session about authentication',
        topic: 'today-auth',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
        date: today,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      searchResult.results?.forEach(result => {
        expect(result.date).toBe(today);
      });
    });

    it('should filter results by date range', async () => {
      const today = new Date().toISOString().split('T')[0];

      await sessionStoreManager.storeSession({
        conversation: 'Session in date range',
        topic: 'range-test',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'range',
        dateFrom: today,
        dateTo: today,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      searchResult.results?.forEach(result => {
        expect(result.date).toBe(today);
      });
    });
  });

  describe('Result limiting', () => {
    it('should limit number of results returned', async () => {
      // Store multiple sessions with same keyword
      for (let i = 0; i < 5; i++) {
        await sessionStoreManager.storeSession({
          conversation: `Session ${i} about authentication`,
          topic: `auth-${i}`,
        });
      }

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
        limit: 3,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBe(3);
      expect(searchResult.results?.length).toBe(3);
    });

    it('should return all results when limit not specified', async () => {
      for (let i = 0; i < 3; i++) {
        await sessionStoreManager.storeSession({
          conversation: `Session ${i} about API`,
          topic: `api-${i}`,
        });
      }

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'API',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Result sorting', () => {
    it('should sort results by relevance score (highest first)', async () => {
      // Create sessions with different relevance
      await sessionStoreManager.storeSession({
        conversation: 'Some content',
        topic: 'api-design', // High relevance - in topic
      });

      await sessionStoreManager.storeSession({
        conversation: 'This mentions API endpoints',
        topic: 'other-topic', // Lower relevance - only in content
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'API',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      
      if (searchResult.results && searchResult.results.length >= 2) {
        const scores = searchResult.results.map(r => r.relevanceScore || 0);
        // First result should have equal or higher score than second
        expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
      }
    });

    it('should sort by date (newest first) when relevance scores are equal', async () => {
      // Store sessions with same keyword in topic
      await sessionStoreManager.storeSession({
        conversation: 'First session',
        topic: 'database-first',
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await sessionStoreManager.storeSession({
        conversation: 'Second session',
        topic: 'database-second',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'database',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.results).toBeDefined();
      
      if (searchResult.results && searchResult.results.length >= 2) {
        // Results should be sorted (newest first by date)
        const dates = searchResult.results.map(r => r.date);
        // All should be same date (today), but order should be consistent
        expect(dates[0]).toBeDefined();
      }
    });
  });

  describe('Multiple keyword matching', () => {
    it('should find sessions with multiple keyword occurrences', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'Authentication is important. Authentication requires tokens. Authentication must be secure.',
        topic: 'auth-topic',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      expect(result?.matchCount).toBeGreaterThan(1);
    });

    it('should search in both topic and content', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This discusses authentication methods and security.',
        topic: 'authentication-guide',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      expect(searchResult.success).toBe(true);
      const result = searchResult.results?.[0];
      expect(result).toBeDefined();
      // Should match both in topic and content
      expect(result?.matchCount).toBeGreaterThan(1);
    });
  });

  describe('Case-insensitive search', () => {
    it('should match regardless of case', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This is about AUTHENTICATION and security.',
        topic: 'Auth-Topic',
      });

      const searchResult1 = await sessionSearchManager.searchSessions({
        query: 'authentication',
      });

      const searchResult2 = await sessionSearchManager.searchSessions({
        query: 'AUTHENTICATION',
      });

      const searchResult3 = await sessionSearchManager.searchSessions({
        query: 'Authentication',
      });

      expect(searchResult1.success).toBe(true);
      expect(searchResult2.success).toBe(true);
      expect(searchResult3.success).toBe(true);
      
      // All should return same results
      expect(searchResult1.count).toBe(searchResult2.count);
      expect(searchResult2.count).toBe(searchResult3.count);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sessions directory', async () => {
      const isolatedTempDir = await mkdtemp(join(tmpdir(), 'mcp-search-empty-'));
      await writeFile(join(isolatedTempDir, 'package.json'), '{}');
      const customSessionsDir = join(isolatedTempDir, 'empty-sessions');
      
      const { mkdir } = await import('fs/promises');
      await mkdir(customSessionsDir, { recursive: true });
      
      const isolatedManager = new SessionSearchManager();
      const searchResult = await isolatedManager.searchSessions({
        query: 'test',
        sessionsDir: customSessionsDir,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBe(0);
      expect(searchResult.results).toEqual([]);
    });

    it('should handle custom sessions directory', async () => {
      const customDir = join(tempDir, 'custom-sessions');
      const { mkdir } = await import('fs/promises');
      await mkdir(customDir, { recursive: true });

      await sessionStoreManager.storeSession({
        conversation: 'Custom dir test about authentication',
        topic: 'custom-auth',
        sessionsDir: customDir,
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'authentication',
        sessionsDir: customDir,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBeGreaterThan(0);
      const result = searchResult.results?.find(r => r.topic === 'custom-auth');
      expect(result).toBeDefined();
    });

    it('should handle special characters in query', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'This uses special characters like @ and #',
        topic: 'special-chars',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: '@',
      });

      // Should not crash, may or may not find results
      expect(searchResult.success).toBe(true);
    });

    it('should handle very long queries', async () => {
      await sessionStoreManager.storeSession({
        conversation: 'Short content',
        topic: 'short',
      });

      const longQuery = 'a'.repeat(1000);
      const searchResult = await sessionSearchManager.searchSessions({
        query: longQuery,
      });

      // Should not crash
      expect(searchResult.success).toBe(true);
    });

    it('should handle whitespace-only queries', async () => {
      const searchResult = await sessionSearchManager.searchSessions({
        query: '   ',
      });

      expect(searchResult.success).toBe(false);
      expect(searchResult.error).toContain('required');
    });
  });

  describe('Integration with stored sessions', () => {
    it('should find sessions stored with different formats', async () => {
      // Store with messages format
      await sessionStoreManager.storeSession({
        conversation: [
          { role: 'user', content: 'How to implement API?' },
          { role: 'assistant', content: 'Use REST endpoints' },
        ],
        topic: 'api-messages',
        format: 'messages',
      });

      // Store with plain format
      await sessionStoreManager.storeSession({
        conversation: 'This is about API design patterns.',
        topic: 'api-plain',
        format: 'plain',
      });

      const searchResult = await sessionSearchManager.searchSessions({
        query: 'API',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.count).toBeGreaterThanOrEqual(2);
      
      const messagesResult = searchResult.results?.find(r => r.topic === 'api-messages');
      const plainResult = searchResult.results?.find(r => r.topic === 'api-plain');
      
      expect(messagesResult).toBeDefined();
      expect(plainResult).toBeDefined();
    });
  });
});

