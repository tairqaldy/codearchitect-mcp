#!/usr/bin/env tsx

/**
 * Test script to store a session in the code-architect-mcp folder
 */

import { SessionStoreManager } from '../src/store-session/index.js';
import type { Message } from '../src/shared/types.js';

async function main() {
  const sessionStoreManager = new SessionStoreManager();

  // Example conversation - you can modify this
  const conversation: Message[] = [
    {
      role: 'user',
      content: 'Hello! I want to test storing a session in the code-architect-mcp folder.',
    },
    {
      role: 'assistant',
      content: 'Great! I can help you store this conversation as a session. The session will be saved as a markdown file in the .codearchitect/sessions/ directory.',
    },
    {
      role: 'user',
      content: 'Perfect! Let\'s store it now.',
    },
  ];

  console.log('📝 Storing session...\n');

  const result = await sessionStoreManager.storeSession({
    conversation: conversation,
    topic: 'test-session',
    format: 'messages',
    // Optional: specify custom directory
    // sessionsDir: './.codearchitect/sessions'
  });

  if (result.success) {
    console.log('✅ Session stored successfully!');
    console.log(`📄 File: ${result.file}`);
    console.log(`📋 Filename: ${result.filename}`);
    console.log(`🏷️  Topic: ${result.topic}`);
    console.log(`📅 Date: ${result.date}`);
    if (result.warning) {
      console.log(`⚠️  Warning: ${result.warning}`);
    }
  } else {
    console.error('❌ Failed to store session:');
    console.error(`   Error: ${result.error}`);
    if (result.details) {
      console.error(`   Details: ${result.details}`);
    }
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

