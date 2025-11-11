import { SessionManager } from '../../src/session/SessionManager.js';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync, readFileSync } from 'fs';
import { StoreSessionParams } from '../../src/session/types.js';

describe('store_session integration', () => {
  let tempDir: string;
  let sessionManager: SessionManager;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-test-'));
    sessionManager = new SessionManager();

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

    const result = await sessionManager.storeSession(params);

    expect(result.success).toBe(true);
    expect(result.file).toBeDefined();
    if (result.file) {
      expect(existsSync(result.file)).toBe(true);

      // Verify content
      const content = readFileSync(result.file, 'utf-8');
      expect(content).toContain('# test');
      expect(content).toContain('User: test');
      expect(content).toContain('AI: response');
    }
  });

  it('should create directory structure correctly', async () => {
    const params: StoreSessionParams = {
      conversation: 'test conversation',
      topic: 'test',
    };

    const result = await sessionManager.storeSession(params);

    expect(result.success).toBe(true);
    expect(result.file).toBeDefined();
    if (result.file) {
      // The file should be created somewhere - check that the directory exists
      // It might be in tempDir or detected project root
      const fileDir = join(result.file, '..', '..'); // Go up from file to sessions dir
      const sessionsDir = join(fileDir, '..'); // Go up to .codearchitect
      expect(existsSync(sessionsDir)).toBe(true);

      const dateFolder = new Date().toISOString().split('T')[0];
      const dateDir = join(sessionsDir, 'sessions', dateFolder);
      expect(existsSync(dateDir)).toBe(true);
    }
  });

  it('should handle empty conversation with warning', async () => {
    const params: StoreSessionParams = {
      conversation: '',
      topic: 'empty-test',
    };

    const result = await sessionManager.storeSession(params);
    expect(result.success).toBe(true);
    expect(result.warning).toBeDefined();
    expect(result.warning).toContain('empty');
  });

  it('should save with auto-extracted topic', async () => {
    const params: StoreSessionParams = {
      conversation: 'User: implement authentication',
    };

    const result = await sessionManager.storeSession(params);

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

    const result1 = await sessionManager.storeSession(params1);
    const result2 = await sessionManager.storeSession(params2);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result1.file).not.toBe(result2.file);
  });
});

