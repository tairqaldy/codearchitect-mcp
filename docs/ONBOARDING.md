# 🚀 Smart Developer Onboarding: MCP-Powered Development

**5-minute setup → Smarter development → Better code → Fewer tokens → Larger context**

## ⚡ Quick Start (2 minutes)

### 1. Install CodeArchitect MCP
```bash
npm install -g codearchitect-mcp
```

### 2. Configure Your IDE

**Cursor:**
```json
// .cursor/mcp.json
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

**VS Code:** `Ctrl+Shift+P` → `MCP: Add Server...` → `codearchitect-mcp`

### 3. Restart IDE → Done! ✅

### 4. Start Using Immediately! 🚀

After installation, you can start using CodeArchitect right away - no need to read all the docs! Simply ask your AI assistant:

```
use codearchitect
```

or

```
codearchitect help
```

The AI will show you all available features with examples and guide you through using them. That's it! You're ready to start storing and retrieving conversations.

**Pro tip:** Just say `"use codearchitect"` anytime you want to see what's available, or `"use codearchitect store_session"` to save a conversation.

---

## 🧠 Become a Smarter Developer (3 minutes)

### The Problem You're Solving

**Before MCP:**
- ❌ Lose valuable AI conversations
- ❌ Repeat explanations to AI
- ❌ Waste tokens on redundant context
- ❌ Hit context limits faster
- ❌ Less accurate AI responses

**After MCP:**
- ✅ Preserve all important discussions
- ✅ Reference past conversations instantly
- ✅ ~40% token reduction with TOON format
- ✅ Larger effective context windows
- ✅ More accurate AI responses

---

## 🎯 Core Workflow: Store → Retrieve → Optimize

### 1. Store Important Conversations

**When to store:**
- Architecture decisions
- Complex problem-solving sessions
- Design pattern discussions
- API design conversations
- Debugging breakthroughs

**How:**
```
use codearchitect store_session
use codearchitect store_session "authentication implementation"
```

Or simply:
```
Store this conversation about implementing authentication
```

**Pro tip:** Store sessions **during** conversations, not after. AI has full context. Use `"use codearchitect"` to discover features without reading docs!

### 2. Retrieve When Needed

**Get specific session:**
```
use codearchitect get_session authentication-implementation
```

**List recent sessions:**
```
use codearchitect get_session 2025-01-15
```

**List all sessions:**
```
use codearchitect get_session
```

**Why this matters:** Instead of re-explaining everything, retrieve past context. Saves ~60% tokens.

### 3. Token Optimization Strategy

**Use TOON format** (automatic with `get_session`):
- ~40% token reduction for uniform data
- Automatic fallback to JSON when needed
- Works seamlessly with LLMs

**Before:**
```json
{
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```
**~200 tokens**

**After (TOON):**
```
messages:
  role: user
  content: ...
  role: assistant
  content: ...
```
**~120 tokens** (40% reduction)

---

## 🏗️ Project Structure Best Practices

### Organize by Features (Like CodeArchitect MCP)

```
your-project/
├── src/
│   ├── feature-1/          # Self-contained feature
│   │   ├── FeatureManager.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── feature-2/
│   └── shared/              # Shared utilities
│       ├── utils.ts
│       └── types.ts
└── .codearchitect/
    └── sessions/            # Your AI conversation history
        └── 2025-01-15/
            ├── authentication-implementation/
            │   ├── summary.md
            │   └── full.md
            └── database-migration/
                ├── summary.md
                └── full.md
```

**Benefits:**
- Clear separation of concerns
- Easy to find code
- Scalable architecture
- Better AI understanding

### Store Sessions Per Feature

```
use codearchitect store_session "user authentication feature"
```

Sessions are automatically organized in topic-named folders by date. Use descriptive topics - redundant suffixes like "-summary" or "-session" are automatically removed for cleaner folder names.

---

## 💡 Pro Tips for Maximum Efficiency

### 1. **Context Window Strategy**

**Bad:** Dump entire codebase into every conversation
**Good:** Store feature-specific sessions, retrieve when needed

**Example:**
```
# Instead of explaining auth system every time:
use codearchitect get_session authentication-implementation

# AI now has full context with 40% fewer tokens
```

### 2. **Session Naming Convention**

Use descriptive topics:
- ✅ `authentication-implementation`
- ✅ `database-migration-strategy`
- ✅ `api-design-rest-vs-graphql`
- ❌ `session-1`, `test`, `conversation`

### 3. **Build Knowledge Base**

Store sessions for:
- **Architecture decisions** → Reference later
- **Complex implementations** → Reuse patterns
- **Debugging sessions** → Learn from solutions
- **Code reviews** → Track improvements

### 4. **Team Collaboration**

Commit `.codearchitect/sessions/` to git:
- Share knowledge across team
- Onboard new developers faster
- Track decision history
- Build institutional memory

---

## 📊 Token Savings Calculator

**Scenario:** Working on authentication feature

**Without MCP:**
- Explain auth system: ~500 tokens
- Explain requirements: ~300 tokens
- Explain codebase structure: ~400 tokens
- **Total per conversation: ~1,200 tokens**

**With MCP:**
- Retrieve stored session: ~200 tokens (TOON format)
- Explain new requirements: ~300 tokens
- **Total: ~500 tokens** (58% reduction)

**Over 10 conversations:** Save ~7,000 tokens = **$0.14-0.70** (depending on model)

**Over 100 conversations:** Save ~70,000 tokens = **$1.40-7.00**

Plus: **Better accuracy** from consistent context.

---

## 🎓 Learning Path

### Week 1: Setup & Basics
- [ ] Install CodeArchitect MCP
- [ ] Configure IDE
- [ ] Store first 3 conversations
- [ ] Retrieve one session

### Week 2: Optimization
- [ ] Store 10+ sessions
- [ ] Use `get_session` in conversations
- [ ] Notice token reduction
- [ ] Organize sessions by feature

### Week 3: Advanced
- [ ] Build feature knowledge base
- [ ] Share sessions with team
- [ ] Use date filtering
- [ ] Optimize session topics

### Week 4: Mastery
- [ ] Automate session storage
- [ ] Create session templates
- [ ] Build project structure patterns
- [ ] Teach others

---

## 🔥 Quick Wins

**Right now:**
1. Say `"use codearchitect"` to see available features
2. Store your current conversation with `"use codearchitect store_session"`
3. List all sessions with `"use codearchitect get_session"`
4. Get one session and notice the token difference

**This week:**
1. Store 5 architecture discussions
2. Use `get_session` in 3 conversations
3. Measure token savings
4. Share with team

**This month:**
1. Build knowledge base (50+ sessions)
2. Optimize project structure
3. Document patterns
4. Become the MCP expert

---

## 🆘 Troubleshooting

**MCP server not showing tools?**
- Restart IDE
- Check `codearchitect-mcp --version`
- Verify config file syntax

**Sessions not saving?**
- Check `.codearchitect/sessions/` exists
- Verify write permissions
- Check MCP server logs

**Not seeing token reduction?**
- Ensure using `get_session` (not manual copy-paste)
- Check format is `auto` or `toon`
- Verify data is uniform (message arrays)

---

## 📚 Next Steps

- [Full Documentation](../README.md)
- [API Reference](./API.md)
- [FAQ](./FAQ.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

## 🎯 Remember

> **Smart developers don't repeat themselves. They store, retrieve, and optimize.**

**Three rules:**
1. **Store** important conversations
2. **Retrieve** when needed (don't re-explain)
3. **Optimize** with TOON format

**Result:** Smarter development, fewer tokens, better code.

---

**Made with ❤️ by [CodeArchitect MCP](https://github.com/tairqaldy/codearchitect-mcp)**

*Questions? [Open an issue](https://github.com/tairqaldy/codearchitect-mcp/issues) or [reach out](https://t.me/tairqaldy)*

