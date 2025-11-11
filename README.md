# CodeArchitect MCP

A Model Context Protocol (MCP) server that stores AI conversation sessions as markdown files in your project. Perfect for tracking development sessions, decisions, and conversations with AI assistants.

## Features

- 📝 **Store Conversations**: Save AI conversation sessions as organized markdown files
- 🗂️ **Auto-Organization**: Automatically organizes sessions by date in `.codearchitect/sessions/`
- 🔍 **Smart Topic Extraction**: Automatically extracts session topics from conversations
- 🚀 **Zero Configuration**: Works out of the box with auto-detected project roots
- ⚡ **Fast & Reliable**: Optimized for performance with comprehensive error handling
- 🔒 **Secure**: Validates file paths and prevents directory traversal attacks

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install from npm (when published)

```bash
npm install -g codearchitect-mcp
```

### Install from source

```bash
git clone https://github.com/tairqaldy/codearchitect-mcp.git
cd codearchitect-mcp
npm install
npm run build
npm link
```

## Setup in Cursor/VS Code

The MCP server needs to know which workspace directory to use. You can configure it in two ways:

### Option 1: Workspace-Specific Configuration (Recommended)

Configure the MCP server per workspace so sessions are saved in each project's `.codearchitect/sessions/` folder.

**What this means**: You'll create a configuration file in each project folder (like `package.json`). This tells the MCP server where to save sessions for that specific project.

#### Cursor - Step by Step

1. **Open your project folder** in Cursor IDE

2. **Create the configuration folder**:
   - In your project root (same folder as `package.json`), create a folder named `.cursor`
   - If the folder already exists, skip this step

3. **Create the configuration file**:
   - Inside the `.cursor` folder, create a file named `mcp.json`
   - Copy and paste this content:
   ```json
   {
     "mcpServers": {
       "codearchitect": {
         "command": "codearchitect-mcp",
         "cwd": "${workspaceFolder}",
         "env": {
           "CODEARCHITECT_SESSIONS_DIR": "${workspaceFolder}/.codearchitect/sessions"
         }
       }
     }
   }
   ```

   **Optional: Custom sessions directory**
   - To store sessions in a custom location (e.g., a global folder for all projects), change the `CODEARCHITECT_SESSIONS_DIR` value:
   ```json
   {
     "mcpServers": {
       "codearchitect": {
         "command": "codearchitect-mcp",
         "cwd": "${workspaceFolder}",
         "env": {
           "CODEARCHITECT_SESSIONS_DIR": "C:/Users/YourName/Documents/ai-sessions"
         }
       }
     }
   }
   ```

4. **Save the file** and restart Cursor (or reload the MCP server)

**Your project structure should look like this:**
```
your-project/
├── package.json          ← Your existing project files
├── .git/                ← Git folder
├── .cursor/             ← You create this folder
│   └── mcp.json         ← You create this file with the config above
└── src/                 ← Your code
```

**For multiple projects**: Repeat these steps in each project folder. Each project will have its own `.cursor/mcp.json` file, and sessions will be saved in that project's `.codearchitect/sessions/` folder.

#### VS Code - Step by Step

1. **Open your project folder** in VS Code

2. **Create the configuration folder**:
   - In your project root (same folder as `package.json`), create a folder named `.vscode`
   - If the folder already exists, skip this step

3. **Create or edit the settings file**:
   - Inside the `.vscode` folder, create or edit a file named `settings.json`
   - If the file already exists, add the `mcp.servers` section to it
   - Copy and paste this content (or merge with existing content):
   ```json
   {
     "mcp.servers": {
       "codearchitect": {
         "command": "codearchitect-mcp",
         "cwd": "${workspaceFolder}",
         "env": {
           "CODEARCHITECT_SESSIONS_DIR": "${workspaceFolder}/.codearchitect/sessions"
         }
       }
     }
   }
   ```

   **Optional: Custom sessions directory**
   - To store sessions in a custom location (e.g., a global folder for all projects), change the `CODEARCHITECT_SESSIONS_DIR` value:
   ```json
   {
     "mcp.servers": {
       "codearchitect": {
         "command": "codearchitect-mcp",
         "cwd": "${workspaceFolder}",
         "env": {
           "CODEARCHITECT_SESSIONS_DIR": "C:/Users/YourName/Documents/ai-sessions"
         }
       }
     }
   }
   ```

