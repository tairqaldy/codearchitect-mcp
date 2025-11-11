# Troubleshooting Guide

## Common Issues and Solutions

### Issue: Session files not being created

**Symptoms:**
- Tool executes successfully but no file appears
- No error message shown

**Solutions:**
1. **Check permissions**: Ensure you have write permissions in your project directory
2. **Verify project root detection**: Check if `.codearchitect` folder exists in your project root
3. **Check MCP server logs**: Look for error messages in the server output
4. **Manual test**: Try creating the directory manually

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

## Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: Search for similar issues
2. **Create an Issue**: Provide error messages, steps to reproduce, and your environment details
3. **Include Debug Info**: MCP server logs, file system permissions, project structure

