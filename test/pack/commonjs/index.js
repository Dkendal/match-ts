const assert = require("assert");
const { match, __, V } = require("@dkendal/match");

assert.strictEqual(typeof match, "function");

const result = match(
  { type: "ok", value: { type: "img", src: "https://example.com/" } },
  [{ value: { type: "img", src: V("src", __.string) } }, ({ src }) => src]
);

assert.strictEqual(result, "https://example.com/");

console.log("Test suite pass: test-pack-commonjs");
