# FAQ - Frequently Asked Questions

An informal guide to understanding CodeArchitect MCP - why it exists, how it works, and how to use it.

---

## Why, How & Motivation

<details>
<summary><b>Why are you creating CodeArchitect MCP?</b></summary>

I'm building this because I found myself constantly losing valuable AI conversations. When working on complex projects, especially system design and architecture, I'd have these amazing discussions with AI assistants that contained important decisions, explanations, and insights. But they'd just disappear into the void.

I wanted a way to:
- **Preserve knowledge**: Save important conversations for future reference
- **Organize thoughts**: Keep architectural discussions organized by date and topic
- **Build a foundation**: Start with session storage, then expand into a full architecture assistance toolkit
- **Make it easy**: Zero configuration, works out of the box, integrates seamlessly with my workflow

It's basically my attempt to turn AI conversations into a searchable, organized knowledge base for my projects.

</details>

<details>
<summary><b>Why MCP (Model Context Protocol)?</b></summary>

MCP is perfect for this because:

1. **Standardized Protocol**: It's an open protocol that works across different AI assistants (Claude, GPT, etc.) and IDEs (Cursor, VS Code, etc.)
2. **No Vendor Lock-in**: I'm not tied to one specific AI provider or IDE
3. **Extensible**: Easy to add new tools and features as the project grows
4. **Clean Architecture**: Separates the AI assistant from the tools - the MCP server handles the logic, the AI just calls it
5. **Future-Proof**: As MCP evolves, my tools automatically work with new AI assistants and IDEs

Instead of building a custom solution for each AI/IDE combination, I build once and it works everywhere.

</details>

<details>
<summary><b>Why this specific problem?</b></summary>

The problem I'm solving is **conversation management**. Here's why it matters:

- **Lost Context**: Important architectural decisions get lost in chat history
- **No Organization**: Conversations are just a linear stream with no structure
- **Hard to Reference**: Can't easily find that discussion from 2 weeks ago about database design
- **Knowledge Silos**: Each conversation exists in isolation, no way to build on previous discussions

By storing conversations as organized markdown files:
- They're **version controlled** (git)
- They're **searchable** (grep, IDE search)
- They're **organized** (by date, topic)
- They're **portable** (just markdown files)

It's the difference between having a conversation and having a knowledge base.

</details>

---

## How MCP Works

<details>
<summary><b>How does MCP (Model Context Protocol) work?</b></summary>

MCP is a protocol that lets AI assistants communicate with external tools. Here's the flow:

1. **AI Assistant** (like Claude in Cursor) wants to do something (e.g., store a session)
2. **MCP Server** (this project) exposes tools via the MCP protocol
3. **Transport Layer** (stdio, HTTP, etc.) connects them
4. **AI calls tool** → **MCP server executes** → **Returns result** → **AI uses result**

Think of it like an API, but specifically designed for AI assistants. The AI doesn't need to know HOW to store files - it just calls `store_session` and the MCP server handles all the complexity.

**Key Components:**
- **Tools**: Functions the AI can call (like `store_session`)
- **Resources**: Data the AI can read (not implemented yet)
- **Prompts**: Templates the AI can use (not implemented yet)

Right now, CodeArchitect MCP only implements **Tools**.

</details>

<details>
<summary><b>How does the MCP server communicate with the AI?</b></summary>

The communication happens via **stdio** (standard input/output):

```
AI Assistant → stdin → MCP Server
MCP Server → stdout → AI Assistant
```

The protocol is JSON-RPC based:
- AI sends: `{"jsonrpc": "2.0", "method": "tools/call", "params": {...}}`
- Server responds: `{"jsonrpc": "2.0", "result": {...}}`

This is why MCP servers are separate processes - they run independently and communicate via stdin/stdout. It's simple, reliable, and works across platforms.

**Why stdio?**
- Works everywhere (Windows, Mac, Linux)
- No network setup needed
- Secure (no ports to expose)
- Simple debugging (just log to stderr)

</details>

<details>
<summary><b>How do I set up MCP in my IDE?</b></summary>

**For Cursor:**
1. Install: `npm install -g codearchitect-mcp`
2. Open Cursor settings → MCP settings
3. Add server configuration:
```json
{
  "mcpServers": {
    "codearchitect-mcp": {
      "command": "codearchitect-mcp"
    }
  }
}
```

**For VS Code:**
1. Install: `npm install -g codearchitect-mcp`
2. Install the MCP extension
3. Configure in settings (similar to Cursor)

**For Other IDEs:**
Check the MCP documentation for your specific IDE. The server itself is IDE-agnostic - it's just a command-line tool that speaks the MCP protocol.

Once configured, the AI assistant in your IDE will automatically have access to the `store_session` tool.

</details>

---

## How the Code Works