4. **Save the file** and restart VS Code (or reload the MCP server)

**Your project structure should look like this:**
```
your-project/
├── package.json          ← Your existing project files
├── .git/                ← Git folder
├── .vscode/             ← You create this folder (if it doesn't exist)
│   └── settings.json    ← You create/edit this file with the config above
└── src/                 ← Your code
```

**For multiple projects**: Repeat these steps in each project folder. Each project will have its own `.vscode/settings.json` file.

**Sessions storage**: By default, sessions are saved in each project's `.codearchitect/sessions/` folder. To use a global folder for all sessions, set `CODEARCHITECT_SESSIONS_DIR` in the `env` section (see example above).

### Option 2: Global Configuration with Auto-Detection

If you prefer a global configuration, the server will auto-detect the project root by walking up from the current directory looking for project markers (`package.json`, `.git`, etc.).

**Note**: This is less reliable than Option 1. Option 1 is recommended for the best experience.

#### Cursor

Add to your global MCP settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "codearchitect": {
      "command": "codearchitect-mcp"
    }
  }
}
```

**Note**: With this configuration, the server uses `process.cwd()` as the starting point. For best results, ensure your IDE opens projects from their root directories.

### How Sessions Directory is Determined

The server determines where to save sessions in this priority order:

1. **Tool parameter** (`sessionsDir`): If provided when calling `store_session`, this takes highest priority
2. **Environment variable** (`CODEARCHITECT_SESSIONS_DIR`): Set in your MCP configuration's `env` section
3. **Default**: `.codearchitect/sessions/` in the detected project root

**Examples:**

- **Per-project storage** (default): Sessions saved in each project's `.codearchitect/sessions/` folder
- **Global storage**: Set `CODEARCHITECT_SESSIONS_DIR` to a single folder (e.g., `C:/Users/YourName/Documents/ai-sessions`) to store all sessions in one place
- **Custom per-project**: Set different `CODEARCHITECT_SESSIONS_DIR` values in each project's configuration

### How It Works

1. **With `cwd` set** (Option 1): The server starts from the specified workspace directory and looks for project markers (like `package.json` or `.git`) to determine the project root.

2. **Without `cwd`** (Option 2): The server starts from `process.cwd()` (usually your home directory or where the IDE was launched) and walks up the directory tree to find the nearest project root.

3. **Session storage**: Once the project root is detected, sessions are saved according to the priority above (tool parameter → env var → default).

### Recommended Setup

For the best experience across multiple projects:

1. **Use workspace-specific configuration** (Option 1) in each project
2. **Choose your storage strategy**:
   - **Per-project** (default): Don't set `CODEARCHITECT_SESSIONS_DIR` - sessions saved in each project's `.codearchitect/sessions/`
   - **Global folder**: Set `CODEARCHITECT_SESSIONS_DIR` to a single folder in your global MCP config (`~/.cursor/mcp.json`) to store all sessions in one place
   - **Mixed**: Use per-project configs with different `CODEARCHITECT_SESSIONS_DIR` values for different storage needs
3. Sessions are automatically organized by date within the chosen directory

### Troubleshooting

If sessions are being saved in the wrong location:

1. **Check your `cwd` setting**: Ensure it points to your workspace root
2. **Verify project markers**: The server looks for `package.json`, `.git`, or `.codearchitect` to identify project roots
3. **Check the file path**: The response from `store_session` includes the full file path - verify it's correct
4. **Restart your IDE**: After creating/editing configuration files, restart Cursor/VS Code
5. See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more help

## Usage

Once configured, you can use the `store_session` tool from your AI assistant:

### Basic Usage

```
Store this conversation about implementing authentication
```

The tool will:
1. Extract the topic from your conversation
2. Detect your project root
3. Create the directory structure: `.codearchitect/sessions/YYYY-MM-DD/`
4. Save the session as: `session-YYYYMMDD-HHMMSS-topic-slug.md`

### With Explicit Topic

```
Store this session with topic "User Authentication Implementation"
```

### Example Output

Sessions are saved in markdown format:

```markdown
# implement-user-authentication

**Date:** 2025-01-15T14:30:22.123Z
**Type:** AI Conversation Session

---

## Conversation

User: I need to add authentication to my app
AI: Let's implement JWT-based authentication...

