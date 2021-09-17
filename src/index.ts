import { inspect } from "util";

const __kind__ = Symbol.for("kind");
const __capture__ = Symbol.for("capture");

type Kind =
  | typeof any_
  | typeof rest_
  | typeof string_
  | typeof number_
  | typeof boolean_
  | typeof function_
  | typeof object_;

const any_ = "any";
const rest_ = "rest";
const string_ = "string";
const number_ = "number";
const boolean_ = "boolean";
const function_ = "function";
const object_ = "object";
const symbol_ = "symbol";

type NonPrimitive = Function | Object;

type Capture<Name extends String = string, Pattern = unknown> =
  | OpenCapture<Name, Pattern>
  | ClosedCapture<Name, Pattern>;

interface OpenCapture<Name extends String, Pattern> {
  (pattern: unknown): ClosedCapture<String, Pattern>;
  [__capture__]: Name;
}

interface ClosedCapture<Name extends String, Pattern> {
  [__capture__]: Name;
  pattern?: Pattern;
}

function capture<Name extends String, Pattern>(
  name: Name,
): OpenCapture<Name, Pattern> {
  return Object.assign(
    (pattern: any): ClosedCapture<Name, Pattern> => {
      return {
        [__capture__]: name,
        pattern,
      };
    },
    {
      [__capture__]: name,
    },
  );
}

export const V = capture;

function isCapture(term: unknown): term is Capture<string, unknown> {
  return isNonPrimitive(term) && __capture__ in term;
}

function isHole(term: unknown): term is Hole {
  return typeof term === "object" && term !== null && __kind__ in term;
}

function isSpecial(term: unknown): term is Hole | Capture {
  return (
    isNonPrimitive(term)
    && (__kind__ in term || __capture__ in term)
  );
}

function testHole(hole: Hole, term: unknown): boolean {
  if (!(__kind__ in hole)) throw "ni";

  const holeKind = hole[__kind__];

  switch (holeKind) {
    // FIXME this doesn't really work like the others it only receives one of
    // the "rest" values, but has logic that disables checking that arrays
    // are the same length. this is more imporant if we want to capture
    // values.
    case rest_:
    case any_:
      return true;
    default:
      return typeof term === holeKind;
  }
}

interface Hole {
  [__kind__]: Kind;
}

function hole<T>(sym: T) {
  return { [__kind__]: sym };
}

export const rest = hole(rest_);

export const __ = {
  [__kind__]: any_,

  string: hole(string_),
  number: hole(number_),
  boolean: hole(boolean_),
  object: hole(object_),
  function: hole(function_),
  symbol: hole(symbol_),

  rest,
  tail: rest,
  tl: rest,
} as const;

/** This is just to make things more legible, All it does is return a two
 * element tuple */
export function when<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

export function match(
  valueRoot: unknown,
  ...cases: [unknown, Function][]
): any {
  // TODO error on no cases
  next_case:
  for (let [patternRoot, handler] of cases) {
    const captures: Record<string, unknown> = {};
    // TODO type guards (functions)
    // if (typeof patternRoot === "function")

    // Treat nulls like built-in types despite being objects
    if (isNonPrimitive(patternRoot)) {
      // This is a stack based breadth-first-traversal of the "expected" and
      // "actual" objects in tandem. First the node from the "expected" object
      // is pushed on to the stack, along with the node in the same position
      // from the "actual" object. While comparing nodes, if a note a leaf but
      // is a node that needs to be descended into the nodes for each tree are
      // pushed onto the stack which alleviates the need for a recursive call,
      // additional function creation on the heap, etc.
      const stack = [[patternRoot, valueRoot]];
      while (stack.length > 0) {
        const [pnode, vnode] = stack.pop() as [any, any];

        if (isCapture(pnode)) {
          if ("pattern" in pnode) {
            stack.push([pnode.pattern, vnode]);
          }
          captures[pnode[__capture__]] = vnode;
          continue;
        }

        if (isHole(pnode)) {
          if (testHole(pnode, vnode)) continue;
          else continue next_case;
        }

        // Special case for arrays
        if (
          pnode instanceof Array
          && pnode.length !== vnode.length
          // If the list has any elements and the last is not a "rest"
          && (pnode.length === 0 || pnode[pnode.length - 1] !== rest)
        ) {
          continue next_case;
        }

        const lastIdx = (pnode.length - 1).toString();

        // TODO: be more careful about dealing with prototypes
        for (let [attr, pchild] of Object.entries(pnode)) {
          // Check if there is a malformed "rest"
          if (pchild === rest && attr !== lastIdx) {
            throw "rest must be the last element of an array";
          }

          const vchild = vnode[attr];

          // Push node to handle at the top of the loop
          if (isSpecial(pchild)) stack.push([pchild, vchild]);
          else if (typeof pchild !== typeof vchild) continue next_case;
          // Push node onto stack to descend into
          else if (typeof pchild === "object") stack.push([pchild, vchild]);
          // Leaf comparison
          else if (vchild !== pchild) continue next_case;
        }
      }
      return handler(captures);
    }

    // maybe this can be folded into the logic above
    // Leaf comparison
    if (patternRoot !== valueRoot) continue next_case;
    return handler(captures);
  }

  throw `unmatched case: ${inspect(valueRoot)}`;
}

function isNonPrimitive(term: unknown): term is NonPrimitive {
  const t = typeof term;
  return (t === "object" || t === "function") && term !== null;
}
