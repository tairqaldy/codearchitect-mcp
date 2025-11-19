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
    version: '0.1.7',
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
    description: 'Save conversation to knowledge base',
    usage: 'use codearchitect store_session',
    examples: [
      'use codearchitect store_session',
      'use codearchitect store_session topic: "auth implementation"',
      'use codearchitect store_session projectDir: "/path/to/project"',
    ],
    when_to_use: [
      'After important discussions',
      'When solving complex problems',
      'When documenting architecture decisions',
    ],
    details: 'Saves to ~/.codearchitect/sessions/ (always). Optionally also to project folder. Auto-detects export files from ~/.codearchitect/exports/. Next: Use get_session to retrieve.',
  },
  get_session: {
    name: 'get_session',
    description: 'Retrieve saved sessions from knowledge base',
    usage: 'use codearchitect get_session [filename] [date]',
    examples: [
      'use codearchitect get_session',
      'use codearchitect get_session authentication-implementation',
      'use codearchitect get_session 2025-11-19',
    ],
    when_to_use: [
      'Before re-explaining something',
      'When continuing previous work',
      'When you need past context',
    ],
    details: 'Retrieves from ~/.codearchitect/sessions/. Lists all if no params. Filter by filename or date. Next: Use store_session to save new conversations.',
  },
};

