# TOON Format Benchmark Results

This benchmark tests token reduction when using TOON format vs JSON for CodeArchitect MCP's data structures.

## Quick Start

Run the benchmark:
```bash
npm run benchmark:toon
```

## Results Summary

### Overall Performance
- **Average Token Reduction**: 41.2%
- **Best Case (Uniform Arrays)**: 40-48% reduction
- **Real-World Scenario**: 37% reduction
- **Cost Savings**: ~$19/month per 1,000 queries (at GPT-4 pricing)

### Detailed Results

#### 1. Message Arrays (Uniform Structure)
Perfect use case for TOON - uniform arrays of objects with identical keys.

| Messages | JSON Tokens | TOON Tokens | Savings | Reduction |
|----------|-------------|-------------|---------|-----------|
| 5        | 156         | 97          | 59      | 37.8%     |
| 10       | 318         | 194         | 124     | 39.0%     |
| 20       | 635         | 381         | 254     | 40.0%     |
| 50       | 1,585       | 941         | 644     | 40.6%     |
| 100      | 3,168       | 1,874       | 1,294   | 40.8%     |

**Key Insight**: Consistent ~40% reduction regardless of array size.

#### 2. StoreSessionResult Arrays
Uniform session metadata - excellent TOON candidate.

| Sessions | JSON Tokens | TOON Tokens | Savings | Reduction |
|----------|-------------|-------------|---------|-----------|
| 5        | 407         | 221         | 186     | 45.7%     |
| 10       | 812         | 431         | 381     | 46.9%     |
| 20       | 1,622       | 851         | 771     | 47.5%     |
| 50       | 4,052       | 2,111       | 1,941   | 47.9%     |

**Key Insight**: Nearly 48% reduction - best performance for uniform metadata.

#### 3. Mixed Conversation Data
Non-uniform structure with nested objects and varying fields.

- **JSON**: 406 tokens
- **TOON**: 247 tokens
- **Savings**: 159 tokens (39.2% reduction)

**Key Insight**: Even with mixed data, TOON still achieves ~39% reduction.

#### 4. Real-World Scenario
20 sessions × 15 messages each (300 total messages).

- **JSON**: 10,482 tokens
- **TOON**: 6,604 tokens
- **Savings**: 3,878 tokens (37.0% reduction)

**Cost Impact** (1,000 queries/month at GPT-4 pricing):
- JSON Cost: $52.41/month
- TOON Cost: $33.02/month
- **Monthly Savings: $19.39 (37.0%)**

## When to Use TOON

### ✅ Best Cases (40-48% reduction)
- **Uniform arrays of objects** (Message arrays, SessionResult arrays)
- **Large datasets** (50+ items)
- **Repeated keys** (tabular data)
- **LLM prompt optimization** (sending context to AI models)

### ⚠️ Moderate Cases (30-40% reduction)
- **Mixed data structures** (still beneficial)
- **Nested objects** (some overhead)
- **Medium datasets** (10-50 items)

### ❌ Not Recommended (< 20% reduction)
- **Small datasets** (< 5 items) - overhead not worth it
- **Highly nested structures** - TOON works better with flat data
- **Database storage** - keep JSON for flexibility

## Implementation Recommendations

### For CodeArchitect MCP

1. **Use TOON for LLM prompts** when sending:
   - Message arrays (conversation history)
   - Session metadata batches
   - Uniform context data

2. **Keep JSON for**:
   - Database storage (PostgreSQL JSON fields)
   - MCP protocol responses
   - API endpoints
   - Small datasets (< 5 items)

3. **Hybrid Approach**:
   ```typescript
   // Store as JSON in database
   await prisma.session.create({ data: { messages: jsonData } });
   
   // Convert to TOON when sending to LLM
   const toonData = encode({ messages: jsonData });
   // Send to LLM with ~40% token savings
   ```

## Technical Details

- **Tokenizer**: `cl100k_base` (GPT-4 style)
- **Model**: GPT-4
- **Pricing**: $5 per million input tokens
- **Test Data**: Realistic CodeArchitect MCP data structures

## Files

- `benchmark-toon.ts` - Benchmark script
- `BENCHMARK_README.md` - This documentation

## Running Custom Benchmarks

Modify `benchmark-toon.ts` to test your specific data structures:

```typescript
// Add your data structure
const myData = { /* your data */ };

// Test JSON
const json = JSON.stringify(myData, null, 2);
const jsonTokens = countTokens(json);

// Test TOON
const toon = encode(myData);
const toonTokens = countTokens(toon);

// Calculate savings
const reduction = ((jsonTokens - toonTokens) / jsonTokens) * 100;
```

## References

- [TOON Format Specification](https://github.com/toon-format/toon)
- [TOON TypeScript SDK](https://www.npmjs.com/package/@toon-format/toon)
- [Token Counting (tiktoken)](https://github.com/openai/tiktoken)

