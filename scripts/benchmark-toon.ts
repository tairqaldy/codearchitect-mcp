#!/usr/bin/env tsx

/**
 * TOON vs JSON Token Benchmark Script
 * Tests token reduction with CodeArchitect MCP's actual data structures
 */

import { encode } from '@toon-format/toon';
import { encoding_for_model } from 'tiktoken';
import type { Message } from '../src/shared/types.js';
import type { StoreSessionResult } from '../src/store-session/types.js';

// Initialize tokenizer (using cl100k_base which is GPT-4 style)
const tokenizer = encoding_for_model('gpt-4');

interface BenchmarkResult {
  name: string;
  jsonTokens: number;
  toonTokens: number;
  reduction: number;
  reductionPercent: number;
  jsonSize: number;
  toonSize: number;
}

/**
 * Count tokens in a string
 */
function countTokens(text: string): number {
  return tokenizer.encode(text).length;
}

/**
 * Generate sample messages (uniform structure - perfect for TOON)
 */
function generateSampleMessages(count: number): Message[] {
  const roles = ['user', 'assistant', 'system'];
  const samples = [
    'How do I implement authentication in Next.js?',
    'You can use NextAuth.js or implement custom JWT tokens.',
    'What are the best practices for API design?',
    'RESTful APIs should follow REST principles with proper HTTP methods.',
    'How do I optimize database queries?',
    'Use indexes, avoid N+1 queries, and consider query optimization techniques.',
  ];

  return Array.from({ length: count }, (_, i) => ({
    role: roles[i % roles.length],
    content: `${samples[i % samples.length]} (Message ${i + 1})`,
  }));
}

/**
 * Generate sample StoreSessionResult objects
 */
function generateSessionResults(count: number): StoreSessionResult[] {
  return Array.from({ length: count }, (_, i) => ({
    success: true,
    file: `/path/to/session-${i + 1}.md`,
    filename: `session-20250115-${String(i + 1).padStart(6, '0')}.md`,
    topic: `Session Topic ${i + 1}`,
    date: new Date().toISOString(),
    message: `Session saved to session-${i + 1}.md`,
  }));
}

/**
 * Benchmark: Message arrays (uniform structure)
 */
function benchmarkMessages(): BenchmarkResult {
  const sizes = [5, 10, 20, 50, 100];
  const results: BenchmarkResult[] = [];

  console.log('\n📊 Benchmark 1: Message Arrays (Uniform Structure)');
  console.log('=' .repeat(70));

  for (const size of sizes) {
    const messages = generateSampleMessages(size);

    // JSON format
    const json = JSON.stringify(messages, null, 2);
    const jsonTokens = countTokens(json);
    const jsonSize = json.length;

    // TOON format
    const toonData = encode({
      messages: messages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : String(m.content),
      })),
    });
    const toonTokens = countTokens(toonData);
    const toonSize = toonData.length;

    const reduction = jsonTokens - toonTokens;
    const reductionPercent = (reduction / jsonTokens) * 100;

    results.push({
      name: `${size} messages`,
      jsonTokens,
      toonTokens,
      reduction,
      reductionPercent,
      jsonSize,
      toonSize,
    });

    console.log(`\n  ${size} Messages:`);
    console.log(`    JSON:  ${jsonTokens.toLocaleString()} tokens (${(jsonSize / 1024).toFixed(2)} KB)`);
    console.log(`    TOON: ${toonTokens.toLocaleString()} tokens (${(toonSize / 1024).toFixed(2)} KB)`);
    console.log(`    💰 Savings: ${reduction.toLocaleString()} tokens (${reductionPercent.toFixed(1)}%)`);
  }

  return results[results.length - 1]; // Return largest test
}

/**
 * Benchmark: StoreSessionResult arrays
 */
