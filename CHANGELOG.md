# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2025-11-19

### Added
- **Automatic export file detection**: `store_session` now automatically detects and processes Cursor/VS Code export files
  - Users export conversations to `.codearchitect/exports/` folder
  - Tool automatically finds newest export file (modified in last 10 minutes)
  - No need to manually extract conversation from context
- **VS Code JSON export support**: Full support for VS Code's complex JSON export format
  - Automatically detects and parses `.json` export files
  - Handles VS Code's nested structure: `{requests: [{message: {text: "..."}, response: [{value: "..."}]}]}`
  - Extracts user messages from `request.message.text` or `request.message.parts[].text`
  - Extracts assistant messages from `request.response[]` array, filtering out tool invocations
  - Skips non-text items (tool invocations, system messages) automatically
  - VS Code users: `Ctrl+Shift+P` → Export Chat → Name file → Save to exports folder
- **Export filename pattern matching**: Added `exportFilename` parameter to match specific export files
  - Example: `exportFilename: "resolve_mcp"` matches `cursor_resolve_mcp_configuration_issues.md` or `auth-implementation.json`
  - Useful when multiple export files exist
- **OS/IDE-specific instructions**: Tool provides platform-specific export folder paths
  - Detects Windows/Mac/Linux automatically
  - Detects Cursor vs VS Code automatically
  - Provides IDE-specific export instructions (Cursor: markdown, VS Code: JSON with naming guidance)
  - Provides exact folder path for user's environment

### Changed
- **Conversation parameter is now optional**: `store_session` can work without conversation parameter
  - If conversation provided → uses it directly (backward compatible)
  - If not provided → automatically looks for export file in `.codearchitect/exports/`
- **Enhanced error messages**: Clear instructions when export file not found
  - Step-by-step export instructions
  - OS/IDE-specific folder paths
  - Helpful error messages for edge cases

### Technical
- **New export parser**: Supports both Cursor (markdown) and VS Code (JSON) formats
  - **Cursor**: Parses markdown with `**User**` and `**Cursor**`/`**Assistant**` markers
  - **VS Code**: Parses complex nested JSON structure with `requests` array
    - Extracts user messages from `request.message.text` or `request.message.parts[].text`
    - Extracts assistant messages from `request.response[]` array
    - Filters out tool invocations (`mcpServersStarting`, `prepareToolInvocation`, `toolInvocationSerialized`)
    - Combines multiple response parts into coherent assistant messages
  - Auto-detects format by file extension (`.md` vs `.json`)
  - Preserves code blocks and formatting
  - Converts to internal conversation format
- **Export folder management**: Automatic creation and detection
  - Creates `.codearchitect/exports/` folder if needed
  - Finds files by modification time (supports both `.md` and `.json`)
  - Supports pattern matching for specific files

### Documentation
- **Complete documentation overhaul**: Rewritten for precision and conciseness
  - README: Streamlined quick start with clear steps and dropdown menus
  - API docs: Precise tool reference with examples
  - FAQ: Concise Q&A format
  - Onboarding: Step-by-step workflow guide
  - Troubleshooting: Specific fixes without fluff
- **Global Cursor configuration**: Updated setup to use global config (more reliable)
  - Windows: `C:\Users\YourName\.cursor\mcp.json`
  - Mac/Linux: `~/.cursor/mcp.json`
  - Works across all projects (not project-specific)
  - Access via Cursor Settings → Tools & MCP
- **Enhanced help tool**: Added iterative workflow guide
  - 6-step knowledge base building process
  - Storage locations clearly explained
  - Tips for continuous knowledge growth
  - Feature details with when-to-use guidance
- **Separated IDE instructions**: Clear separation between Cursor and VS Code workflows
  - Cursor: Markdown exports via three dots menu
  - VS Code: JSON exports via command palette with naming guidance
  - IDE-specific onboarding sections
- **Verification step**: Clear setup verification instructions
  - Check MCP status (green/connected)
  - Test with `"use codearchitect"`
  - Reload IDE instructions

