# CodeArchitect MCP

**Your AI conversations shouldn't disappear.** CodeArchitect MCP automatically saves and retrieves your discussions with AI assistants, solving context continuity for developers. Never re-explain architecture decisions or code solutions. Built on Model Context Protocol (MCP) - works seamlessly with Cursor and VS Code. Expanding into comprehensive system design and architecture assistance.

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) (v18+). Open terminal → type `node --version` to verify.

### 2. Install Package
```bash
npm install -g codearchitect-mcp
```

### 3. Configure IDE

<details>
<summary><b>📘 Cursor Users - Complete Setup Guide</b></summary>

#### Step 1: Open Cursor Settings
1. Open Cursor (the code editor)
2. Look at the bottom left corner - click the **gear icon** ⚙️ (or press `Ctrl+,` on Windows/Linux, `Cmd+,` on Mac)
3. This opens Settings

#### Step 2: Find MCP Settings
1. In the Settings search box at the top, type: **"MCP"** or **"Model Context Protocol"**
2. You should see **"Tools & MCP"** section
3. Click on it

#### Step 3: Add CodeArchitect Server
1. Look for **"MCP Servers"** or **"Add Server"** button
2. Click **"Add Server"** or the **+** button
3. A form will appear. Fill it in:
   - **Name**: `codearchitect` (or any name you like)
   - **Command**: `npx`
   - **Args**: `-y codearchitect-mcp@latest`
4. Click **Save** or **OK**

**OR** (Alternative Method - Manual Config File):
1. Close Cursor
2. Open File Explorer (Windows) or Finder (Mac)
3. Go to your home folder:
   - **Windows**: `C:\Users\YourName\.cursor\` (create `.cursor` folder if it doesn't exist)
   - **Mac/Linux**: `~/.cursor/` (create `.cursor` folder if it doesn't exist)
4. Create a file named `mcp.json` in that folder
5. Open it in any text editor and paste this:
```json
{
  "mcpServers": {
    "codearchitect": {
      "command": "npx",
      "args": ["-y", "codearchitect-mcp@latest"]
    }
  }
}
```
6. Save the file
7. Open Cursor again

#### Step 4: Verify It's Working
1. In Cursor, look at the bottom status bar
2. You should see **"MCP"** or **"codearchitect"** with a green dot (connected)
3. If you see red or yellow, something went wrong - see troubleshooting below

#### Step 5: Reload Cursor
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: **"Reload Window"**
3. Press Enter
4. Cursor will restart - wait for it to finish loading

#### Step 6: Test It Works
1. Open any chat/conversation in Cursor
2. Type: **"use codearchitect"**
3. You should see a list of features and workflow guide
4. If you see an error, see troubleshooting below

#### Export Chat (How to Save Conversations)
1. In Cursor chat, look at the top right corner
2. Click the **three dots** menu (⋯)
3. Click **"Export Chat"**
4. A save dialog appears
5. Navigate to: `C:\Users\YourName\.codearchitect\exports\` (Windows) or `~/.codearchitect/exports/` (Mac/Linux)
   - Create the `exports` folder if it doesn't exist
6. Click **Save**
7. The file will be saved as `.md` format (that's normal)

#### Need Help?
**Stuck at any step?** Reach out to Tair:
- **Email**: Check GitHub profile for contact
- **GitHub Issues**: [github.com/tairqaldy/codearchitect-mcp/issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- Mention which step you're on and what's happening

</details>

<details>
<summary><b>📘 VS Code Users - Complete Setup Guide</b></summary>

#### Step 1: Open Command Palette
1. Open VS Code (Visual Studio Code)
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. A box appears at the top - this is the Command Palette

#### Step 2: Add MCP Server
1. In the Command Palette box, type: **"MCP: Add Server"**
2. You should see **"MCP: Add Server..."** appear in the list
3. Click it (or press Enter)

#### Step 3: Choose Installation Method
1. A menu appears asking how to install
2. Choose: **"Download with npm package"** (click it)
3. Another box appears asking for the package name

#### Step 4: Enter Package Name
1. Type exactly: **`codearchitect-mcp`**
2. Press Enter
3. VS Code will download and install it (wait a few seconds)

#### Step 5: Verify It's Working
1. Look at the bottom right corner of VS Code
2. You should see **"MCP"** or **"codearchitect"** with a green indicator (connected)
3. If you see red or an error, see troubleshooting below

#### Step 6: Reload VS Code
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) again
2. Type: **"Developer: Reload Window"**
3. Press Enter
4. VS Code will restart - wait for it to finish

#### Step 7: Test It Works
1. Open any chat/conversation in VS Code
2. Type: **"use codearchitect"**
3. You should see a list of features and workflow guide
4. If you see an error, see troubleshooting below

#### Export Chat (How to Save Conversations)
1. In VS Code chat, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: **"Export Chat"**
3. Click **"Export Chat"** from the list
4. A save dialog appears
5. **IMPORTANT**: Name your file something meaningful, like:
   - `auth-implementation.json`
   - `database-design.json`
   - `api-routes.json`
   - (Use `.json` at the end - VS Code will add it automatically)
6. Navigate to: `C:\Users\YourName\.codearchitect\exports\` (Windows) or `~/.codearchitect/exports/` (Mac/Linux)
   - Create the `exports` folder if it doesn't exist
7. Click **Save**
8. The file will be saved as `.json` format (that's normal - CodeArchitect supports this!)

#### Need Help?
**Stuck at any step?** Reach out to Tair:
- **Email**: Check GitHub profile for contact
- **GitHub Issues**: [github.com/tairqaldy/codearchitect-mcp/issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- Mention which step you're on and what's happening

</details>

### 4. Verify Setup

- **Check MCP status**: Should show green/connected in IDE
- **Test**: Say `"use codearchitect"` - should see features list
- **If not working**: Reload IDE and check MCP logs / Reach out to Tair

### 5. Start Using

- `"use codearchitect"` - See features and workflow guide
- `"use codearchitect store_session"` - Save conversation
- `"use codearchitect get_session"` - Retrieve session

## Storage

**Main location**: `~/.codearchitect/sessions/` (always)
- Windows: `C:\Users\YourName\.codearchitect\sessions\`
- Linux/Mac: `~/.codearchitect/sessions/`

**Optional**: Also save to project folder (specify `projectDir`)

**Exports**: `~/.codearchitect/exports/` (for export file detection)

## Workflow

1. **Export chat** → Save to `~/.codearchitect/exports/`
2. **Store session** → `"use codearchitect store_session"`
3. **Retrieve** → `"use codearchitect get_session [topic]"`
4. **Repeat** → Build knowledge base iteratively

## Docs

- [API](./docs/API.md) - Tool reference
- [FAQ](./docs/FAQ.md) - Common questions
- [Onboarding](./docs/ONBOARDING.md) - Setup guide
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Fix issues

## Links

- **Docs**: [codearchitect.mintlify.app](https://codearchitect.mintlify.app/)
- **npm**: [codearchitect-mcp](https://www.npmjs.com/package/codearchitect-mcp)
- **GitHub**: [tairqaldy/codearchitect-mcp](https://github.com/tairqaldy/codearchitect-mcp)

---

**Made with ❤️ by [Tair Kaldybayev](https://tairkaldybayev.link/)**
