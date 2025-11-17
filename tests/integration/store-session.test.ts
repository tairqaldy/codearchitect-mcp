import { SessionStoreManager } from '../../src/store-session/index.js';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync, readFileSync } from 'fs';
import type { StoreSessionParams } from '../../src/store-session/types.js';

describe('store_session integration', () => {
  let tempDir: string;
  let sessionStoreManager: SessionStoreManager;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-test-'));
    sessionStoreManager = new SessionStoreManager();

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

  it('should save session end-to-end', async () => {
    const params: StoreSessionParams = {
      conversation: 'User: test\nAI: response',
      topic: 'test',
    };

    const result = await sessionStoreManager.storeSession(params);

    expect(result.success).toBe(true);
    expect(result.summaryFile).toBeDefined();
    expect(result.fullFile).toBeDefined();
    expect(result.filename).toBeDefined();
    
    if (result.summaryFile && result.fullFile) {
      expect(existsSync(result.summaryFile)).toBe(true);
      expect(existsSync(result.fullFile)).toBe(true);

      // Verify summary.md content (structured summary format)
      const summaryContent = readFileSync(result.summaryFile, 'utf-8');
      expect(summaryContent).toContain('# test');
      expect(summaryContent).toContain('**Date:**');
      expect(summaryContent).toContain('**Type:** AI Conversation Session Summary');

      // Verify full.md content (should have JSON section)
      const fullContent = readFileSync(result.fullFile, 'utf-8');
      expect(fullContent).toContain('# test');
      expect(fullContent).toContain('## Full Conversation (JSON)');
      expect(fullContent).toContain('## Human-Readable Format');
    }
  });

  it('should create directory structure correctly', async () => {
    const params: StoreSessionParams = {
      conversation: 'test conversation',
      topic: 'test',
    };

    const result = await sessionStoreManager.storeSession(params);

    expect(result.success).toBe(true);
    expect(result.summaryFile).toBeDefined();
    expect(result.fullFile).toBeDefined();
    
    if (result.summaryFile && result.fullFile) {
      // Check that topic folder exists
      const topicFolder = join(result.summaryFile, '..');
      expect(existsSync(topicFolder)).toBe(true);
      
      // Check that summary.md and full.md exist in topic folder
      expect(existsSync(join(topicFolder, 'summary.md'))).toBe(true);
      expect(existsSync(join(topicFolder, 'full.md'))).toBe(true);

      // Check that date folder exists (use local date)
      const dateFolder = new Date().toLocaleDateString('en-CA');
      const dateDir = join(topicFolder, '..');
      expect(dateDir).toContain(dateFolder);
      expect(existsSync(dateDir)).toBe(true);
    }
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

  it('should save with auto-extracted topic', async () => {
    const params: StoreSessionParams = {
      conversation: 'User: implement authentication',
    };

    const result = await sessionStoreManager.storeSession(params);

    expect(result.success).toBe(true);
    expect(result.topic).toBeDefined();
    expect(result.topic).not.toBe('');
    expect(result.topic).toContain('implement-authentication');
  });

  it('should handle multiple sessions on same day', async () => {
    const params1: StoreSessionParams = {
      conversation: 'First session',
      topic: 'session-1',
    };

    const params2: StoreSessionParams = {
      conversation: 'Second session',
      topic: 'session-2',
    };

    const result1 = await sessionStoreManager.storeSession(params1);
    const result2 = await sessionStoreManager.storeSession(params2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    // Different topics should create different folders
    expect(result1.filename).not.toBe(result2.filename);
  });
});

