import { __, match, V } from 'src'
import { check, checks, Pass } from 'ts-toolbelt/out/Test'
import { Data, Result, Success, Text, valueof } from './test-helper'

// Top types
match(valueof<unknown>(), [
  V('value'),
  // valueof<Capture<'value', any>>(),
  (arg) => checks([check<typeof arg, { value: any }, Pass>()]),
])

match(valueof<{}>(), [
  V('value'),
  // valueof<Capture<'value', any>>(),
  (arg) => checks([check<typeof arg, { value: {} }, Pass>()]),
])

match(valueof<any>(), [
  V('value'),
  // valueof<Capture<'value', any>>(),
  (arg) => checks([check<typeof arg, { value: any }, Pass>()]),
])

// Primitives

match(valueof<string>(), [
  V('value'),
  // valueof<Capture<'value', any>>(),
  (arg) => checks([check<typeof arg, { value: string }, Pass>()]),
])

// Return type is implied, single case
{
  const returnValue = match(valueof<{ x: 1 }>(), [
    V('val'),
    (arg) => {
      checks([check<typeof arg, { val: { x: 1 } }, Pass>()])
      return 1
    },
  ])

  checks([check<typeof returnValue, number, Pass>()])
}

// Return type is implied, union of all other branches return values
{
  const returnValue = match(
    valueof<any>(),
    [
      V('str', __.string),
      (arg) => {
        checks([check<typeof arg, { str: string }, Pass>()])
        return arg.str
      },
    ],
    [
      V('num', __.number),
      (arg) => {
        checks([check<typeof arg, { num: number }, Pass>()])
        return arg.num
      },
    ],
    [
      V('bool', __.boolean),
      (arg) => {
        checks([check<typeof arg, { bool: boolean }, Pass>()])
        return arg.bool
      },
    ],
  )

  checks([check<typeof returnValue, string | number | boolean, Pass>()])
}

match(valueof<Result<{ id: 'id_1' }>>(), [
  { value: V('value') },
  (arg) => {
    checks([check<typeof arg, { value: { id: 'id_1' } }, Pass>()])
  },
])

match(valueof<Result<{ id: 'id_1' }>>(), [
  { value: { id: V('capture_id') } },
  (arg) => {
    checks([check<typeof arg, { capture_id: 'id_1' }, Pass>()])
  },
])

match(valueof<Result<{ id: 'id_1' }>>(), [
  { error: V('error') },
  (arg) => {
    checks([check<typeof arg, { error: Error }, Pass>()])
  },
])

match(valueof<Result<{ id: 'id_1'; x: 1 }>>(), [
  { value: V('cValue', { id: V('cId') }) },
  (arg) => {
    checks([
      check<typeof arg, { cValue: { id: 'id_1'; x: 1 }; cId: 'id_1' }, Pass>(),
    ])
  },
])

match(valueof<Result<{ id: 'id_1' }>>(), [
  { value: V('value', { id: V('id', __.number) }) },
  (arg) => {
    checks([check<typeof arg, never, Pass>()])
  },
])

match(valueof<Result<{ id: 'id_1' }>>(), [
  { value: V('value', { id: V('id', __.string) }) },
  (arg) => {
    checks([check<typeof arg, { value: { id: 'id_1' }; id: 'id_1' }, Pass>()])
  },
])

match(valueof<Result<{ id: 'id_1' }>>(), [
  { value: V('value', { id: V('id', __.string) }) },
  (arg) => {
    checks([check<typeof arg, { value: { id: 'id_1' }; id: 'id_1' }, Pass>()])
    return 1
  },
])

// Object top type
match(valueof<Object>(), [
  V('value', { x: __ }),
  (arg) => {
    checks([check<typeof arg, { value: { x: any } }, Pass>()])
  },
])

match(valueof<object>(), [
  V('value', { x: __ }),
  (arg) => {
    checks([check<typeof arg, { value: { x: any } }, Pass>()])
  },
])

// Top type
match(valueof<unknown>(), [
  V('value', __),
  (arg) => {
    checks([check<typeof arg, { value: any }, Pass>()])
  },
])

match(valueof<any>(), [
  V('value', __.string),
  (arg) => {
    checks([check<typeof arg, { value: string }, Pass>()])
  },
])

// Regressions

match(
  valueof<Result<Data>>(),
  [{ type: 'error' }, (args) => checks([check<typeof args, never, 1>()])],
  [
    V('res', { type: 'ok', value: { type: 'text' } }),
    args => checks([check<typeof args, { res: Success<Text> }, 1>()]),
  ],
  [
    { type: 'ok', value: { type: 'img', src: V('src') } },
    args => checks([check<typeof args, { src: string }, 1>()]),
  ],
)
