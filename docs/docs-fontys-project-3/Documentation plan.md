# Fontys Project Documentation Plan - Summary

## Project Timeline
- **Start Date**: November 3, 2025
- **End Date**: December 6, 2025
- **Duration**: 5 weeks
- **Parallel Project**: Group Project 4
- **Semester Track**: Software Design & Engineering (SDE)
- **Future Interest**: AI track (potential choice for Semester 2 or 3)

## Current Project Status
- **Version**: 0.1.8 (as of 2025-01-20)
- **Features**: `store_session`, `get_session`, `search_session`, `codearchitect_help`
- **GitHub Stars**: 5 (from [GitHub repository](https://github.com/tairqaldy/codearchitect-mcp))
- **Commits**: 17 commits
- **Links**:
  - GitHub: https://github.com/tairqaldy/codearchitect-mcp
  - NPM: https://www.npmjs.com/package/codearchitect-mcp
  - Landing Page: https://codearchitect-mcp.vercel.app/
  - Documentation: https://codearchitect.mintlify.app/
  - Demo Video: [To be created]

---

## Documents to Create (11 Total)

### Week 1 (Nov 3-9): Orientation & Planning
1. **`orientation-report.md`** - Topic exploration, why CodeArchitect MCP project
   - Links to: S1-LO1
   - Written as: "Completed during first week orientation period"
   - Date context: Early November

2. **`reflection-choice-path.md`** - Why SDE track, why this project
   - Links to: S1-LO1
   - Written as: "After choosing project, reflecting on path alignment"
   - Date context: Nov 5-6

3. **`analysis-advice-project-plan.md`** (Update existing)
   - Links to: S1-LO2
   - Written as: "Project planning document created after orientation"
   - Date context: Nov 7
   - **Updates needed**: Version info, finished products, scope, time plan (5 weeks), risks, Coarc future vision

### Week 2 (Nov 10-16): Requirements & Design
4. **`requirements-document.md`** - Functional/non-functional, MoSCoW
   - Links to: S1-LO2
   - Written as: "Requirements analysis completed before implementation"
   - Date context: Nov 10-11

5. **`design-ui-document.md`** - Architecture, system design, MCP integration
   - Links to: S1-LO2
   - Written as: "Design phase documentation"
   - Date context: Nov 12-13
   - Include: Architecture diagrams, file structure, MCP protocol design

6. **`system-architecture-flowchart.md`** - Visual flow diagrams
   - Links to: S1-LO2
   - Written as: "Flowcharts created during design phase"
   - Date context: Nov 14
   - Include: Session storage flow, retrieval flow, search flow, MCP interaction

### Week 3 (Nov 17-23): Implementation
7. **`code-explanation-document.md`** - Technical implementation details
   - Links to: S1-LO2, S1-LO3
   - Written as: "Written during core implementation phase"
   - Date context: Nov 17-19
   - Include: Code structure, key functions, design patterns, implementation decisions

### Week 4 (Nov 24-30): Testing & Validation
8. **`validation-plan-document.md`** - Test plan, success criteria
   - Links to: S1-LO3
   - Written as: "Testing plan created before peer testing"
   - Date context: Nov 24

9. **`peer-testing-feedback.md`** - Feedback collection, implemented changes
   - Links to: S1-LO3
   - Written as: "Feedback received and addressed"
   - Date context: Nov 27

10. **`peer-pitch-presentation.md`** - Presentation slides/document
    - Links to: S1-LO3
    - Written as: "Prepared for peer presentation"
    - Date context: Nov 28

### Week 5 (Dec 1-6): Finalization
11. **`personal-reflection.md`** - Personal growth, challenges, lessons
    - Links to: S1-LO4
    - Written as: "Final reflection after project completion"
    - Date context: Dec 1-2

---

## Required Data, Sources & References

### Project Metrics (Collect/Verify)
- [ ] NPM download statistics (screenshot from https://www.npmjs.com/package/codearchitect-mcp)
- [ ] GitHub statistics: 5 stars, 0 forks, 17 commits (screenshot)
- [ ] Test coverage report (run `npm run test:coverage`)
- [ ] TOON format benchmark results (run `npm run benchmark:toon`)

### Technical Documentation (Create)
- [ ] System architecture diagram
- [ ] MCP protocol interaction flow diagram
- [ ] Session storage flow diagram
- [ ] Retrieval flow diagram
- [ ] Search algorithm flow diagram
- [ ] Export file detection flow diagram
- [ ] Code structure documentation (from `src/` directory)

### Screenshots (Collect)
- [ ] MCP server in action (Cursor/VS Code) - already have some in `img/` folder
- [ ] Landing page (https://codearchitect-mcp.vercel.app/)
- [ ] Documentation site (https://codearchitect.mintlify.app/)
- [ ] GitHub repository page
- [ ] NPM package page

### External Links (Verified)
- GitHub Repository: https://github.com/tairqaldy/codearchitect-mcp
- NPM Package: https://www.npmjs.com/package/codearchitect-mcp
- Landing Page: https://codearchitect-mcp.vercel.app/
- Documentation Site: https://codearchitect.mintlify.app/
- Demo Video: [To be created]

### Internal References
- [ ] CHANGELOG.md (version history)
- [ ] README.md (project overview)
- [ ] docs/API.md (API reference)
- [ ] package.json (dependencies, version)
- [ ] Source code structure (`src/` directory)

---

## Coarc Future Vision Information

### Sources Available
- `coarc-platform/README.md` - Platform overview
- `coarc-platform/docs/FEATURE_WORKFLOW.md` - Feature documentation
- `coarc-backend/README.md` - Backend structure

### Content for Future Vision Section

**Coarc Overview**: Centralized cloud platform for developers and teams

**Key Features**:
1. **Cloud Sync & Backup**: vs. local-only MCP server
2. **Team Collaboration**: Shared knowledge bases for teams
3. **Architecture Documentation Tools**: System design templates and patterns
4. **Code Review Feature**: AI-powered code review assistance
5. **Enhanced Prompt Generation**: Improve AI prompt quality
6. **API Access**: Programmatic integration via REST API
7. **Analytics & Usage Tracking**: Monitor usage, costs, performance

**Evolution Path**: 
- **Phase 1**: CodeArchitect MCP (local, individual developer)
- **Phase 2**: Coarc Platform (cloud, teams, advanced features)

**Business Model**: 
- **Free**: 10 sessions/month, 1,000 API calls, basic features
- **Pro** ($29/mo): Unlimited sessions, 50,000 API calls, advanced features
- **Enterprise** ($99/mo): Unlimited everything, SSO, dedicated support

**Technical Foundation**:
- Next.js 16 (App Router) frontend
- Supabase backend (PostgreSQL database)
- Clerk authentication
- MCP server integration
- TypeScript throughout

---

## Writing Guidelines

### Retrospective Writing Style
- All documents must be written as if created during the 5-week project period
- Each document should reflect appropriate "week of creation" context
- Use past tense for completed activities at time of writing
- Use future tense for planned activities at time of writing
- Documents should reference each other in chronological order

### Document Structure
- Follow Fontys format/structure (based on Portflow examples from screenshots)
- Explicitly link to relevant Learning Outcomes (S1-LO1, S1-LO2, S1-LO3, S1-LO4)
- Reference other documents to show relationships and evolution
- Include timestamps and context for when document was created

### Evidence Organization
- Match Portflow organization structure
- Include time tracking (hours spent on each phase/activity)
- Link all evidence documents together
- Use screenshots and diagrams as evidence

---

## Timeline Summary

**Week 1** (Nov 3-9): Orientation & Planning → 3 documents
**Week 2** (Nov 10-16): Requirements & Design → 3 documents  
**Week 3** (Nov 17-23): Implementation → 1 document
**Week 4** (Nov 24-30): Testing & Validation → 3 documents
**Week 5** (Dec 1-6): Finalization → 1 document + finalization

**Total**: 11 documents + updates to existing project plan

**Time Constraint**: All documents needed in 1-2 days, but written as if created throughout 5 weeks

---

## Next Steps

1. Review this plan
2. Update `project-plan.md` with current project status and 5-week timeline
3. Collect all required metrics, screenshots, and data
4. Create architecture diagrams and flowcharts
5. Write all 11 documents following the timeline above
6. Finalize and organize all evidence for portfolio