function benchmarkSessionResults(): BenchmarkResult {
  const sizes = [5, 10, 20, 50];
  const results: BenchmarkResult[] = [];

  console.log('\n📊 Benchmark 2: StoreSessionResult Arrays');
  console.log('=' .repeat(70));

  for (const size of sizes) {
    const sessionResults = generateSessionResults(size);

    // JSON format
    const json = JSON.stringify(sessionResults, null, 2);
    const jsonTokens = countTokens(json);
    const jsonSize = json.length;

    // TOON format
    const toonData = encode({
      sessions: sessionResults.map((s) => ({
        success: s.success,
        filename: s.filename || '',
        topic: s.topic || '',
        date: s.date || '',
        message: s.message || '',
      })),
    });
    const toonTokens = countTokens(toonData);
    const toonSize = toonData.length;

    const reduction = jsonTokens - toonTokens;
    const reductionPercent = (reduction / jsonTokens) * 100;

    results.push({
      name: `${size} session results`,
      jsonTokens,
      toonTokens,
      reduction,
      reductionPercent,
      jsonSize,
      toonSize,
    });

    console.log(`\n  ${size} Session Results:`);
    console.log(`    JSON:  ${jsonTokens.toLocaleString()} tokens (${(jsonSize / 1024).toFixed(2)} KB)`);
    console.log(`    TOON: ${toonTokens.toLocaleString()} tokens (${(toonSize / 1024).toFixed(2)} KB)`);
    console.log(`    💰 Savings: ${reduction.toLocaleString()} tokens (${reductionPercent.toFixed(1)}%)`);
  }

  return results[results.length - 1];
}

/**
 * Benchmark: Mixed conversation data (non-uniform)
 */
function benchmarkMixedData(): BenchmarkResult {
  console.log('\n📊 Benchmark 3: Mixed Conversation Data (Non-Uniform)');
  console.log('=' .repeat(70));

  // Simulate a real conversation with varying structures
  const mixedData = {
    session: {
      id: 'session-123',
      topic: 'Implementing authentication',
      messages: generateSampleMessages(10),
      metadata: {
        createdAt: new Date().toISOString(),
        project: 'my-project',
        tags: ['auth', 'nextjs', 'security'],
      },
    },
  };

  // JSON format
  const json = JSON.stringify(mixedData, null, 2);
  const jsonTokens = countTokens(json);
  const jsonSize = json.length;

  // TOON format (only uniform parts)
  const toonData = encode({
    session: {
      id: mixedData.session.id,
      topic: mixedData.session.topic,
      messages: mixedData.session.messages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : String(m.content),
      })),
      createdAt: mixedData.session.metadata.createdAt,
      project: mixedData.session.metadata.project,
      tags: mixedData.session.metadata.tags.join(','),
    },
  });
  const toonTokens = countTokens(toonData);
  const toonSize = toonData.length;

  const reduction = jsonTokens - toonTokens;
  const reductionPercent = (reduction / jsonTokens) * 100;

  console.log(`\n  Mixed Data:`);
  console.log(`    JSON:  ${jsonTokens.toLocaleString()} tokens (${(jsonSize / 1024).toFixed(2)} KB)`);
  console.log(`    TOON: ${toonTokens.toLocaleString()} tokens (${(toonSize / 1024).toFixed(2)} KB)`);
  console.log(`    💰 Savings: ${reduction.toLocaleString()} tokens (${reductionPercent.toFixed(1)}%)`);

  return {
    name: 'mixed conversation data',
    jsonTokens,
    toonTokens,
    reduction,
    reductionPercent,
    jsonSize,
    toonSize,
  };
}

/**
 * Benchmark: Real-world scenario - storing multiple sessions
 */
