# CodeArchitect MCP

> **🚧 Project Status**: This project is actively in development. While `store_session` is production-ready, additional features are being built. If you encounter bugs or have suggestions, please reach out - I'm committed to fixing issues quickly and incorporating feedback!

A Model Context Protocol (MCP) server designed to assist with system design, architecture, and development workflows. Currently featuring session storage, with plans to expand into comprehensive architecture assistance tools.

[![npm version](https://img.shields.io/npm/v/codearchitect-mcp.svg)](https://www.npmjs.com/package/codearchitect-mcp)
[![npm downloads](https://img.shields.io/npm/dm/codearchitect-mcp.svg)](https://www.npmjs.com/package/codearchitect-mcp)

## 🔗 Important Links

- **📦 npm Package**: [codearchitect-mcp](https://www.npmjs.com/package/codearchitect-mcp)
- **👤 npm Profile**: [@tairkaldybayev](https://www.npmjs.com/~tairkaldybayev)
- **💻 GitHub**: [tairqaldy/codearchitect-mcp](https://github.com/tairqaldy/codearchitect-mcp)
- **👨‍💻 Author**: [Tair Kaldybayev](https://tairkaldybayev.link/) - Fullstack Software Engineer
- **📧 Contact**: Reach out via [GitHub](https://github.com/tairqaldy) or [Telegram](https://t.me/tairqaldy)

## 🎯 Vision & Roadmap

CodeArchitect MCP is evolving into a comprehensive toolkit for system design and architecture projects. The current `store_session` feature is just the beginning.

### Current Features (v0.1.1)
- ✅ **`store_session`**: Save AI conversation sessions as organized markdown files
- ✅ Auto-organization by date
- ✅ Smart topic extraction
- ✅ Configurable storage locations

### Planned Features

#### Session Management
- `list_sessions` - Browse and filter all stored sessions
- `get_session` - Retrieve specific session by ID, date, or topic
- `search_sessions` - Full-text search across all sessions
- `delete_session` - Remove sessions
- `export_sessions` - Export sessions in various formats

#### Architecture & System Design Tools
- `analyze_architecture` - Analyze project structure and suggest improvements
- `generate_diagrams` - Create architecture diagrams from codebase
- `document_system` - Auto-generate system documentation
- `review_design` - Review system design decisions
- `suggest_patterns` - Suggest design patterns for specific problems

#### Development Workflow
- `track_decisions` - Track architectural decisions (ADR format)
- `manage_tech_debt` - Track and prioritize technical debt
- `codebase_insights` - Generate insights about codebase health
- `dependency_analysis` - Analyze dependencies and suggest optimizations

#### Integration & Configuration
- Database storage option (SQLite/PostgreSQL)
- Configuration file support
- Integration with popular architecture tools
- CLI interface for batch operations

**Want to see a feature?** [Suggest it](#-suggest-a-feature) or [contribute](#-contributing)!

## ⚡ Quick Start

```bash
npm install -g codearchitect-mcp
```

Then configure in your IDE (see setup guides below).

## 📋 Features

- 📝 **Store Conversations**: Save AI conversation sessions as organized markdown files
- 🗂️ **Auto-Organization**: Automatically organizes sessions by date in `.codearchitect/sessions/`
- 🔍 **Smart Topic Extraction**: Automatically extracts session topics from conversations
- 🚀 **Zero Configuration**: Works out of the box with auto-detected project roots
- ⚡ **Fast & Reliable**: Optimized for performance with comprehensive error handling
- 🔒 **Secure**: Validates file paths and prevents directory traversal attacks

## 📦 Installation

<details>
<summary><b>Install from npm (Recommended)</b></summary>

```bash
npm install -g codearchitect-mcp
```

After installation, the `codearchitect-mcp` command will be available globally.

</details>

<details>
<summary><b>Install from source</b></summary>

```bash
git clone https://github.com/tairqaldy/codearchitect-mcp.git
cd codearchitect-mcp
npm install
npm run build
npm link
```

</details>

## ⚙️ Setup

<details>
<summary><b>VS Code Setup (Recommended - Uses Built-in Wizard)</b></summary>

VS Code has a built-in MCP server setup wizard that makes installation easy:

1. **Open your project workspace** in VS Code
   - File → Open Folder (or `Ctrl+K Ctrl+O`)
   - **Important**: Open the project folder where you want to store sessions

2. **Open the MCP setup wizard**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type `MCP: Add Server...` and select it

3. **Select installation method**: Choose **"Download with npm package"**

4. **Enter package name**: `codearchitect-mcp` and press Enter

5. **Confirm installation**: Click **"Allow"** when prompted

6. **Configure session storage location**:
   - **Default (Recommended)**: Press Enter to use `${workspaceFolder}/.codearchitect/sessions`
     - Keeps sessions organized per project
   - **Custom**: Type a path like `C:/Users/YourName/Documents/ai-sessions`
     - Use if you want all sessions in one central location

7. **Set workspace directory**: Press Enter to use `${workspaceFolder}` (default is best)

8. **Enter Server ID**: Type `codearchitect` and press Enter

9. **Choose configuration scope**:
   - **Workspace (Recommended)**: Per-project configuration, better organization
   - **Global**: Same settings for all projects

10. **Done!** The MCP server is ready to use.

</details>

<details>
<summary><b>Cursor Setup</b></summary>

1. **Open your project folder** in Cursor IDE

2. **Create `.cursor/mcp.json`** in your project root:
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

3. **Restart Cursor** or reload the MCP server

**For multiple projects**: Repeat these steps in each project folder.

</details>

## 💡 Usage

<details>
<summary><b>Basic Usage</b></summary>

Simply ask your AI assistant to store the conversation:

```
Store this conversation about implementing authentication
```

Or with an explicit topic:

```
Save this session with topic "User Authentication Implementation"
```

The tool automatically:
1. Extracts the topic (or uses yours)
2. Detects your project root
3. Creates `.codearchitect/sessions/YYYY-MM-DD/`
4. Saves as `session-YYYYMMDD-HHMMSS-topic-slug.md`

</details>

<details>
<summary><b>Storage Locations</b></summary>

**Project Workspace (Default)**:
```
your-project/
└── .codearchitect/
    └── sessions/
        └── 2025-11-11/
            └── session-20251111-143022-topic.md
```

**Custom Global Directory** (if configured):
```
Documents/
└── ai-sessions/
    └── 2025-11-11/
        └── session-20251111-143022-topic.md
```

</details>

<details>
<summary><b>Usage Examples</b></summary>

**Example 1**: Store current conversation
```
Store this conversation
```

**Example 2**: Store with explicit topic
```
Store this session with topic "Database Migration Strategy"
```

**Example 3**: Store specific discussion
```
Save our conversation about implementing JWT authentication
```

</details>

<details>
<summary><b>How It Works</b></summary>

### Session Storage Priority

1. **Tool parameter** (`sessionsDir`) - Highest priority
2. **Environment variable** (`CODEARCHITECT_SESSIONS_DIR`)
3. **Default** - `.codearchitect/sessions/` in project root

### Project Root Detection

Automatically detects project root by looking for:
- `package.json`
- `.git`
- `.codearchitect`
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `requirements.txt` (Python)
- `pom.xml` (Java)
- `project.json` (.NET)

### Topic Extraction

Topics are extracted in this priority:
1. User-provided topic
2. User message (lines starting with "User:")
3. First line of conversation
4. Keywords from first 200 characters
5. Timestamp-based fallback

</details>

## 📚 API Reference

<details>
<summary><b>Tool: store_session</b></summary>

### Parameters

- `conversation` (string | array, required): Conversation text or array of messages
- `topic` (string, optional): Session topic/title (auto-extracted if not provided)
- `format` (string, optional): `"plain"` (default) or `"messages"`
- `sessionsDir` (string, optional): Custom directory for storing sessions

### Response

**Success**:
```json
{
  "success": true,
  "file": "/path/to/session.md",
  "filename": "session-20251111-143022-topic.md",
  "topic": "topic",
  "date": "2025-11-11T14:30:22.123Z",
  "message": "Session saved successfully"
}
```

**Error**:
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Conversation parameter is required"
}
```

See [API Documentation](./docs/API.md) for complete details.

</details>

## 🐛 Troubleshooting

<details>
<summary><b>Common Issues</b></summary>

**Sessions saved in wrong location?**
- Verify workspace directory in `.vscode/settings.json`
- Check `CODEARCHITECT_SESSIONS_DIR` environment variable
- Ensure you opened the correct project folder

**Session not saving?**
- Check MCP server is running (Output panel → MCP)
- Verify storage path exists and is writable
- Check for error messages in AI assistant response

**Command not found?**
- Verify installation: `npm list -g codearchitect-mcp`
- Check npm global bin is in PATH
- Try reinstalling: `npm install -g codearchitect-mcp`

See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more help.

</details>

## 💬 Suggest a Feature

Have an idea for CodeArchitect MCP? I'd love to hear it!

**Ways to suggest features:**
1. **GitHub Issues**: [Create an issue](https://github.com/tairqaldy/codearchitect-mcp/issues/new) with the `enhancement` label
2. **Direct Contact**: 
   - [Telegram](https://t.me/tairqaldy)
   - [GitHub Discussions](https://github.com/tairqaldy/codearchitect-mcp/discussions)
3. **Share Your Vision**: Tell me what you want CodeArchitect MCP to help you with!

**What to include:**
- Feature description
- Use case / why it's useful
- How you envision it working
- Any examples or mockups

I'm actively developing this project and prioritize features based on user needs. Your feedback shapes the roadmap!

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's code, documentation, bug reports, or feature ideas.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** (code, docs, tests)
4. **Test your changes**: `npm test`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup

```bash
git clone https://github.com/tairqaldy/codearchitect-mcp.git
cd codearchitect-mcp
npm install
npm run build
npm test
```

### Code Style

- TypeScript with strict mode
- ESLint + Prettier configured
- Write tests for new features
- Maintain 80%+ test coverage

See [Contributing Guide](./docs/CONTRIBUTING.md) for detailed guidelines.

## 📝 Disclaimer

**Project Status**: CodeArchitect MCP is actively in development. While the `store_session` feature is production-ready and tested, the project is evolving with new features being added regularly.

**Bugs & Issues**: If you encounter any bugs or issues:
- **Report them**: [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- **Contact me directly**: I'm committed to fixing bugs quickly
  - [Telegram](https://t.me/tairqaldy)
  - [GitHub](https://github.com/tairqaldy)
- **Be patient**: I'm actively maintaining this project and will address issues promptly

**Feedback Welcome**: Your feedback, suggestions, and contributions help make this project better. Don't hesitate to reach out!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Inspired by the need for better AI conversation management in development workflows

## 📊 Changelog

<details>
<summary><b>v0.1.1 (Current)</b></summary>

- **Configurable sessions directory**: Customize where sessions are stored
  - New `sessionsDir` parameter for per-call customization
  - `CODEARCHITECT_SESSIONS_DIR` environment variable support
  - Priority: tool parameter → env var → default
- Enhanced workspace detection
- Improved documentation and setup instructions

</details>

<details>
<summary><b>v0.1.0</b></summary>

- Initial release
- `store_session` tool
- Auto project root detection
- Smart topic extraction
- Markdown formatting
- Comprehensive error handling

</details>

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

**Made with ❤️ by [Tair Kaldybayev](https://tairkaldybayev.link/)**

*Fullstack Software Engineer | Turning ideas into existing products*
