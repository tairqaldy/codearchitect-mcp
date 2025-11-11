import { existsSync } from 'fs';
import { join, dirname, resolve, parse } from 'path';
import { mkdir, writeFile as fsWriteFile } from 'fs/promises';

/**
 * Detects the project root by walking up from the current directory
 * looking for common project markers.
 */
export function detectProjectRoot(startDir: string = process.cwd()): string {
  const startPath = resolve(startDir);
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
 * Generates a unique filename for a session, handling collisions.
 */
export async function generateFilename(
  date: Date,
  topic: string,
  sessionsDir: string
): Promise<string> {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
  const topicSlug = slugify(topic);

  const baseFilename = `session-${dateStr}-${timeStr}-${topicSlug}.md`;

  // Handle collisions
  let filename = baseFilename;
  let counter = 1;
  const dateFolder = date.toISOString().split('T')[0];
  
  while (true) {
    const fullPath = join(sessionsDir, dateFolder, filename);
    if (!existsSync(fullPath)) {
      break;
    }
    
    const ext = '.md';
    const base = baseFilename.replace(ext, '');
    filename = `${base}-${counter}${ext}`;
    counter++;

    if (counter > 1000) {
      // Safety limit
      throw new Error('Too many files with same name');
    }
  }

  return filename;
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
