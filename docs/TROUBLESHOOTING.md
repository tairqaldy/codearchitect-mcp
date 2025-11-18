# Troubleshooting

## MCP Server Not Working

**VS Code**:
- Check `.vscode/settings.json` has `cwd: "${workspaceFolder}"`
- Restart VS Code
- Check MCP logs: View → Output → MCP

**Cursor**:
- Check `.cursor/mcp.json` exists
- Verify JSON syntax
- Restart Cursor

## Sessions Save in Wrong Location

Sessions always save to main `.codearchitect/` folder in your home directory (`~/.codearchitect/sessions/`). This is intentional - it's your reliable "second brain" location.

If you want to also save to a project folder, specify `projectDir` when storing a session. The AI will ask if you want to save to a project folder.

## Command Not Found

Use `npx` (always works, no PATH issues):
```json
{
  "mcpServers": {
    "codearchitect": {
      "command": "npx",
      "args": ["-y", "codearchitect-mcp"]
    }
  }
}
```

## Sessions Not Saving

- Check MCP server is running (green status)
- Verify write permissions in home directory (`~/.codearchitect/sessions/`)
- Check error messages in AI response
- Restart IDE after configuration changes

## Need More Help?

- [FAQ](./FAQ.md)
- [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
