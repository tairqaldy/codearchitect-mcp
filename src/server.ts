#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type ListToolsResult,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { SessionManager } from './session/SessionManager.js';
import { handleError } from './session/errors.js';

const server = new Server(
  {
    name: 'codearchitect-mcp',
    version: '0.1.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const sessionManager = new SessionManager();

// Register tools/list
server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
  return {
    tools: [
      {
        name: 'store_session',
        description: 'Store AI conversation session as a markdown file in .codearchitect/sessions/',
        inputSchema: {
          type: 'object',
          properties: {
            conversation: {
              type: 'string',
              description: 'Full conversation text or JSON array of messages. Required.',
            },
            topic: {
              type: 'string',
              description: 'Optional: Session topic/title. If not provided, will be auto-extracted from conversation.',
            },
            format: {
              type: 'string',
              enum: ['plain', 'messages'],
              description: 'Format of conversation input. "plain" for text, "messages" for JSON array. Default: "plain"',
              default: 'plain',
            },
            sessionsDir: {
              type: 'string',
              description: 'Optional: Custom directory for storing sessions. If not provided, uses CODEARCHITECT_SESSIONS_DIR env var or defaults to .codearchitect/sessions/ in project root.',
            },
          },
          required: ['conversation'],
        },
      },
    ],
  };
});

// Register tools/call
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  if (request.params.name !== 'store_session') {
    return handleError(new Error('Unknown tool'));
  }

  try {
    const args = (request.params.arguments as Record<string, unknown>) || {};
    const conversation = args.conversation;
    if (!conversation) {
      return handleError(new Error('Conversation parameter is required'));
    }
    
    const result = await sessionManager.storeSession({
      conversation: conversation as string | Array<{ role: string; content: unknown }>,
      topic: args.topic as string | undefined,
      format: (args.format as 'plain' | 'messages') || 'plain',
      sessionsDir: args.sessionsDir as string | undefined,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  } catch (error) {
    return handleError(error);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[CodeArchitect MCP] Server ready!');
}

main().catch((error) => {
  console.error('[CodeArchitect MCP] Fatal error:', error);
  process.exit(1);
});