[0.1.7]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.7

## [0.1.6] - 2025-11-18

### Changed
- **Simplified storage logic**: Always saves to main `.codearchitect/` folder in home directory (`~/.codearchitect/sessions/`)
  - No automatic project detection - prevents data loss from random project detection
  - Reliable main "second brain" location that always works
  - Optional project save: Users can specify `projectDir` to save to both main folder and project folder
- **Removed customization complexity**: Removed `sessionsDir` parameter from tool schemas
  - Simpler setup - just works automatically
  - One reliable default location
- **Enhanced tool descriptions**: Structured with clear sections (WHEN TO USE, STORAGE BEHAVIOR, WORKFLOW, etc.)
  - Better AI assistant guidance
  - Clearer instructions for dual-save feature

### Fixed
- **Project detection issues**: Removed automatic project detection that caused sessions to save in wrong locations
- **Tool visibility**: Fixed issue where only one tool was visible (all 3 tools now properly registered)
- **Configuration complexity**: Simplified to single reliable setup option using `npx`

### Documentation
- Simplified README with one clear setup option
- Updated all docs to reflect new storage behavior (main folder default)
- Added human-friendly introduction explaining what MCP server is and why to use it

[0.1.6]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.6

## [0.1.5] - 2025-11-17

### Added
- **`codearchitect_help` tool**: New help tool for discovering CodeArchitect features
  - Lists all available features with descriptions and examples
  - Provides usage patterns and next steps
  - Can get detailed help for specific features
- **Enhanced session storage**: Dual-file storage system for better organization
  - Creates topic-named folders for better readability
  - Stores `summary.md` and `full.md` files in each folder
  - Summary file includes short summary and detailed request/response pairs
  - Full context file includes complete JSON messages array (TOON-optimized) + human-readable format
  - Automatic removal of redundant suffixes from folder names (e.g., "-summary", "-session")
- **Improved tool descriptions**: Enhanced AI assistant guidance
  - Clear "use codearchitect" usage patterns
  - Compact, user-focused descriptions
  - Explicit instructions to pass full conversation content (not summaries)
  - Better when-to-use guidance for each tool

### Changed
- **Session storage structure**: Reorganized from flat files to folder-based organization
  - Old: `session-YYYYMMDD-HHMMSS-topic-summary.md` and `session-YYYYMMDD-HHMMSS-topic-full.md`
  - New: `topic-folder-name/summary.md` and `topic-folder-name/full.md`
  - More readable and organized structure
- **Retrieval system**: Enhanced to handle both old and new storage formats
  - Automatically detects and handles folder-based sessions
  - Smart file detection (prefers full context when available)
  - Groups dual-file sessions in listings
- **Markdown parser**: Updated to parse new full context format with JSON section
  - Extracts JSON messages from full context files
  - Falls back to markdown parsing for backward compatibility
- **Tool descriptions**: Simplified and made more user-friendly
  - Removed technical details users don't need (like TOON compression details)
  - Focused on practical usage and examples
  - Added next step suggestions

### Performance
- Full context files store complete JSON messages array ready for TOON conversion
- Automatic TOON format optimization when retrieving sessions (~40% token reduction)

### Documentation
- Updated API documentation with new `codearchitect_help` tool
- Updated storage structure documentation
- Enhanced usage examples with folder-based structure

[0.1.5]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.5

## [0.1.4] - 2025-01-15

### Added
- **`get_session` tool**: New tool to retrieve stored conversation sessions
  - Get specific session by filename
  - List all sessions (optionally filtered by date)
  - Support for limiting number of results
- **TOON format support**: ~40% token reduction for LLM interactions
  - Automatic format selection (`auto` mode) chooses best format
  - Manual format selection (`json` or `toon`)
  - Optimized for uniform data structures (message arrays, session lists)
  - New `toon.ts` utility module for TOON encoding/decoding
- **Markdown parser**: New utility to parse stored session files
  - Extracts topic, date, and conversation content
  - Parses structured message format
