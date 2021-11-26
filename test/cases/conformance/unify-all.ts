import { __ } from 'src'
import { Capture, DoUnifyAll, UnifyAll } from 'src/types'
import { check, checks, Pass } from 'ts-toolbelt/out/Test'
import { Data, Img, Result, Success, Text } from './test-helper'

checks([
  // Holes
  check<
    UnifyAll<string, Capture<'value', __>>,
    { value: string },
    Pass
  >(),

  check<
    UnifyAll<any, Capture<'value', __>>,
    { value: any },
    Pass
  >(),

  check<
    UnifyAll<string, Capture<'value', __['string']>>,
    { value: string },
    Pass
  >(),

  check<
    UnifyAll<number, Capture<'value', __['string']>>,
    never,
    Pass
  >(),

  // Top types
  check<UnifyAll<{}, Capture<'value', any>>, { value: {} }, Pass>(),

  // Primitives
  // Literals
  check<UnifyAll<'string', string>, never, Pass>(),
  check<UnifyAll<'string', any>, never, Pass>(),

  check<UnifyAll<{}, {}>, never, Pass>(),
  check<UnifyAll<{ x: 'string' }, any>, never, Pass>(),
  check<UnifyAll<{ x: 'string' }, { x: any }>, never, Pass>(),
  check<UnifyAll<{ x: 'string' }, { x: string }>, never, Pass>(),

  check<UnifyAll<1, any>, never, Pass>(),
  check<UnifyAll<boolean, any>, never, Pass>(),
  check<UnifyAll<{}, any>, never, Pass>(),
  check<UnifyAll<() => {}, any>, never, Pass>(),

  check<
    UnifyAll<'string', Capture<'value', any>>,
    { value: 'string' },
    Pass
  >(),
  check<UnifyAll<1, Capture<'value', any>>, { value: 1 }, Pass>(),

  // Objects
  check<
    UnifyAll<Text, { content: Capture<'value'> }>,
    { value: string },
    Pass
  >(),
  check<
    UnifyAll<Result<Text>, { error: Capture<'value'> }>,
    { value: Error },
    Pass
  >(),
  check<
    UnifyAll<Result<Text>, { value: Capture<'value'> }>,
    { value: Text },
    Pass
  >(),

  // Numbers
  check<
    UnifyAll<{ x: 1 }, Capture<'value', any>>,
    { value: { x: 1 } },
    Pass
  >(),
  check<
    UnifyAll<{ x: 1 }, Capture<'value', {}>>,
    { value: { x: 1 } },
    Pass
  >(),
  check<
    UnifyAll<{ x: 1 }, Capture<'value', { x: 1 }>>,
    { value: { x: 1 } },
    Pass
  >(),

  // Strings
  check<
    UnifyAll<{ type: 'ok' }, Capture<'value', any>>,
    { value: { type: 'ok' } },
    Pass
  >(),
  check<
    UnifyAll<{ type: 'ok' }, Capture<'value', {}>>,
    { value: { type: 'ok' } },
    Pass
  >(),
  check<
    UnifyAll<{ type: 'ok' }, Capture<'value', { type: 'ok' }>>,
    { value: { type: 'ok' } },
    Pass
  >(),

  check<
    UnifyAll<{ type: 'ok' }, Capture<'value', { type: 'ok' }>>,
    { value: { type: 'ok' } },
    Pass
  >(),

  // Union
  check<
    UnifyAll<Data, Capture<'value', { type: 'text' }>>,
    { value: { type: 'text'; content: string } },
    Pass
  >(),

  check<
    UnifyAll<
      'a' | 'b',
      Capture<'value', 'a'>
    >,
    { value: 'a' },
    Pass
  >(),

  // Child union (array)
  check<
    UnifyAll<
      ['a' | 'b'],
      Capture<'value', ['a']>
    >,
    { value: ['a'] },
    Pass
  >(),

  // Child union (object)
  check<
    UnifyAll<
      { data: { a: 'a'; b: 'b' } | { c: 'c'; d: 'd' } },
      Capture<'value', { data: { a: 'a' } }>
    >,
    { value: { data: { a: 'a'; b: 'b' } } },
    Pass
  >(),

  // Child union
  check<
    UnifyAll<
      {
        pet: { type: 'cat'; breed: 'tabby' } | { type: 'dog'; breed: 'collie' }
      },
      Capture<'value', { pet: { type: 'dog' } }>
    >,
    { value: { pet: { type: 'dog'; breed: 'collie' } } },
    Pass
  >(),

  // Nested Union
  check<
    UnifyAll<
      Result<Data>,
      Capture<'value', { type: 'ok'; value: { type: 'text' } }>
    >,
    { value: Success<Text> },
    Pass
  >(),

  check<
    UnifyAll<
      { x: string },
      { x: Capture<'x', __> }
    >,
    { x: string },
    Pass
  >(),

  check<
    UnifyAll<
      { x: string | number },
      { x: Capture<'x', __> }
    >,
    { x: string } | { x: number },
    Pass
  >(),

  check<
    DoUnifyAll<
      { a: 1 } | { b: 2 },
      { a: Capture<'a', __> }
    >,
    { a: 1 },
    Pass
  >(),

  check<
    UnifyAll<
      Img,
      { type: 'img'; src: Capture<'src', __> }
    >,
    { src: string },
    Pass
  >(),

  check<
    UnifyAll<
      Data,
      { type: 'img'; src: Capture<'src', __> }
    >,
    { src: string },
    Pass
  >(),

  check<
    DoUnifyAll<
      Result<Data>,
      { type: 'ok'; value: { type: 'img'; src: Capture<'src', __> } }
    >,
    { src: string },
    Pass
  >(),

  check<
    UnifyAll<
      Result<Result<Result<'a'>>>,
      Capture<'value', Success<Success<Success<'a'>>>>
    >,
    { value: Success<Success<Success<'a'>>> },
    Pass
  >(),
])
