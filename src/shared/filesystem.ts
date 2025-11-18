import { existsSync, statSync } from 'fs';
import { join, dirname, resolve, parse } from 'path';
import { mkdir, writeFile as fsWriteFile, readFile, readdir } from 'fs/promises';
import { homedir } from 'os';

/**
 * Gets the local date string in YYYY-MM-DD format (not UTC)
 */
function getLocalDateString(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
}

/**
 * Gets the default sessions directory in main .codearchitect/ folder in user's home directory
 * This is the main "second brain" location - always reliable, no project detection needed
 */
function getDefaultSessionsDirectory(): string {
  // Always use main .codearchitect/ folder in user's home directory
  // This is the central location for all sessions
  return join(homedir(), '.codearchitect', 'sessions');
}

/**
 * Gets the workspace directory from environment variables or falls back to process.cwd()
 * This function prioritizes environment variables, then walks up looking for project markers
 */
function getWorkspaceDir(): string {
  // Check common IDE environment variables first
  const envVars = [
    'VSCODE_CWD',           // VS Code
    'CURSOR_CWD',          // Cursor
    'WORKSPACE_FOLDER',    // Generic workspace
    'PROJECT_ROOT',        // Generic project root
    'PWD',                 // Current working directory (set by some shells)
  ];

  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
      return resolve(value);
    }
  }

  // Fallback to process.cwd() - let detectProjectRoot handle the walking up
  return process.cwd();
}

/**
 * Gets the sessions directory from environment variable or uses default
 * Default is now VS Code/Cursor config folder, not project root
 */
export function getSessionsDirectory(_projectRoot: string, customDir?: string): string {
  // Priority 1: Custom directory provided via parameter
  if (customDir) {
    return resolve(customDir);
  }

  // Priority 2: Environment variable
  const envDir = process.env.CODEARCHITECT_SESSIONS_DIR;
  if (envDir) {
    return resolve(envDir);
  }

  // Priority 3: Default to VS Code/Cursor config folder (works automatically)
  // This avoids workspace detection issues and works without cwd configuration
  return getDefaultSessionsDirectory();
}

/**
 * Detects the project root by walking up from the current directory
 * looking for common project markers.
 */
export function detectProjectRoot(startDir?: string): string {
  const startPath = startDir ? resolve(startDir) : getWorkspaceDir();
  let current = startPath;
  const root = parse(current).root;

  // Markers that indicate project root
  const markers = [
    'package.json',
    '.git',
    '.codearchitect',
    'Cargo.toml', // Rust
    'go.mod', // Go
    'requirements.txt', // Python
    'pom.xml', // Java
    'project.json', // .NET
  ];

  // Check start directory first
  for (const marker of markers) {
    try {
      if (existsSync(join(current, marker))) {
        return current;
      }
    } catch {
      // Permission denied or other error - continue searching
    }
  }

  // Walk up the directory tree
  while (current !== root) {
    const parent = dirname(current);
    // Prevent infinite loop - if parent is same as current, break
    if (parent === current) {
      break;
    }
    current = parent;

    for (const marker of markers) {
      try {
        if (existsSync(join(current, marker))) {
          return current;
        }
      } catch {
        // Permission denied or other error - continue searching
      }
    }
  }

  // Fallback: use start directory (not process.cwd() which might have changed)
  return startPath;
}

/**
 * Ensures a directory exists, creating it recursively if needed.
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generates a unique topic folder name for organizing sessions, handling collisions.
 * Returns a readable folder name based on the topic.
 */
