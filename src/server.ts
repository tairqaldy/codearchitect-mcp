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
    version: '0.1.5',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const sessionStoreManager = new SessionStoreManager();
const sessionRetrievalManager = new SessionRetrievalManager();

// Feature information for help tool
const FEATURES = {
  store_session: {
    name: 'store_session',
    description: 'Save important conversations for future reference',
    usage: 'use codearchitect store_session [topic]',
    examples: [
      'use codearchitect store_session',
      'use codearchitect store_session "authentication implementation"',
      'use codearchitect store_session in custom/path',
    ],
    when_to_use: [
      'After important discussions',
      'When solving complex problems',
      'When documenting decisions',
    ],
    details: 'Saves the conversation as a markdown file organized by date. Mention a topic or location/path if needed. Next: Use get_session to retrieve saved conversations.',
  },
  get_session: {
    name: 'get_session',
    description: 'Retrieve previous conversations to avoid re-explaining',
    usage: 'use codearchitect get_session [filename] [date]',
    examples: [
      'use codearchitect get_session',
      'use codearchitect get_session session-20250115-143022-auth.md',
      'use codearchitect get_session 2025-01-15',
    ],
    when_to_use: [
      'When you need context from a previous conversation',
      'Before explaining something you already discussed',
      'When continuing work on a previous topic',
    ],
    details: 'Retrieves stored sessions by filename or date. Lists all sessions if no parameters provided. Next: Use store_session to save new conversations.',
  },
};

// Register tools/list
server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
  return {
    tools: [
      {
        name: 'codearchitect_help',
        description: `Get help about CodeArchitect MCP features. Use when user says "use codearchitect" without specifying a feature, or asks "what can codearchitect do?". Returns available features with examples and next steps.`,
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Optional: Specific feature name to get help for (store_session, get_session). If not provided, returns help for all features.',
            },
          },
        },
      },
      {
        name: 'store_session',
        description: `[CodeArchitect] Save important conversations for future reference. Use when user says "use codearchitect store_session", "save this conversation", or wants to keep/remember something. Can include topic or location/path. Saves to .codearchitect/sessions/ organized by date.

IMPORTANT: When calling this tool, the conversation parameter MUST contain the FULL, COMPLETE content of all messages - not summaries or placeholders. Include all actual code, explanations, responses, and details. Do NOT use placeholders like "[I did X]" or "[I explained Y]". Pass the actual full conversation content.`,
        inputSchema: {
          type: 'object',
          properties: {
            conversation: {
              type: 'string',
              description: 'FULL conversation thread text or JSON array of messages with COMPLETE content. Must include all actual messages, code, explanations - NOT summaries or placeholders. Should only include messages from the current session, not from previous stored sessions. Required.',
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
        description: `[CodeArchitect] Retrieve previous conversations to avoid re-explaining. Use when user says "use codearchitect get_session", "get that previous conversation", or mentions something they discussed before. Can specify filename or date to filter. Lists all sessions if no parameters provided.`,
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
    // Help tool
    if (toolName === 'codearchitect_help') {
      const featureName = args.feature as string | undefined;
      
      if (featureName && FEATURES[featureName as keyof typeof FEATURES]) {
        const feature = FEATURES[featureName as keyof typeof FEATURES];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                feature: {
                  name: feature.name,
                  description: feature.description,
                  usage: feature.usage,
                  examples: feature.examples,
                  when_to_use: feature.when_to_use,
                  details: feature.details,
                },
              }, null, 2),
            },
          ],
        };
      }
      
      // Return all features
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'CodeArchitect MCP - Available Features',
              usage_pattern: 'Say "use codearchitect [feature_name]" or just "use codearchitect" to see options',
              features: Object.values(FEATURES).map(f => ({
                name: f.name,
                description: f.description,
                usage: f.usage,
                examples: f.examples.slice(0, 2), // Show first 2 examples
                next_step: f.details.split('Next: ')[1] || undefined,
              })),
            }, null, 2),
          },
        ],
      };
    }

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