- **Session listing functionality**: List sessions with metadata
  - Filter by date
  - Sort by date (newest first)
  - Include file size information

### Changed
- Enhanced `get_session` tool with format options for token optimization
- Updated version to 0.1.4

### Performance
- **~40% token reduction** when using TOON format for uniform data
- Automatic detection of data structures suitable for TOON encoding
- Fallback to JSON for non-uniform or small datasets

### Documentation
- Added TOON benchmark script (`scripts/benchmark-toon.ts`)
- Added TOON benchmark documentation (`scripts/TOON_BENCHMARK_README.md`)
- Added git workflow cheatsheet (`dev-docs/GIT_WORKFLOW_CHEATSHEET.md`)

[0.1.4]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.4

## [0.1.3] - 2025-11-12

### Fixed
- **Session boundary issue**: Fixed problem where `store_session` was including conversation data from previous sessions in new session storage
- Updated tool description to clarify that only the current conversation thread should be passed, not data from previous stored sessions
- Ensures each stored session only contains messages from the current session context

### Changed
- Enhanced `store_session` tool description to explicitly state that only current session data should be included

[0.1.3]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.3

## [0.1.2] - 2025-11-11

### Changed
- **Complete README restructure**: Improved documentation with collapsible sections for better readability
  - Added Vision & Roadmap section outlining future architecture and system design tools
  - Added Important Links section (npm package, GitHub, author profile)
  - Added Project Status disclaimer about active development
  - Added "Suggest a Feature" section with multiple contact methods
  - Enhanced Contributing section with development setup guide
  - Updated VS Code setup instructions to match actual wizard workflow
  - Reorganized content with collapsible sections for Installation, Setup, Usage, API Reference, Troubleshooting
- Updated `.npmignore` to exclude `.cursor/` and `.codearchitect/` folders from npm package

### Documentation
- Enhanced README with comprehensive usage examples and storage location explanations
- Improved VS Code setup guide with step-by-step wizard instructions
- Added project vision explaining evolution into architecture assistance toolkit
- Clarified that `store_session` is the first of many planned features

[0.1.2]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.2

## [0.1.1] - 2025-11-11

### Added
- **Configurable sessions directory**: Sessions storage location can now be customized
  - New `sessionsDir` parameter in `store_session` tool for per-call customization
  - `CODEARCHITECT_SESSIONS_DIR` environment variable support for global or per-project configuration
  - Priority order: tool parameter → environment variable → default (`.codearchitect/sessions/` in project root)
- Enhanced workspace detection with improved IDE environment variable support

### Changed
- Improved README with clearer setup instructions and configuration examples
- Updated API documentation with `sessionsDir` parameter and configuration examples
- Enhanced troubleshooting guide with sessions directory configuration solutions

### Documentation
- Added comprehensive examples for per-project vs global storage strategies
- Updated setup instructions for Cursor and VS Code with `CODEARCHITECT_SESSIONS_DIR` configuration
- Clarified sessions directory priority order in documentation

[0.1.1]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.1

## [0.1.0] - 2025-11-11

### Added
- Initial release of CodeArchitect MCP
- `store_session` tool for saving AI conversation sessions
- Automatic project root detection
- Smart topic extraction from conversations
- Markdown formatting for saved sessions
- Comprehensive error handling
- Support for both plain text and structured message formats
- Filename collision handling
- Input validation and security checks
- Full test coverage (80%+)
- Complete documentation (README, API docs, troubleshooting guide)

### Features
- Stores sessions in `.codearchitect/sessions/YYYY-MM-DD/` directory structure
- Auto-organizes sessions by date
- Extracts topics from conversations or accepts explicit topics
- Handles edge cases: empty conversations, long conversations, permission errors
- Validates file paths to prevent directory traversal attacks

### Documentation
- README with installation and usage instructions
- API documentation with examples
- Troubleshooting guide
- Contributing guidelines

[0.1.0]: https://github.com/tairqaldy/codearchitect-mcp/releases/tag/v0.1.0

