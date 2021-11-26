import { __ } from 'src'
import { Capture, ExpandCapture, Overlapping } from 'src/types'
import { A } from 'ts-toolbelt'
import { check, checks, Pass } from 'ts-toolbelt/out/Test'
import { Data, Img, Result, Success, Text } from './test-helper'

checks([
  // Top Types
  check<Overlapping<{}, {}>, {}, Pass>(), // ??
  check<Overlapping<{}, any>, {}, Pass>(),
  check<Overlapping<{}, string>, never, Pass>(),
  check<Overlapping<any, {}>, {}, Pass>(),
  check<Overlapping<any, any>, any, Pass>(),
  check<Overlapping<any, string>, string, Pass>(),
  check<Overlapping<unknown, any>, unknown, Pass>(),
  check<Overlapping<unknown, {}>, never, Pass>(),
  check<Overlapping<unknown, string>, never, Pass>(),

  // Literals
  check<Overlapping<1, 1>, 1, Pass>(),
  check<Overlapping<'a', 'a'>, 'a', Pass>(),

  // Primitives
  check<Overlapping<string, string>, string, Pass>(),
  check<Overlapping<number, number>, number, Pass>(),
  check<Overlapping<boolean, boolean>, boolean, Pass>(),

  // Empty Array
  check<Overlapping<[], []>, [], Pass>(),
  check<Overlapping<number[], []>, never, Pass>(),
  check<Overlapping<[], number[]>, [], Pass>(),

  // Objects
  check<Overlapping<{}, {}>, {}, Pass>(),
  check<Overlapping<{ x: 0 }, {}>, { x: 0 }, Pass>(),
  check<Overlapping<{}, { x: 0 }>, never, Pass>(),

  // Tuples
  check<Overlapping<[0, 1, 2], [1, any, any]>, never, Pass>(),
  check<Overlapping<[0, 1, 2], [0, any, any]>, [0, 1, 2], Pass>(),
  check<Overlapping<['a' | 'b'], ['a']>, ['a'], Pass>(),

  // Primitive Unions
  check<
    Overlapping<string | number | boolean | {}, string>,
    string,
    Pass
  >(),
  check<Overlapping<1 | 2, 1>, 1, Pass>(),

  // Unions of tuples
  check<
    Overlapping<['ok', string] | ['error', Error], ['ok', any]>,
    ['ok', string],
    Pass
  >(),

  // Unions of objects
  check<
    Overlapping<
      Result<string>,
      { type: 'ok' }
    >,
    Success<string>,
    Pass
  >(),

  // Unions of objects no shared properties
  check<
    Overlapping<
      { a: 'a' } | { b: 'b' },
      { a: 'a' }
    >,
    { a: 'a' },
    Pass
  >(),

  // Union as a property
  check<
    Overlapping<
      { result: Result<string> },
      { result: { type: 'ok' } }
    >,
    { result: Success<string> },
    Pass
  >(),

  // Nested union as property
  check<
    Overlapping<
      { result: Result<Data> },
      { result: Success<{ type: 'text' }> }
    >,
    { result: Success<Text> },
    Pass
  >(),

  check<
    Overlapping<
      { data: { a: 'a'; b: 'b' } | { c: 'c'; d: 'd' } },
      { data: { a: 'a' } }
    >,
    { data: { a: 'a'; b: 'b' } },
    Pass
  >(),

  check<
    Overlapping<
      Result<Data>,
      ExpandCapture<{ type: 'ok'; value: { type: 'img'; src: Capture<'src', __> } }>
    >,
    Success<Img>,
    Pass
  >(),

  // Deeply nested union
  check<
    A.Compute<
      Overlapping<
        Result<Result<Result<'value'>>>,
        Success<Success<Success<'value'>>>
      >
    >,
    Success<Success<Success<'value'>>>,
    Pass
  >(),
])