function benchmarkRealWorldScenario(): BenchmarkResult {
  console.log('\n📊 Benchmark 4: Real-World Scenario (Multiple Sessions)');
  console.log('=' .repeat(70));

  // Simulate storing 20 sessions, each with 15 messages
  const sessions = Array.from({ length: 20 }, (_, i) => ({
    sessionId: `session-${i + 1}`,
    topic: `Development Session ${i + 1}`,
    messages: generateSampleMessages(15),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Different dates
  }));

  // JSON format
  const json = JSON.stringify(sessions, null, 2);
  const jsonTokens = countTokens(json);
  const jsonSize = json.length;

  // TOON format - nested structure
  const toonData = encode({
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      topic: s.topic,
      createdAt: s.createdAt,
      messageCount: s.messages.length,
      // Flatten messages for TOON
      messages: s.messages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content.substring(0, 100) : String(m.content).substring(0, 100),
      })),
    })),
  });
  const toonTokens = countTokens(toonData);
  const toonSize = toonData.length;

  const reduction = jsonTokens - toonTokens;
  const reductionPercent = (reduction / jsonTokens) * 100;

  console.log(`\n  20 Sessions × 15 Messages Each:`);
  console.log(`    JSON:  ${jsonTokens.toLocaleString()} tokens (${(jsonSize / 1024).toFixed(2)} KB)`);
  console.log(`    TOON: ${toonTokens.toLocaleString()} tokens (${(toonSize / 1024).toFixed(2)} KB)`);
  console.log(`    💰 Savings: ${reduction.toLocaleString()} tokens (${reductionPercent.toFixed(1)}%)`);

  // Calculate cost savings
  const costPerMillionTokens = 5.0; // GPT-4 input pricing
  const monthlyQueries = 1000;
  const jsonCost = (jsonTokens / 1_000_000) * costPerMillionTokens * monthlyQueries;
  const toonCost = (toonTokens / 1_000_000) * costPerMillionTokens * monthlyQueries;
  const monthlySavings = jsonCost - toonCost;

  console.log(`\n  💵 Cost Impact (${monthlyQueries.toLocaleString()} queries/month):`);
  console.log(`    JSON Cost:  $${jsonCost.toFixed(2)}/month`);
  console.log(`    TOON Cost:  $${toonCost.toFixed(2)}/month`);
  console.log(`    💰 Monthly Savings: $${monthlySavings.toFixed(2)} (${reductionPercent.toFixed(1)}%)`);

  return {
    name: 'real-world scenario',
    jsonTokens,
    toonTokens,
    reduction,
    reductionPercent,
    jsonSize,
    toonSize,
  };
}

/**
 * Main benchmark runner
 */
async function main() {
  console.log('\n🚀 TOON vs JSON Token Benchmark');
  console.log('Testing CodeArchitect MCP Data Structures');
  console.log('=' .repeat(70));
  console.log(`Tokenizer: cl100k_base (GPT-4 style)`);
  console.log(`Model: gpt-4`);

  const results: BenchmarkResult[] = [];

  try {
    // Run all benchmarks
    results.push(benchmarkMessages());
    results.push(benchmarkSessionResults());
    results.push(benchmarkMixedData());
    results.push(benchmarkRealWorldScenario());

    // Summary
    console.log('\n\n📈 Summary');
    console.log('=' .repeat(70));

    const avgReduction = results.reduce((sum, r) => sum + r.reductionPercent, 0) / results.length;
    const totalJsonTokens = results.reduce((sum, r) => sum + r.jsonTokens, 0);
    const totalToonTokens = results.reduce((sum, r) => sum + r.toonTokens, 0);
    const totalReduction = totalJsonTokens - totalToonTokens;
    const totalReductionPercent = (totalReduction / totalJsonTokens) * 100;

    console.log(`\n  Average Token Reduction: ${avgReduction.toFixed(1)}%`);
    console.log(`  Total Tokens Saved: ${totalReduction.toLocaleString()} tokens`);
    console.log(`  Overall Reduction: ${totalReductionPercent.toFixed(1)}%`);

    console.log('\n  Individual Results:');
    results.forEach((r) => {
      console.log(`    ${r.name.padEnd(30)}: ${r.reductionPercent.toFixed(1)}% reduction`);
    });

    console.log('\n✅ Benchmark completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    tokenizer.free();
  }
}

// Run benchmark
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