---

*Generated by CodeArchitect MCP v0.1.1*
```

## File Structure

Sessions are organized by date in your project:

```
your-project/
├── .codearchitect/
│   └── sessions/
│       ├── 2025-01-15/
│       │   ├── session-20250115-143022-implement-auth.md
│       │   └── session-20250115-150145-add-database.md
│       └── 2025-01-16/
│           └── session-20250116-091200-refactor-api.md
└── (your code)
```

## API Reference

### Tool: `store_session`

Stores an AI conversation session as a markdown file.

#### Parameters

- `conversation` (string | array, required): The conversation text or array of messages
- `topic` (string, optional): Session topic/title. Auto-extracted if not provided
- `format` (string, optional): Format of conversation input
  - `"plain"` (default): Plain text conversation
  - `"messages"`: JSON array of message objects with `role` and `content`
- `sessionsDir` (string, optional): Custom directory for storing sessions. If not provided, uses `CODEARCHITECT_SESSIONS_DIR` environment variable or defaults to `.codearchitect/sessions/` in project root

#### Response

Success:
```json
{
  "success": true,
  "file": "/path/to/project/.codearchitect/sessions/2025-01-15/session-20250115-143022-topic.md",
  "filename": "session-20250115-143022-topic.md",
  "topic": "topic",
  "date": "2025-01-15T14:30:22.123Z",
  "message": "Session saved to session-20250115-143022-topic.md"
}
```

Error:
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Conversation parameter is required",
  "details": "..."
}
```

## Project Root Detection

The server automatically detects your project root by looking for:

- `package.json`
- `.git`
- `.codearchitect`
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `requirements.txt` (Python)
- `pom.xml` (Java)
- `project.json` (.NET)

If no markers are found, it uses the current working directory.

## Topic Extraction

Topics are extracted in this priority order:

1. **User-provided topic**: If you specify a topic, it's used directly
2. **User message**: Extracts from lines starting with "User:"
3. **First line**: Uses the first non-empty line if reasonable length
4. **Keywords**: Extracts keywords from the first 200 characters
5. **Fallback**: Uses timestamp-based name

Topics are automatically sanitized to be URL-safe (lowercase, hyphens, max 50 chars).

## Error Handling

The server handles various error scenarios gracefully:

- **INVALID_INPUT**: Missing or invalid conversation parameter
- **PROJECT_ROOT_NOT_FOUND**: Cannot detect project root (non-fatal, uses current dir)
- **FILE_WRITE_ERROR**: Cannot write file (permissions, disk full)
- **FILENAME_GENERATION_ERROR**: Cannot generate unique filename
- **DIRECTORY_CREATION_ERROR**: Cannot create directory
- **UNKNOWN_ERROR**: Unexpected error

## Troubleshooting

### Session files not being created

1. **Check permissions**: Ensure you have write permissions in your project directory
2. **Check project root**: Verify the server detected your project root correctly
3. **Check logs**: Look for error messages in the MCP server logs

### Topic extraction not working

- Provide an explicit `topic` parameter
- Ensure your conversation starts with a clear user message
- Topics are limited to 50 characters and special characters are removed

### Files saved in wrong location

- The server uses project root detection - ensure you're in a project directory
- Check for `.codearchitect` folder in your project root
- Sessions are always saved relative to the detected project root

### Permission errors

- Ensure you have write permissions in your project directory
- On Linux/Mac, check directory permissions with `ls -la`
- On Windows, ensure you're not in a protected directory

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Running in Development

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- **Documentation**: See [docs/](./docs/) folder for detailed documentation

## Roadmap

Future features planned:

- `get_session` - Retrieve session by date/topic
- `list_sessions` - Browse all sessions
- `search_sessions` - Full-text search across sessions
- Configuration file support
- Optional database storage

## Changelog

### v0.1.1 (Current)

- **Configurable sessions directory**: Customize where sessions are stored
  - New `sessionsDir` parameter for per-call customization
  - `CODEARCHITECT_SESSIONS_DIR` environment variable support
  - Priority: tool parameter → env var → default
- Enhanced workspace detection
- Improved documentation and setup instructions

### v0.1.0

- Initial release
- `store_session` tool
- Auto project root detection
- Smart topic extraction
- Markdown formatting
- Comprehensive error handling

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

