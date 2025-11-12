# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