export async function generateTopicFolderName(
  date: Date,
  topic: string,
  sessionsDir: string
): Promise<string> {
  const dateFolder = getLocalDateString(date);
  let topicSlug = slugify(topic);
  
  // Remove common redundant suffixes that don't add value to folder names
  const redundantSuffixes = ['-summary', '-session', '-conversation', '-chat'];
  for (const suffix of redundantSuffixes) {
    if (topicSlug.endsWith(suffix)) {
      topicSlug = topicSlug.slice(0, -suffix.length);
      break; // Only remove one suffix
    }
  }
  
  // Create readable folder name: topic-slug
  const baseFolderName = topicSlug;
  const fullDateDir = join(sessionsDir, dateFolder);

  // Handle collisions - check if folder already exists
  let folderName = baseFolderName;
  let counter = 1;

  while (true) {
    const folderPath = join(fullDateDir, folderName);
    
    if (!existsSync(folderPath)) {
      break;
    }
    
    // Check if folder contains summary.md or full.md (might be empty folder)
    try {
      const entries = await readdir(folderPath, { withFileTypes: true });
      const hasFiles = entries.some(entry => 
        entry.isFile() && (entry.name === 'summary.md' || entry.name === 'full.md')
      );
      
      if (!hasFiles) {
        // Empty folder, can reuse
        break;
      }
    } catch {
      // Error reading directory, assume it exists and has content
    }
    
    folderName = `${baseFolderName}-${counter}`;
    counter++;

    if (counter > 1000) {
      // Safety limit
      throw new Error('Too many folders with same name');
    }
  }

  return folderName;
}

/**
 * Generates a unique base filename (without extension) for a session, handling collisions.
 * Checks both -summary.md and -full.md files for collisions.
 * Legacy function - kept for backward compatibility with old file structure.
 */
export async function generateBaseFilename(
  date: Date,
  topic: string,
  sessionsDir: string
): Promise<string> {
  const localDateStr = getLocalDateString(date);
  const dateStr = localDateStr.replace(/-/g, '');
  // Get local time components (not UTC)
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${minutes}${seconds}`;
  const topicSlug = slugify(topic);

  const baseName = `session-${dateStr}-${timeStr}-${topicSlug}`;
  const dateFolder = localDateStr;

  // Handle collisions - check both summary and full files
  let baseFilename = baseName;
  let counter = 1;

  while (true) {
    const summaryPath = join(sessionsDir, dateFolder, `${baseFilename}-summary.md`);
    const fullPath = join(sessionsDir, dateFolder, `${baseFilename}-full.md`);
    
    if (!existsSync(summaryPath) && !existsSync(fullPath)) {
      break;
    }
    
    baseFilename = `${baseName}-${counter}`;
    counter++;

    if (counter > 1000) {
      // Safety limit
      throw new Error('Too many files with same name');
    }
  }

  return baseFilename;
}

/**
 * Generates a unique filename for a session, handling collisions.
 * Legacy function - kept for backward compatibility.
 */
export async function generateFilename(
  date: Date,
  topic: string,
  sessionsDir: string
): Promise<string> {
  const baseFilename = await generateBaseFilename(date, topic, sessionsDir);
  return `${baseFilename}.md`;
}

/**
 * Writes content to a file.
 */
export async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    await fsWriteFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(
      `Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validates that a file path is within the base directory (security check).
 */
export function validatePath(filePath: string, baseDir: string): boolean {
  const resolved = resolve(filePath);
  const base = resolve(baseDir);

  // Ensure path is within base directory
  if (!resolved.startsWith(base)) {
    return false;
  }

  // Prevent directory traversal
  if (resolved.includes('..')) {
    return false;
  }

  return true;
}

/**
 * Converts a string to a URL-safe slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to one
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Max 50 chars
}

/**
 * Reads content from a file.
 */
export async function readFileContent(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  try {
    return await readFile(filePath, encoding);
  } catch (error) {
    throw new Error(
      `Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Lists files in a directory.
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch (error) {
    throw new Error(
      `Failed to list directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Lists subdirectories in a directory.
 */
export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    throw new Error(
      `Failed to list directories ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Gets file stats (size, etc.)
 */
export function getFileStats(filePath: string): { size: number; exists: boolean } {
  try {
    if (!existsSync(filePath)) {
      return { size: 0, exists: false };
    }
    const stats = statSync(filePath);
    return { size: stats.size, exists: true };
  } catch {
    return { size: 0, exists: false };
  }
}
