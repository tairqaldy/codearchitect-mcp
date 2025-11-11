# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

