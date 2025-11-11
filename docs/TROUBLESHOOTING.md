# Troubleshooting Guide

## Common Issues and Solutions

### Issue: Sessions saved in wrong location (user folder instead of project)

**Symptoms:**
- Sessions appear in `C:\Users\YourName\.codearchitect\` instead of your project folder
- Sessions not organized by project

**Solutions:**

1. **Use workspace-specific configuration** (Recommended):
   - Create `.cursor/mcp.json` (Cursor) or `.vscode/settings.json` (VS Code) in your project root
   - Add `"cwd": "${workspaceFolder}"` to the MCP server configuration
   - Optionally set `CODEARCHITECT_SESSIONS_DIR` in the `env` section to control where sessions are saved
   - Restart your IDE or reload the MCP server

2. **Check your MCP configuration**:
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

3. **Use custom sessions directory**:
   - Set `CODEARCHITECT_SESSIONS_DIR` environment variable in your MCP config to specify a custom location
   - Or pass `sessionsDir` parameter when calling `store_session` tool

4. **Verify project root detection**:
   - Ensure your project has a `package.json`, `.git`, or `.codearchitect` folder
   - The server uses these markers to identify the project root

5. **For multiple workspaces**:
   - Configure `cwd` in each project's workspace settings
   - Each project can have its own `.codearchitect/sessions/` folder or use a shared global folder

### Issue: Session files not being created

**Symptoms:**
- Tool executes successfully but no file appears
- No error message shown

**Solutions:**
1. **Check permissions**: Ensure you have write permissions in your project directory
2. **Verify project root detection**: Check if `.codearchitect` folder exists in your project root
3. **Check MCP server logs**: Look for error messages in the server output
4. **Manual test**: Try creating the directory manually
   ```bash
   mkdir -p .codearchitect/sessions/$(date +%Y-%m-%d)
   ```

### Issue: Topic extraction not working

**Solutions:**
1. **Provide explicit topic**: Always specify the `topic` parameter for best results
2. **Format your conversation**: Start with a clear user message
3. **Understand limitations**: Topics are limited to 50 characters and special characters are removed

### Issue: Files saved in wrong location

**Solutions:**
1. **Check current directory**: Ensure you're in your project root
2. **Verify project markers**: Ensure your project has a marker file (package.json, .git, etc.)
3. **Check for nested projects**: If you have nested projects, the server detects the first marker it finds
4. **Use workspace-specific config**: Set `cwd` in your workspace settings for reliable behavior

### Issue: Permission errors

**Solutions:**

**Linux/Mac:**
```bash
chmod -R u+w .codearchitect/
```

**Windows:**
- Right-click on your project folder → Properties → Security tab
- Ensure your user has "Write" permissions

### Issue: Filename collisions

**Explanation:**
This is expected behavior. If you save multiple sessions with the same topic within the same second, files are automatically numbered.

**Solution:**
This is normal behavior. If you want unique names, provide different topics or wait a second between saves.

### Issue: Conversation too large

**Solutions:**
1. **Split large conversations**: Break into multiple sessions
2. **Reduce content**: Only store essential parts of the conversation
3. **Check size**: Maximum is 10MB for validation, but files are truncated to 1MB

### Issue: MCP server not starting

**Solutions:**
1. **Verify installation**: Check if `codearchitect-mcp` is in PATH
2. **Check Node.js version**: Requires Node.js 18+
3. **Rebuild**: Rebuild the project with `npm run build`
4. **Check MCP configuration**: Verify your IDE's MCP settings are correct

### Issue: Workspace detection not working

**Symptoms:**
- Sessions always saved in user folder
- `cwd` setting not taking effect

**Solutions:**
1. **Restart IDE**: After changing MCP configuration, restart Cursor/VS Code
2. **Check configuration syntax**: Ensure JSON is valid
3. **Use absolute path**: Instead of `${workspaceFolder}`, try absolute path:
   ```json
   "cwd": "C:\\Users\\YourName\\Projects\\your-project"
   ```
4. **Verify environment variables**: Check if workspace-related env vars are set:
   ```bash
   echo $VSCODE_CWD
   echo $CURSOR_CWD
   ```

## Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: Search for similar issues
2. **Create an Issue**: Provide error messages, steps to reproduce, and your environment details
3. **Include Debug Info**: MCP server logs, file system permissions, project structure

