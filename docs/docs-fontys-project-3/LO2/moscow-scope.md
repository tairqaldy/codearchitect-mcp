# MoSCoW Scope Definition

**CodeArchitect MCP Ecosystem Project**

**Date**: Week 2 (November 2025)  
**Author**: Tair Kaldybayev  
**Links to**: S1-LO2 (Creating professional IT products)

---

## Introduction

This document defines the project scope using the MoSCoW prioritization method (Must have, Should have, Could have, Won't have) for a 5-week implementation timeline. The scope focuses on core functionality for solving the context continuity problem in AI-assisted development.

## Project Goal

Develop a Model Context Protocol (MCP) server that enables developers to store, organize, and retrieve AI conversation sessions, solving the context continuity problem in AI-assisted development.

## MoSCoW Analysis

### MUST HAVE (Critical for MVP - Weeks 1-3)

#### M1: Core Session Storage
- **M1.1**: `store_session` tool for saving conversations
- **M1.2**: Store sessions as markdown files in `~/.codearchitect/sessions/`
- **M1.3**: Date-organized folder structure: `YYYY-MM-DD/topic-name/`
- **M1.4**: Automatic topic extraction from conversations
- **M1.5**: Support both direct conversation input and export file detection
- **M1.6**: Path validation for security

**Rationale**: Core functionality - without storage, the system cannot function.

#### M2: Core Session Retrieval
- **M2.1**: `get_session` tool for retrieving sessions
- **M2.2**: List all stored sessions
- **M2.3**: Retrieve specific session by filename/topic
- **M2.4**: Filter sessions by date (YYYY-MM-DD)
- **M2.5**: Support JSON format output

**Rationale**: Required for users to access stored knowledge.

#### M3: MCP Integration
- **M3.1**: Integrate with Model Context Protocol SDK
- **M3.2**: Work with Cursor IDE
- **M3.3**: Work with VS Code IDE
- **M3.4**: Clear error messages and graceful error handling

**Rationale**: Required for system to be usable in target environments.

#### M4: Basic Documentation
- **M4.1**: README with installation instructions
- **M4.2**: Usage examples for core features
- **M4.3**: Basic troubleshooting guide

**Rationale**: Required for user adoption and setup.

### SHOULD HAVE (Important - Weeks 3-4)

#### S1: Enhanced Storage Features
- **S1.1**: Automatic export file detection from `~/.codearchitect/exports/`
- **S1.2**: Support Cursor and VS Code export formats
- **S1.3**: Optional project folder storage (`projectDir` parameter)
- **S1.4**: Export filename pattern matching

**Rationale**: Significantly improves user experience and workflow integration.

#### S2: TOON Format Support
- **S2.1**: Support TOON format encoding/decoding
- **S2.2**: Achieve ~40% token reduction with TOON format
- **S2.3**: Format options: `json`, `toon`, `auto`
- **S2.4**: Automatic format selection based on data structure

**Rationale**: Important for efficiency when retrieving large sessions.

#### S3: Help System
- **S3.1**: `codearchitect_help` tool
- **S3.2**: List all available features with examples
- **S3.3**: Provide workflow guidance

**Rationale**: Improves discoverability and reduces support burden.

#### S4: Search Functionality
- **S4.1**: `search_session` tool for full-text search
- **S4.2**: Relevance scoring and context snippets
- **S4.3**: Date filtering (date, dateFrom, dateTo)
- **S4.4**: Result limiting

**Rationale**: Enhances usability by enabling discovery of past conversations.

### COULD HAVE (Nice to have - Week 5 if time permits)

#### C1: Landing Page
- **C1.1**: Project showcase landing page
- **C1.2**: NPM download statistics display
- **C1.3**: Links to documentation

**Priority**: Medium - Important for visibility but not critical for functionality.

#### C2: Enhanced Documentation
- **C2.1**: Comprehensive API documentation
- **C2.2**: Developer documentation (architecture, folder structure)
- **C2.3**: FAQ section

**Priority**: Low - Can be enhanced post-MVP.

#### C3: Testing & Quality
- **C3.1**: Unit tests for core functionality
- **C3.2**: Integration tests for MCP tools
- **C3.3**: Test coverage target: 80%+

**Priority**: Medium - Important for reliability but can be incremental.

### WON'T HAVE (Out of scope for 5 weeks)

#### W1: Cloud Features
- Cloud synchronization or backup
- Multi-user or collaboration features
- Database storage option

**Rationale**: Planned for future Coarc platform expansion.

#### W2: Advanced Features
- CLI interface
- Architecture analysis tools
- Design pattern suggestions
- Real-time collaboration

**Rationale**: Scope limited to core session storage/retrieval for MVP.

#### W3: Documentation Site
- Mintlify-powered documentation site
- Interactive API reference
- Advanced documentation features

**Rationale**: Can be added post-MVP if needed.

## Implementation Timeline

### Week 1-2: Foundation
- MCP server setup and basic structure
- Core `store_session` implementation (M1)
- Basic `get_session` implementation (M2)
- MCP integration and testing (M3)

### Week 3: Enhanced Features
- Export file detection (S1)
- TOON format support (S2)
- Help system (S3)

### Week 4: Search & Polish
- Search functionality (S4)
- Error handling improvements
- Documentation completion (M4)

### Week 5: Optional & Deployment
- Landing page (C1) if time permits
- Testing improvements (C3)
- NPM publishing
- Final documentation polish

## Success Criteria

The project will be considered successful if:

1. All MUST HAVE requirements are implemented and functional
2. At least 80% of SHOULD HAVE requirements are implemented
3. System is published to NPM and installable
4. Core documentation is complete and clear
5. System works with both Cursor and VS Code
6. At least 2-3 users can successfully install and use the system

## Constraints

- **Time**: 5-week project timeline
- **Scope**: Focus on core session storage/retrieval
- **Technology**: Must use MCP SDK, Node.js v18+
- **License**: CC-BY-NC-4.0 (non-commercial)

---

**Document Status**: Created in Week 2 for scope definition  
**Next Document**: Requirements Document (Detailed)

