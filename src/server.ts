#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type ListToolsResult,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import { SessionStoreManager } from './store-session/index.js';
import { SessionRetrievalManager } from './get-session/index.js';
import { handleError } from './shared/errors.js';

const server = new Server(
  {
    name: 'codearchitect-mcp',
    version: '0.1.4',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const sessionStoreManager = new SessionStoreManager();
const sessionRetrievalManager = new SessionRetrievalManager();

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
              description: 'Current conversation thread text or JSON array of messages. Should only include messages from the current session, not from previous stored sessions. Required.',
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
      {
        name: 'get_session',
        description: 'Retrieve stored AI conversation session(s). Supports TOON format for ~40% token reduction when sending to LLMs.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Optional: Specific session filename to retrieve. If not provided, lists all sessions.',
            },
            date: {
              type: 'string',
              description: 'Optional: Filter sessions by date (YYYY-MM-DD format). Only used when listing sessions.',
            },
            format: {
              type: 'string',
              enum: ['json', 'toon', 'auto'],
              description: 'Output format. "json" for JSON, "toon" for TOON format (~40% token reduction), "auto" to automatically choose best format. Default: "auto"',
              default: 'auto',
            },
            limit: {
              type: 'number',
              description: 'Optional: Limit number of sessions returned when listing. Default: no limit',
            },
            sessionsDir: {
              type: 'string',
              description: 'Optional: Custom directory for storing sessions. If not provided, uses CODEARCHITECT_SESSIONS_DIR env var or defaults to .codearchitect/sessions/ in project root.',
            },
          },
        },
      },
    ],
  };
});

// Register tools/call
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const toolName = request.params.name;
  const args = (request.params.arguments as Record<string, unknown>) || {};

  try {
    if (toolName === 'store_session') {
      const conversation = args.conversation;
      if (!conversation) {
        return handleError(new Error('Conversation parameter is required'));
      }
      
      const result = await sessionStoreManager.storeSession({
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
    }

    if (toolName === 'get_session') {
      const result = args.filename
        ? await sessionRetrievalManager.getSession({
            filename: args.filename as string,
            date: args.date as string | undefined,
            format: (args.format as 'json' | 'toon' | 'auto') || 'auto',
            sessionsDir: args.sessionsDir as string | undefined,
          })
        : await sessionRetrievalManager.listSessions({
            date: args.date as string | undefined,
            format: (args.format as 'json' | 'toon' | 'auto') || 'auto',
            limit: args.limit as number | undefined,
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
    }

    return handleError(new Error(`Unknown tool: ${toolName}`));
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
