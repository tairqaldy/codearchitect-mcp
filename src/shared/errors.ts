/**
 * Shared error handling utilities
 */

export class SessionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

export function handleError(error: unknown): { content: Array<{ type: 'text'; text: string }> } {
  if (error instanceof SessionError) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.code,
            message: error.message,
            details: error.details,
          }),
        },
      ],
    };
  }

  // Log unexpected errors
  console.error('[CodeArchitect MCP] Unexpected error:', error);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : String(error),
        }),
      },
    ],
  };
}

