/**
 * Mock for @toon-format/toon to avoid ES module issues in Jest
 */
function encode(data, options) {
  // Simple mock that returns a string representation
  if (Array.isArray(data)) {
    return `[${data.length}]: ${JSON.stringify(data)}`;
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
      const arr = data[keys[0]];
      return `${keys[0]}[${arr.length}]: ${JSON.stringify(arr)}`;
    }
    return JSON.stringify(data);
  }
  return String(data);
}

function decode(input) {
  // Simple mock decoder
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

const DEFAULT_DELIMITER = ',';
const DELIMITERS = [',', '\t', '|'];

module.exports = {
  encode,
  decode,
  DEFAULT_DELIMITER,
  DELIMITERS,
};

