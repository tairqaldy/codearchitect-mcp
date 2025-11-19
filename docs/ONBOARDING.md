# Onboarding Guide

Choose your IDE below for step-by-step instructions:

<details>
<summary><b>📘 Cursor Users - Step-by-Step Setup</b></summary>

## Install Node.js (If You Don't Have It)

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the version that says **"LTS"** (Long Term Support)
3. Install it (click through the installer - default settings are fine)
4. Open a terminal/command prompt
5. Type: `node --version`
6. You should see a number like `v18.0.0` or higher
7. If you see an error, Node.js isn't installed correctly - try again

## Install CodeArchitect Package

1. Open terminal/command prompt
2. Type: `npm install -g codearchitect-mcp`
3. Press Enter
4. Wait for it to finish (it will say "added 1 package" when done)
5. If you see errors, make sure Node.js is installed correctly

## Configure Cursor

### Option A: Using Cursor Settings (Easiest)

1. **Open Cursor** (the code editor)
2. Click the **gear icon** ⚙️ in bottom left (or press `Ctrl+,`)
3. In the search box, type: **"MCP"**
4. Click on **"Tools & MCP"** section
5. Find **"MCP Servers"** section
6. Click **"Add Server"** or the **+** button
7. Fill in the form:
   - **Name**: `codearchitect`
   - **Command**: `npx`
   - **Args**: `-y codearchitect-mcp@latest`
8. Click **Save**

### Option B: Manual Config File (If Option A Doesn't Work)

1. **Close Cursor** completely
2. **Windows**: Open File Explorer, go to `C:\Users\YourName\`
   - Create a folder named `.cursor` (with the dot at the start) if it doesn't exist
   - Open that folder
3. **Mac/Linux**: Open Finder/Terminal, go to your home folder (`~`)
   - Create a folder named `.cursor` if it doesn't exist: `mkdir -p ~/.cursor`
   - Open that folder
4. Create a new file named `mcp.json` in the `.cursor` folder
5. Open `mcp.json` in any text editor (Notepad, TextEdit, etc.)
6. Copy and paste this exactly:
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
7. Save the file
8. **Open Cursor** again

## Verify It's Working

1. Look at the bottom of Cursor window
2. You should see **"MCP"** or **"codearchitect"** with a **green dot** (means connected)
3. If you see red/yellow, something went wrong

## Reload Cursor

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: **"Reload Window"**
3. Press Enter
4. Wait for Cursor to restart

## Test It

1. Open any chat in Cursor
2. Type: **"use codearchitect"**
3. You should see features list and workflow guide
4. If you see an error, see troubleshooting below

## How to Export and Save Chats

1. In Cursor chat, look at the top right
2. Click the **three dots** menu (⋯)
3. Click **"Export Chat"**
4. A save window appears
5. Navigate to:
   - **Windows**: `C:\Users\YourName\.codearchitect\exports\`
   - **Mac/Linux**: `~/.codearchitect/exports/`
   - (Create the `exports` folder if it doesn't exist)
6. Click **Save**
7. File will be saved as `.md` format (that's correct!)

## Save Your First Session

1. After exporting chat (see above)
2. In Cursor chat, type: **"use codearchitect store_session"**
3. CodeArchitect will automatically find your exported file and save it
4. You're done! Your conversation is now saved

## Get Saved Sessions Back

1. In Cursor chat, type: **"use codearchitect get_session"**
2. You'll see a list of all saved sessions
3. To get a specific one, type: **"use codearchitect get_session [topic-name]"**

## Need Help?

**Stuck?** Reach out to Tair at any stage:
- **GitHub Issues**: [github.com/tairqaldy/codearchitect-mcp/issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- Mention which step you're on and what's happening
- Include screenshots if possible

</details>

<details>
<summary><b>📘 VS Code Users - Step-by-Step Setup</b></summary>

## Install Node.js (If You Don't Have It)

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the version that says **"LTS"** (Long Term Support)
3. Install it (click through the installer - default settings are fine)
4. Open a terminal in VS Code (`Ctrl+`` or View → Terminal)
5. Type: `node --version`
6. You should see a number like `v18.0.0` or higher
7. If you see an error, Node.js isn't installed correctly - try again

## Install CodeArchitect Package

1. Open terminal in VS Code (`Ctrl+`` or View → Terminal)
2. Type: `npm install -g codearchitect-mcp`
3. Press Enter
4. Wait for it to finish (it will say "added 1 package" when done)
5. If you see errors, make sure Node.js is installed correctly

## Configure VS Code

1. **Open VS Code**
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. A box appears at the top - this is the Command Palette
4. Type: **"MCP: Add Server"**
5. Click **"MCP: Add Server..."** from the list (or press Enter)
6. A menu appears - choose: **"Download with npm package"**
7. Another box appears - type exactly: **`codearchitect-mcp`**
8. Press Enter
9. Wait a few seconds - VS Code will download and install it

## Verify It's Working

1. Look at the bottom right corner of VS Code
2. You should see **"MCP"** or **"codearchitect"** with a **green indicator** (connected)
3. If you see red or an error message, something went wrong

## Reload VS Code

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) again
2. Type: **"Developer: Reload Window"**
3. Press Enter
4. Wait for VS Code to restart completely

## Test It

1. Open any chat/conversation in VS Code
2. Type: **"use codearchitect"**
3. You should see features list and workflow guide
4. If you see an error, see troubleshooting below

## How to Export and Save Chats

1. In VS Code chat, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: **"Export Chat"**
3. Click **"Export Chat"** from the list
4. A save window appears
5. **IMPORTANT**: Name your file something meaningful:
   - Examples: `auth-implementation.json`, `database-design.json`, `api-routes.json`
   - VS Code will add `.json` automatically, so just type the name
6. Navigate to:
   - **Windows**: `C:\Users\YourName\.codearchitect\exports\`
   - **Mac/Linux**: `~/.codearchitect/exports/`
   - (Create the `exports` folder if it doesn't exist)
7. Click **Save**
8. File will be saved as `.json` format (that's correct - CodeArchitect supports this!)

## Save Your First Session

1. After exporting chat (see above)
2. In VS Code chat, type: **"use codearchitect store_session"**
3. CodeArchitect will automatically find your exported JSON file and save it
4. You're done! Your conversation is now saved

## Get Saved Sessions Back

1. In VS Code chat, type: **"use codearchitect get_session"**
2. You'll see a list of all saved sessions
3. To get a specific one, type: **"use codearchitect get_session [topic-name]"**

## Need Help?

**Stuck?** Reach out to Tair at any stage:
- **GitHub Issues**: [github.com/tairqaldy/codearchitect-mcp/issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
- Mention which step you're on and what's happening
- Include screenshots if possible

</details>

## Quick Reference

- **Store session**: `"use codearchitect store_session"`
- **Get sessions**: `"use codearchitect get_session"`
- **Get help**: `"use codearchitect"`

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and fixes.
