import { Narrow } from 'ts-toolbelt/out/Function/Narrow'
import { inspect } from 'util'

import {
  __capture__,
  __kind__,
  any_,
  bigint_,
  boolean_,
  function_,
  number_,
  object_,
  rest_,
  string_,
  symbol_,
} from './const'

import type { Capture, Hole, Kind, PatternHandler } from './types'

function hole<Type, Label extends Kind>(kind: Label): Hole<Type, Label> {
  return { [__kind__]: kind } as any
}

function capture<Name extends string>(name: Name): Capture<Name, typeof holes.any>

function capture<Name extends string, Pattern>(name: Name, pattern: Narrow<Pattern>): Capture<Name, Pattern>

function capture(name: any, pattern: any = holes.any): Capture<any, any> {
  return Object.freeze({ [__capture__]: name, pattern })
}

export const V = capture

function isCapture(term: unknown): term is Capture {
  return isNonPrimitive(term) && __capture__ in term
}

function isHole(term: unknown): term is Hole {
  return typeof term === 'object' && term !== null && __kind__ in term
}

function isSpecial(term: unknown): term is Hole | Capture {
  return isNonPrimitive(term) && (__kind__ in term || __capture__ in term)
}

function testHole(hole: Hole, term: unknown): boolean {
  if (!(__kind__ in hole)) throw 'ni'

  const holeKind = hole[__kind__]

  switch (holeKind) {
    // FIXME this doesn't really work like the others it only receives one of
    // the "rest" values, but has logic that disables checking that arrays
    // are the same length. this is more imporant if we want to capture
    // values.
    case rest_:
    case any_:
      return true
    default:
      return typeof term === holeKind
  }
}

// This little interface dance is done in the name of "readability" (debatable)

interface __any extends Hole<any, 'any'> {}
const __any: __any = hole(any_)

export interface __string extends Hole<string, 'string'> {}
const __string: __string = hole(string_)

export interface __number extends Hole<number, 'number'> {}
const __number: __number = hole(number_)

export interface __boolean extends Hole<boolean, 'boolean'> {}
const __boolean: __boolean = hole(boolean_)

export interface __symbol extends Hole<symbol, 'symbol'> {}
const __symbol: __symbol = hole(symbol_)

export interface __bigint extends Hole<bigint, 'bigint'> {}
const __bigint: __bigint = hole(bigint_)

export interface __object extends Hole<Object, 'object'> {}
const __object: __object = hole(object_)

export interface __function extends Hole<Function, 'function'> {}
const __function: __function = hole(function_)

export interface __rest extends Hole<any[], 'rest'> {}
const __rest: __rest = hole(rest_)

export const holes = {
  string: __string,
  number: __number,
  boolean: __boolean,
  object: __object,
  function: __function,
  symbol: __symbol,
  bigint: __bigint,

  // This is intentionally not the same object as __ to prevent
  // a circular reference
  any: __any,

  rest: __rest,
  // Aliases
  tail: __rest,
  tl: __rest,
}

export interface __ extends Hole<any, 'any'> {
  string: __string
  number: __number
  boolean: __boolean
  // There is something weird going on where including this causes
  // RecursiveCollect to think that it has a circular reference
  object: __object
  function: __function
  symbol: __symbol
  bigint: __bigint
  any: __any
  rest: __rest
  tail: __rest
  tl: __rest
}

/**
 * A hole for any value, and an object that has references
 * to the other type holes.
 */
// TODO better syntax for function object
export const __: __ = Object.assign(hole(any_), holes)

export function when<Pattern, Handler extends PatternHandler<Pattern>>(a: Pattern, b: Handler): [Pattern, Handler] {
  return [a, b]
}

export function match(valueRoot: unknown, ...cases: [unknown, Function][]): any {
  // TODO error on no cases
  next_case:
  for (let [patternRoot, handler] of cases) {
    const captures: Record<string, unknown> = {}
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
      const stack = [[patternRoot, valueRoot]]
      while (stack.length > 0) {
        const [pnode, vnode] = stack.pop() as [any, any]

        if (isCapture(pnode)) {
          if ('pattern' in pnode)
            stack.push([pnode.pattern, vnode])
          captures[pnode[__capture__]] = vnode
          continue
        }

        if (isHole(pnode)) {
          if (testHole(pnode, vnode)) continue
          else continue next_case
        }

        // Special case for arrays
        if (
          pnode instanceof Array
          && pnode.length !== vnode.length // If the list has any elements and the last is not a "rest"
          && (pnode.length === 0 || pnode[pnode.length - 1] !== __rest)
        ) {
          continue next_case
        }

        const lastIdx = (pnode.length - 1).toString()

        // TODO: be more careful about dealing with prototypes
        for (let [attr, pchild] of Object.entries(pnode)) {
          // Check if there is a malformed "rest"
          if (pchild === __rest && attr !== lastIdx)
            throw 'rest must be the last element of an array'

          const vchild = vnode[attr]

          // Push node to handle at the top of the loop
          if (isSpecial(pchild)) stack.push([pchild, vchild])
          else if (typeof pchild !== typeof vchild) continue next_case
          // Push node onto stack to descend into
          else if (typeof pchild === 'object') stack.push([pchild, vchild])
          // Leaf comparison
          else if (vchild !== pchild) continue next_case
        }
      }
      return handler(captures)
    }

    // maybe this can be folded into the logic above
    // Leaf comparison
    if (patternRoot !== valueRoot) continue next_case
    return handler(captures)
  }

  throw `unmatched case: ${inspect(valueRoot)}`
}

type NonPrimitive = Function | Object

function isNonPrimitive(term: unknown): term is NonPrimitive {
  const t = typeof term
  return (t === 'object' || t === 'function') && term !== null
}
