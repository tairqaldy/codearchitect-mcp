import { SessionStoreManager } from '../../src/store-session/index.js';
import type { StoreSessionParams } from '../../src/store-session/types.js';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('SessionManager', () => {
  let tempDir: string;
  let sessionStoreManager: SessionStoreManager;
  const originalCwd = process.cwd();

  beforeEach(() => {
    sessionStoreManager = new SessionStoreManager();
  });

  describe('storeSession', () => {
    beforeEach(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'mcp-test-'));
      // Create a mock project root
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

    it('should save session successfully with plain text', async () => {
      const params: StoreSessionParams = {
        conversation: 'User: test\nAI: response',
        topic: 'test-session',
        format: 'plain',
      };

      const result = await sessionStoreManager.storeSession(params);

      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
      expect(result.filename).toBeDefined();
      expect(result.topic).toBe('test-session');
      expect(result.date).toBeDefined();
      expect(result.message).toBeDefined();

      if (result.file) {
        expect(existsSync(result.file)).toBe(true);
      }
    });

    it('should save session successfully with messages array', async () => {
      const params: StoreSessionParams = {
        conversation: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        format: 'messages',
      };

      const result = await sessionStoreManager.storeSession(params);

      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
    });

    it('should handle filename collisions', async () => {
      const params: StoreSessionParams = {
        conversation: 'test',
        topic: 'collision-test',
      };

      // Create first file
      const result1 = await sessionStoreManager.storeSession(params);
      expect(result1.success).toBe(true);

      // Create second file with same topic (should get -1 suffix)
      const result2 = await sessionStoreManager.storeSession(params);
      expect(result2.success).toBe(true);
      expect(result2.filename).toContain('-1.md');
    });

    it('should extract topic from conversation if not provided', async () => {
      const params: StoreSessionParams = {
        conversation: 'User: implement authentication system',
        format: 'plain',
      };

      const result = await sessionStoreManager.storeSession(params);

      expect(result.success).toBe(true);
      expect(result.topic).toBeDefined();
      expect(result.topic).not.toBe('');
    });

    it('should handle empty conversation with warning', async () => {
      const params: StoreSessionParams = {
        conversation: '',
        topic: 'empty-test',
      };

      const result = await sessionStoreManager.storeSession(params);

      expect(result.success).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('empty');
    });

    it('should truncate very long conversations', async () => {
      const longText = 'x'.repeat(2 * 1024 * 1024); // 2MB
      const params: StoreSessionParams = {
        conversation: longText,
        topic: 'long-test',
      };

      const result = await sessionStoreManager.storeSession(params);

      expect(result.success).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('truncated');
    });
  });

  describe('validateInput', () => {
    it('should reject null conversation', async () => {
      const params = {
        conversation: null,
      } as unknown as StoreSessionParams;

      await expect(sessionStoreManager.storeSession(params)).rejects.toThrow();
    });

    it('should reject invalid format', async () => {
      const params: StoreSessionParams = {
        conversation: 'test',
        format: 'invalid' as 'plain',
      };

      await expect(sessionStoreManager.storeSession(params)).rejects.toThrow();
    });
  });
});
