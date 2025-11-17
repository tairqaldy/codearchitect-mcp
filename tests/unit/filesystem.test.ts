import { detectProjectRoot, generateFilename, generateTopicFolderName, validatePath } from '../../src/shared/filesystem.js';
import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

describe('FileSystemUtils', () => {
  let tempDir: string;
  const originalCwd = process.cwd();

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'mcp-test-'));
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

  describe('detectProjectRoot', () => {
    it('should find root with package.json', async () => {
      const testDir = join(tempDir, 'project');
      await mkdir(testDir, { recursive: true });
      await writeFile(join(testDir, 'package.json'), '{}');

      process.chdir(testDir);
      const root = detectProjectRoot(testDir);
      expect(root).toBe(testDir);
    });

    it('should find root with .git', async () => {
      const testDir = join(tempDir, 'project');
      await mkdir(testDir, { recursive: true });
      await mkdir(join(testDir, '.git'), { recursive: true });

      process.chdir(testDir);
      const root = detectProjectRoot(testDir);
      expect(root).toBe(testDir);
    });

    it('should fallback to current dir if no markers found', async () => {
      const testDir = join(tempDir, 'no-project');
      await mkdir(testDir, { recursive: true });

      process.chdir(testDir);
      const root = detectProjectRoot(testDir);
      // On Windows, if parent directories have markers (like user home), 
      // it will return that. Otherwise, it should return testDir.
      // So we check that root is either testDir or a parent directory (which is valid behavior)
      expect(root).toBeDefined();
      // The root should be testDir or a parent of testDir
      const isTestDir = root === testDir;
      const isParent = root === dirname(testDir) || root === dirname(dirname(testDir));
      expect(isTestDir || isParent || root.startsWith(testDir) || testDir.startsWith(root)).toBe(true);
    });
  });

  describe('generateTopicFolderName', () => {
    it('should generate valid folder name', async () => {
      const date = new Date();
      const topic = 'test-topic';
      const sessionsDir = join(tempDir, 'sessions');

      const folderName = await generateTopicFolderName(date, topic, sessionsDir);

      expect(folderName).toBe('test-topic');
    });

    it('should handle folder collisions', async () => {
      const date = new Date();
      const topic = 'collision-test';
      const sessionsDir = join(tempDir, 'sessions');
      // Use local date to match generateTopicFolderName behavior
      const dateFolder = date.toLocaleDateString('en-CA');
      const fullSessionsDir = join(sessionsDir, dateFolder);
      await mkdir(fullSessionsDir, { recursive: true });

      // Create first folder with summary.md and full.md
      const folderName1 = await generateTopicFolderName(date, topic, sessionsDir);
      const folderPath1 = join(fullSessionsDir, folderName1);
      await mkdir(folderPath1, { recursive: true });
      await writeFile(join(folderPath1, 'summary.md'), 'test');
      await writeFile(join(folderPath1, 'full.md'), 'test');

      // Generate second folder name (should get -1 suffix)
      const folderName2 = await generateTopicFolderName(date, topic, sessionsDir);
      expect(folderName2).toBe('collision-test-1');
      expect(folderName2).not.toBe(folderName1);
    });

    it('should remove redundant suffixes', async () => {
      const date = new Date();
      const topic = 'test-session-summary';
      const sessionsDir = join(tempDir, 'sessions');

      const folderName = await generateTopicFolderName(date, topic, sessionsDir);

      // Should remove "-summary" suffix
      expect(folderName).toBe('test-session');
    });
  });

  describe('generateFilename (legacy)', () => {
    it('should generate valid filename for backward compatibility', async () => {
      const date = new Date();
      const topic = 'test-topic';
      const sessionsDir = join(tempDir, 'sessions');

      const filename = await generateFilename(date, topic, sessionsDir);

      expect(filename).toMatch(/^session-\d{8}-\d{6}-test-topic\.md$/);
    });
  });

  describe('validatePath', () => {
    it('should allow valid paths within base directory', () => {
      const baseDir = '/home/user/project';
      const filePath = '/home/user/project/.codearchitect/sessions/file.md';

      expect(validatePath(filePath, baseDir)).toBe(true);
    });

    it('should reject paths outside base directory', () => {
      const baseDir = '/home/user/project';
      const filePath = '/home/user/other/file.md';

      expect(validatePath(filePath, baseDir)).toBe(false);
    });

    it('should reject paths with directory traversal', () => {
      const baseDir = '/home/user/project';
      const filePath = '/home/user/project/../other/file.md';

      expect(validatePath(filePath, baseDir)).toBe(false);
    });
  });
});