<details>
<summary><b>How is CodeArchitect MCP structured?</b></summary>

The codebase is organized into clear modules:

```
src/
├── server.ts              # Main MCP server entry point
├── session/               # Session management logic
│   ├── SessionManager.ts  # Core session storage logic
│   ├── errors.ts          # Custom error types
│   ├── types.ts           # TypeScript interfaces
│   └── index.ts           # Exports
└── utils/                 # Utility functions
    ├── filesystem.ts      # File operations, path detection
    ├── markdown.ts        # Markdown formatting
    ├── topic.ts           # Topic extraction logic
    └── validation.ts      # Input validation
```

**Architecture:**
- **server.ts**: Handles MCP protocol, routes tool calls
- **SessionManager**: Business logic for storing sessions
- **utils/**: Reusable utilities (filesystem, formatting, etc.)

Each module has a single responsibility, making it easy to understand and extend.

</details>

<details>
<summary><b>How does store_session work internally?</b></summary>

When you call `store_session`, here's what happens:

1. **Validation**: Check that conversation parameter exists and is valid
2. **Topic Extraction**: If no topic provided, extract one from the conversation text
3. **Project Detection**: Find the project root (checks env vars, then falls back to cwd)
4. **Directory Setup**: Create `.codearchitect/sessions/YYYY-MM-DD/` if needed
5. **Filename Generation**: Create unique filename like `session-20251112-113210-topic.md`
6. **Markdown Formatting**: Convert conversation to markdown format
7. **File Writing**: Write to disk with security checks (path validation)
8. **Return Result**: Return file path, topic, date, etc.

**Key Features:**
- Handles edge cases (empty conversations, long conversations, etc.)
- Prevents directory traversal attacks
- Auto-organizes by date
- Handles filename collisions

All of this happens in the `SessionManager.storeSession()` method.

</details>

<details>
<summary><b>How does project root detection work?</b></summary>

The code tries multiple strategies to find your project root:

1. **Environment Variables**: Checks `CURSOR_WORKSPACE_DIR`, `VSCODE_WORKSPACE_FOLDER`, etc.
2. **Current Directory**: Falls back to `process.cwd()` if no env vars found
3. **Error Handling**: If detection fails, uses current directory with a warning

**Why this matters:**
- Sessions are stored relative to project root
- Each project gets its own `.codearchitect/sessions/` folder
- Works across different IDEs and setups

The detection logic is in `utils/filesystem.ts` → `detectProjectRoot()`.

</details>

<details>
<summary><b>How does topic extraction work?</b></summary>

If you don't provide a topic, the code tries to extract one:

1. **First 100 characters**: Takes the first 100 chars of the conversation
2. **Clean it up**: Removes markdown, code blocks, extra whitespace
3. **Truncate**: Limits to ~50 characters
4. **Sanitize**: Removes invalid filename characters
5. **Fallback**: If extraction fails, uses "untitled-session"

**Why extract topics?**
- Makes filenames meaningful: `session-20251112-113210-database-design.md`
- Easier to find sessions later
- Better organization

The extraction logic is in `utils/topic.ts` → `extractTopic()`.

</details>

<details>
<summary><b>How does the code handle errors?</b></summary>

The code has comprehensive error handling:

1. **Custom Error Types**: `SessionError` with error codes (`INVALID_INPUT`, `FILE_WRITE_ERROR`, etc.)
2. **Validation**: Input validation before processing
3. **Path Security**: Validates file paths to prevent directory traversal
4. **Graceful Degradation**: Falls back to safe defaults when possible
5. **Clear Messages**: Error messages explain what went wrong

**Error Flow:**
```
Tool Call → Validation → Processing → Error Handling → Response
```

If something fails, you get a clear error message explaining what happened and why. The code never crashes silently.

</details>

---

## How to Use It

<details>
<summary><b>How do I use store_session?</b></summary>

Just ask your AI assistant! For example:

- "Store this conversation as a session"
- "Save this discussion about database design"
- "Store this session with topic 'API design'"

The AI will automatically call the `store_session` tool with the current conversation.

**Manual Usage (if needed):**
The tool accepts:
- `conversation`: The conversation text (required)
- `topic`: Optional topic/title
- `format`: "plain" or "messages" (default: "plain")
- `sessionsDir`: Custom directory (optional)

But you rarely need to call it manually - just ask the AI!

</details>

<details>
<summary><b>Where are sessions stored?</b></summary>

Sessions are stored in:
```
<project-root>/.codearchitect/sessions/YYYY-MM-DD/session-YYYYMMDD-HHMMSS-topic.md
```

**Example:**
```
my-project/
  .codearchitect/
    sessions/
      2025-11-12/
        session-20251112-113210-database-design.md
        session-20251112-140530-api-discussion.md
```

**Custom Location:**
You can override this with:
- `CODEARCHITECT_SESSIONS_DIR` environment variable
- `sessionsDir` parameter when calling the tool

</details>

<details>
<summary><b>How do I find old sessions?</b></summary>

Sessions are just markdown files, so you can:

1. **Browse**: Navigate to `.codearchitect/sessions/` in your file explorer
2. **Search**: Use your IDE's search to find sessions by content
3. **Git**: Sessions are version controlled (if you commit them)
4. **grep**: Search from command line: `grep -r "database" .codearchitect/sessions/`

**Future Features:**
Planned tools for session management:
- `list_sessions` - Browse all sessions
- `search_sessions` - Full-text search
- `get_session` - Retrieve specific session

For now, use file system tools or git history.

</details>

<details>
<summary><b>Can I customize where sessions are stored?</b></summary>

Yes! Three ways:

1. **Environment Variable** (per-project or global):
   ```bash
   export CODEARCHITECT_SESSIONS_DIR="./my-sessions"
   ```

2. **Per-Call Parameter**:
   When calling `store_session`, pass `sessionsDir` parameter

3. **Default Behavior**:
   If neither is set, uses `.codearchitect/sessions/` in project root

**Priority:** Tool parameter → Environment variable → Default

</details>

---

## How to Work With Me

<details>
<summary><b>How can I contribute?</b></summary>

I'd love contributions! Here's how:

1. **Report Bugs**: Open an issue on GitHub
2. **Suggest Features**: Open an issue with your idea
3. **Submit PRs**: Fork, make changes, submit a pull request
4. **Improve Docs**: Documentation improvements are always welcome

**What I'm Looking For:**
- Bug fixes
- New features (especially from the roadmap)
- Documentation improvements
- Test coverage improvements
- Performance optimizations

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

</details>

<details>
<summary><b>How do I suggest a feature?</b></summary>

Multiple ways:

1. **GitHub Issues**: Open an issue describing your idea
2. **GitHub Discussions**: Start a discussion
3. **Contact Me**: 
   - GitHub: [@tairqaldy](https://github.com/tairqaldy)
   - Telegram: [@tairqaldy](https://t.me/tairqaldy)

**What to Include:**
- What problem does it solve?
- How would it work?
- Why is it useful?

I'm especially interested in features that align with the roadmap (session management, architecture tools, etc.).

</details>

<details>
<summary><b>How do I report a bug?</b></summary>

Open a GitHub issue with:

1. **Description**: What went wrong?
2. **Steps to Reproduce**: How can I reproduce it?
3. **Expected Behavior**: What should have happened?
4. **Actual Behavior**: What actually happened?
5. **Environment**: OS, Node version, IDE, etc.

**Example:**
```
Bug: Sessions not storing in custom directory

Steps:
1. Set CODEARCHITECT_SESSIONS_DIR="./custom"
2. Call store_session
3. Check directory

Expected: Session in ./custom/
Actual: Session in default location
```

The more details, the faster I can fix it!

</details>

<details>
<summary><b>What's the development workflow?</b></summary>

1. **Fork** the repository
2. **Clone** your fork
3. **Install**: `npm install`
4. **Build**: `npm run build`
5. **Test**: `npm test`
6. **Make Changes**: Edit code
7. **Test Again**: `npm test`
8. **Submit PR**: Push and create pull request

**Code Style:**
- TypeScript
- ESLint for linting
- Prettier for formatting
- Jest for testing

Run `npm run lint` and `npm run format` before submitting.

</details>

---

## Technical Details

<details>
<summary><b>What technologies does this use?</b></summary>

- **TypeScript**: Main language
- **Node.js**: Runtime (requires Node 18+)
- **@modelcontextprotocol/sdk**: MCP SDK for protocol implementation
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

**Why TypeScript?**
- Type safety catches bugs early
- Better IDE support
- Easier to maintain
- Industry standard for Node.js projects

</details>

<details>
<summary><b>How do I run it locally for development?</b></summary>

1. **Clone**: `git clone https://github.com/tairqaldy/codearchitect-mcp.git`
2. **Install**: `npm install`
3. **Build**: `npm run build`
4. **Link**: `npm link` (makes it available globally)
5. **Test**: `npm test`
6. **Dev Mode**: `npm run dev` (runs with tsx, auto-reloads)

**Testing:**
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report

**Linting:**
- `npm run lint` - Check for issues
- `npm run format` - Auto-format code

</details>

<details>
<summary><b>How is the code tested?</b></summary>

The code has comprehensive test coverage:

- **Unit Tests**: Test individual functions (`utils/`, `session/`)
- **Integration Tests**: Test full workflows (`store_session` end-to-end)
- **Edge Cases**: Empty conversations, long conversations, path validation, etc.

**Test Structure:**
```
tests/
├── unit/           # Unit tests for individual modules
└── integration/    # Integration tests for full workflows
```

**Coverage Goal**: 80%+ (currently achieved)

Run `npm run test:coverage` to see coverage report.

</details>

<details>
<summary><b>How does versioning work?</b></summary>

Follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

**Current Version**: 0.1.3

**Version Locations:**
- `package.json` - npm version
- `src/server.ts` - Server version
- `src/utils/markdown.ts` - Markdown footer version

All versions stay in sync.

</details>

---

## Troubleshooting

<details>
<summary><b>Sessions aren't being stored. What's wrong?</b></summary>

Check these:

1. **MCP Server Running?**: Check if `codearchitect-mcp` command works
2. **IDE Configuration**: Is MCP server configured in your IDE?
3. **Permissions**: Do you have write permissions to the project directory?
4. **Project Root**: Is the project root being detected correctly?

**Debug Steps:**
- Check IDE logs for MCP errors
- Try running `codearchitect-mcp` manually
- Check `.codearchitect/sessions/` directory exists
- Verify environment variables

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more details.

</details>

<details>
<summary><b>Why are sessions stored in the wrong location?</b></summary>

Check the priority order:

1. **Tool Parameter**: `sessionsDir` parameter (highest priority)
2. **Environment Variable**: `CODEARCHITECT_SESSIONS_DIR`
3. **Default**: `.codearchitect/sessions/` in project root

**Common Issues:**
- Environment variable not set correctly
- Project root detection failing
- Path resolution issues

Check `TROUBLESHOOTING.md` for solutions.

</details>

<details>
<summary><b>How do I debug MCP server issues?</b></summary>

The MCP server logs to **stderr** (standard error):

1. **Check IDE Logs**: Most IDEs show MCP server logs
2. **Run Manually**: `codearchitect-mcp` and check output
3. **Enable Debug Mode**: Set `DEBUG=1` environment variable (if supported)

**Common Log Messages:**
- `[CodeArchitect MCP] Server ready!` - Server started successfully
- `[CodeArchitect MCP] Fatal error:` - Server crashed

If you see errors, check:
- Node.js version (needs 18+)
- File permissions
- Path validity

</details>

---

## Future & Roadmap

<details>
<summary><b>What's coming next?</b></summary>

Check the [README.md](../README.md#-vision--roadmap) for the full roadmap, but here's what's planned:

**Session Management:**
- `list_sessions` - Browse all sessions
- `search_sessions` - Full-text search
- `get_session` - Retrieve specific session
- `delete_session` - Remove sessions

**Architecture Tools:**
- `analyze_architecture` - Analyze project structure
- `generate_diagrams` - Create architecture diagrams
- `document_system` - Auto-generate docs
- `review_design` - Review design decisions

**Development Workflow:**
- `track_decisions` - Track ADRs
- `manage_tech_debt` - Track technical debt
- `codebase_insights` - Codebase health

Want to see something sooner? [Suggest it](#how-do-i-suggest-a-feature)!

</details>

<details>
<summary><b>Why start with session storage?</b></summary>

Session storage is the foundation:

1. **Solves Immediate Problem**: I needed this now
2. **Simple to Build**: Low complexity, high value
3. **Foundation for Future**: Other features will build on stored sessions
4. **Proves Concept**: Validates the MCP approach works

Once sessions are stored, I can:
- Search across them (`search_sessions`)
- Analyze patterns (`codebase_insights`)
- Track decisions (`track_decisions`)

It's the first step in building a comprehensive architecture toolkit.

</details>

---

## Miscellaneous

<details>
<summary><b>Is this production-ready?</b></summary>

**Current Status**: `store_session` is production-ready and tested.

**Project Status**: Actively in development - more features coming!

The core functionality is:
- ✅ Tested (80%+ coverage)
- ✅ Documented
- ✅ Error handling
- ✅ Security validated

But the project is evolving. New features are being added regularly. If you encounter bugs, I'll fix them quickly!

</details>

<details>
<summary><b>Can I use this commercially?</b></summary>

Yes! It's MIT licensed, so you can:
- Use it commercially
- Modify it
- Distribute it
- Use it privately

Just include the license and copyright notice. See [LICENSE](../LICENSE) for details.

</details>

<details>
<summary><b>How do I stay updated?</b></summary>

- **GitHub**: Watch the repository for releases
- **npm**: `npm outdated codearchitect-mcp` to check for updates
- **Changelog**: Check [CHANGELOG.md](../CHANGELOG.md) for updates

**Update Command:**
```bash
npm install -g codearchitect-mcp@latest
```

</details>

---

**Have a question not answered here?** Open an issue on GitHub or reach out via [GitHub](https://github.com/tairqaldy) or [Telegram](https://t.me/tairqaldy)!

