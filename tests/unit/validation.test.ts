import { validateInput } from '../../src/store-session/input-validator.js';
import type { StoreSessionParams } from '../../src/store-session/types.js';

describe('InputValidation', () => {
  it('should accept valid conversation string', () => {
    const params: StoreSessionParams = {
      conversation: 'User: test\nAI: response',
    };

    const result = validateInput(params);
    expect(result.valid).toBe(true);
  });

  it('should accept valid messages array', () => {
    const params: StoreSessionParams = {
      conversation: [
        { role: 'user', content: 'test' },
      ],
      format: 'messages',
    };

    const result = validateInput(params);
    expect(result.valid).toBe(true);
  });

  it('should accept empty conversation (will be handled with warning)', () => {
    const params: StoreSessionParams = {
      conversation: '',
    };

    const result = validateInput(params);
    expect(result.valid).toBe(true); // Empty strings are now allowed
  });

  it('should accept empty messages array (will be handled with warning)', () => {
    const params: StoreSessionParams = {
      conversation: [],
      format: 'messages',
    };

    const result = validateInput(params);
    expect(result.valid).toBe(true); // Empty arrays are now allowed
  });

  it('should reject invalid format', () => {
    const params: StoreSessionParams = {
      conversation: 'test',
      format: 'invalid' as 'plain',
    };

    const result = validateInput(params);
    expect(result.valid).toBe(false);
  });

  it('should reject topic that is too long', () => {
    const params: StoreSessionParams = {
      conversation: 'test',
      topic: 'a'.repeat(101),
    };

    const result = validateInput(params);
    expect(result.valid).toBe(false);
  });

  it('should reject conversation that is too large', () => {
    const largeConversation = 'x'.repeat(11 * 1024 * 1024); // 11MB
    const params: StoreSessionParams = {
      conversation: largeConversation,
    };

    const result = validateInput(params);
    expect(result.valid).toBe(false);
  });

  it('should accept valid topic length', () => {
    const params: StoreSessionParams = {
      conversation: 'test',
      topic: 'a'.repeat(50),
    };

    const result = validateInput(params);
    expect(result.valid).toBe(true);
  });
});

