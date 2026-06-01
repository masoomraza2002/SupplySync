require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require("util");
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;