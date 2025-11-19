# Troubleshooting

## MCP Server Not Working

**VS Code**:
- Restart VS Code
- Check MCP logs: View → Output → MCP

**Cursor**:
- Check global `~/.cursor/mcp.json` exists (Windows: `C:\Users\YourName\.cursor\mcp.json`)
- Verify MCP enabled: Settings → Features → Model Context Protocol
- Verify JSON syntax
- Reload Cursor: `Ctrl+Shift+P` → `Developer: Reload Window`

## Sessions Save in Wrong Location

Sessions always save to `~/.codearchitect/sessions/` (main location). This is intentional.

To also save to project folder, specify `projectDir` when storing.

## Command Not Found

Use `npx` in global `~/.cursor/mcp.json` (Windows: `C:\Users\YourName\.cursor\mcp.json`):
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

**Important**: Use global config (not project-specific) for reliability.

## Export File Not Found

1. Export chat → Save to `~/.codearchitect/exports/`
2. Use `exportFilename` parameter if file is older than 10 minutes
3. Check path: Windows `C:\Users\YourName\.codearchitect\exports\`

## Sessions Not Saving

- Check MCP server status (green)
- Verify write permissions in `~/.codearchitect/sessions/`
- Check error messages
- Restart IDE after config changes

## Need More Help?

- [FAQ](./FAQ.md)
- [GitHub Issues](https://github.com/tairqaldy/codearchitect-mcp/issues)
