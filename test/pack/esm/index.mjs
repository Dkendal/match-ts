import { strictEqual } from "assert";
import { match, __, V } from "@dkendal/match";

strictEqual(typeof match, "function");

const result = match(
  { type: "ok", value: { type: "img", src: "https://example.com/" } },
  [{ value: { type: "img", src: V("src", __.string) } }, ({ src }) => src]
);

strictEqual(result, "https://example.com/");

console.log("Test suite pass: test-pack-esm");