// Iterative workflow guide for building knowledge base
const WORKFLOW_GUIDE = {
  title: 'Iterative Knowledge Base Workflow',
  description: 'Follow this cycle to continuously build your second brain',
  steps: [
    {
      step: 1,
      action: 'Have Conversation',
      details: 'Discuss architecture, code solutions, design patterns, or any important topic with AI',
    },
    {
      step: 2,
      action: 'Export Chat',
      details: 'In Cursor/VS Code: Three dots (⋯) → Export Chat → Save to ~/.codearchitect/exports/',
      path: {
        windows: 'C:\\Users\\YourName\\.codearchitect\\exports\\',
        unix: '~/.codearchitect/exports/',
      },
    },
    {
      step: 3,
      action: 'Store Session',
      details: 'Say "use codearchitect store_session" → Auto-detects export file → Saves to ~/.codearchitect/sessions/',
      optional: 'Add topic or projectDir if needed',
    },
    {
      step: 4,
      action: 'Continue Work',
      details: 'Next conversation builds on previous knowledge. Reference past sessions when needed.',
    },
    {
      step: 5,
      action: 'Retrieve When Needed',
      details: 'Say "use codearchitect get_session [topic]" → Get past context → Continue without re-explaining',
    },
    {
      step: 6,
      action: 'Repeat',
      details: 'Continuously save important discussions → Build comprehensive knowledge base over time',
    },
  ],
  storage: {
    main: '~/.codearchitect/sessions/ (always)',
    exports: '~/.codearchitect/exports/ (for auto-detection)',
    optional: 'project/.codearchitect/sessions/ (if projectDir specified)',
  },
  tips: [
    'Store after important discussions - architecture decisions, complex solutions, design patterns',
    'Use descriptive topics - makes retrieval easier',
    'Save regularly - build knowledge base iteratively',
    'Retrieve before re-explaining - check if you already discussed it',
  ],
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
        description: `[CodeArchitect] Save important conversations for future reference.

=== WHEN TO USE ===
- User says: "use codearchitect store_session", "save this conversation", "store this", "remember this"
- User wants to keep/remember an important discussion
- After solving complex problems or making architecture decisions

=== STORAGE BEHAVIOR ===
1. ALWAYS saves to main folder: ~/.codearchitect/sessions/ (user's home directory)
2. OPTIONALLY saves to project folder if user specifies projectDir parameter
3. NEVER auto-detects project - only use projectDir if user explicitly provides it

=== CONVERSATION SOURCE (CHOOSE ONE) ===

OPTION 1: Export File (RECOMMENDED - Most Reliable)
- User exports conversation from Cursor/VS Code to .codearchitect/exports/ folder
- Tool automatically detects and processes the export file
- No need to manually extract conversation

WORKFLOW:
1. User exports chat: In Cursor/VS Code → three dots (⋯) → "Export Chat"
2. User saves to: ~/.codearchitect/exports/ folder (main location - always the same)
3. User says: "use codearchitect store_session"
4. Tool automatically finds newest export file and stores it

If multiple exports exist:
- Tool processes newest file (modified in last 10 minutes)
- If user wants specific file: use exportFilename parameter (e.g., "resolve_mcp")

OPTION 2: Direct Conversation Parameter (Fallback)
- Only use if export file method doesn't work
- Extract FULL conversation from your context window
- Format as plain text with USER/ASSISTANT markers OR JSON array

=== PARAMETERS ===
- conversation (optional): Direct conversation text/JSON - only use if export file unavailable
- exportFilename (optional): Pattern to match specific export file (e.g., "resolve_mcp" matches "cursor_resolve_mcp_configuration_issues.md")
- topic (optional): Session topic - auto-extracted if not provided
- projectDir (optional): Project directory path - if provided, saves to both main and project folders
- format (optional): "plain" or "messages" - default "plain"

=== WORKFLOW (EXPORT METHOD) ===
Step 1: User exports conversation to ~/.codearchitect/exports/ folder (main location)
Step 2: User says "use codearchitect store_session"
Step 3: Tool detects export file automatically from main exports folder
Step 4: Tool parses and stores conversation
Step 5: Tool saves to main sessions folder (always) + optionally project folder if projectDir specified

=== ERROR HANDLING ===
If no export file found:
- Return clear instructions with OS/IDE-specific export folder path
- Tell user exactly where to save the export file
- Provide step-by-step instructions

=== RESPONSE ===
After saving, return concise message:
- "Detected export file '[filename]', saved to main: [topic-name]. Next: use codearchitect get_session [topic-name]"
- Or if projectDir provided: "Detected export file '[filename]', saved to main: [topic-name] and project: [topic-name]. Next: use codearchitect get_session [topic-name]"`,
        inputSchema: {
          type: 'object',
          properties: {
            conversation: {
              type: 'string',
              description: 'OPTIONAL: Direct conversation text/JSON. Only use if export file method unavailable. If not provided, tool will automatically look for export file in .codearchitect/exports/ folder. Format as plain text with USER/ASSISTANT markers OR as JSON array [{"role": "user/assistant", "content": "..."}].',
            },
            exportFilename: {
              type: 'string',
              description: 'OPTIONAL: Pattern to match specific export file (case-insensitive). Example: "resolve_mcp" matches "cursor_resolve_mcp_configuration_issues.md". If not provided, tool uses newest export file (modified in last 10 minutes).',
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
            projectDir: {
              type: 'string',
              description: 'Optional: Project directory path. If specified, saves to BOTH main folder (~/.codearchitect/sessions/) AND project/.codearchitect/sessions/. Always saves to main folder first, then also to project folder.',
            },
           },
           required: [], // No required parameters - conversation is optional, export file detection is automatic
         },
      },
      {
        name: 'get_session',
        description: `[CodeArchitect] Retrieve previous conversations to avoid re-explaining.

=== WHEN TO USE ===
- User says: "use codearchitect get_session", "get that previous conversation", "retrieve session"
- User mentions something they discussed before
- User wants to continue work on a previous topic

=== STORAGE BEHAVIOR ===
- Always retrieves from main folder: ~/.codearchitect/sessions/ (user's home directory)
- No project detection - all sessions are in main folder

=== USAGE ===
- No parameters: Lists all sessions
- filename: Get specific session by topic folder name
- date: List sessions from specific date (YYYY-MM-DD format)
- limit: Limit number of results when listing`,
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Optional: Specific session filename (topic folder name) to retrieve. If not provided, lists all sessions.',
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
      
      // Return all features + workflow guide
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'CodeArchitect MCP - Available features:',
              usage_pattern: 'Say "use codearchitect [feature_name]" or just "use codearchitect" to see options',
              workflow: WORKFLOW_GUIDE,
              features: Object.values(FEATURES).map(f => ({
                name: f.name,
                description: f.description,
                usage: f.usage,
                examples: f.examples.slice(0, 2), // Show first 2 examples
                when_to_use: f.when_to_use,
                details: f.details,
              })),
            }, null, 2),
          },
        ],
      };
    }

    if (toolName === 'store_session') {
      try {
        const result = await sessionStoreManager.storeSession({
          conversation: args.conversation as string | Array<{ role: string; content: unknown }> | undefined,
          exportFilename: args.exportFilename as string | undefined,
          topic: args.topic as string | undefined,
          format: (args.format as 'plain' | 'messages') || 'plain',
          projectDir: args.projectDir as string | undefined,
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
        // Handle SessionError with detailed instructions
        if (error instanceof Error && error.name === 'SessionError') {
          const sessionError = error as any;
          const errorCode = sessionError.code || 'UNKNOWN_ERROR';
          const errorMessage = sessionError.message || 'An error occurred';
          const errorDetails = sessionError.details || '';
          
          // Check if it's a NO_CONVERSATION_OR_EXPORT error - provide export instructions
          if (errorCode === 'NO_CONVERSATION_OR_EXPORT' || errorMessage.includes('no recent export file')) {
            const { getExportFolderInstructions } = await import('./shared/filesystem.js');
            const instructions = getExportFolderInstructions();
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: 'NO_CONVERSATION_OR_EXPORT',
                    message: 'No conversation provided and no recent export file found.',
                    instructions: {
                      step1: instructions.instructions[0],
                      step2: instructions.instructions[1],
                      step3: instructions.instructions[2],
                      folderPath: instructions.folderPath,
                      fullPath: instructions.fullPath,
                      note: 'The folder will be created automatically if it doesn\'t exist.',
                    },
                    details: errorDetails,
                  }, null, 2),
                },
              ],
            };
          }
        }
        
        // Re-throw to be handled by outer catch
        throw error;
      }
    }

    if (toolName === 'get_session') {
      const result = args.filename
        ? await sessionRetrievalManager.getSession({
            filename: args.filename as string,
            date: args.date as string | undefined,
            format: (args.format as 'json' | 'toon' | 'auto') || 'auto',
          })
        : await sessionRetrievalManager.listSessions({
            date: args.date as string | undefined,
            format: (args.format as 'json' | 'toon' | 'auto') || 'auto',
            limit: args.limit as number | undefined,
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
