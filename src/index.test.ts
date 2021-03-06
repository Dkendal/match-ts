import { __, match, V, when } from './index'

const ok = () => true
const err = () => 'error'
const id = <T>(term: T): T => term
const noMatch = Symbol.for('no match')

describe('.match', () => {
  test('literal values', () => {
    const result = match(1, [1, ok])

    expect(result).toBe(true)
  })

  test('unmatched cases throw', () => {
    const fn = () => match(2, [1, ok])

    expect(fn).toThrow('unmatched case: 2')
  })

  test('multiple cases', () => {
    const result = match(2, [1, () => false], [2, ok])

    expect(result).toBe(true)
  })

  test('arrays', () => {
    const result = match(
      [1, 2, 3],
      // smaller
      [[1], () => 'err-1'],
      // larger
      [[1, 2, 3, 4], () => 'err-2'],
      // different
      [[2, 2, 3], () => 'err-3'],
      // ok
      [[1, 2, 3], ok],
    )

    expect(result).toBe(true)
  })

  test('nested arrays', () => {
    const result = match([1, [2, [3, 4, 5]]], [[1, [2, [3]]], () => false], [[
      1,
      [2, [3, 4, 5]],
    ], ok])

    expect(result).toBe(true)
  })

  test('objects', () => {
    const result = match({ a: 1, b: 2 }, [{ a: 2 }, () => false], [
      { b: 2 },
      ok,
    ])

    expect(result).toBe(true)
  })

  test('null values', () => {
    const result = match(null, [undefined, () => false], [null, ok])

    expect(result).toBe(true)
  })

  test('undefined', () => {
    const result = match(undefined, [null, () => false], [undefined, ok])

    expect(result).toBe(true)
  })

  test('nested objects', () => {
    const result = match(
      [{ a: { b: 1, c: 2 }, d: 3 }],
      when([{ a: { b: 1, c: 2 }, d: 3.1 }], () => false),
      when([{ a: { b: 1.1 } }], () => false),
      when([{ a: { b: 1 } }], ok),
    )

    expect(result).toBe(true)
  })

  test.each([
    [1, when(__, ok)],
    [[1], when(__, ok)],
    [[1], when([__], ok)],
    [[1, 2, 3], when([__, 2, 3], ok)],
    [[1, 2, 3], when([__, __, 3], ok)],
    [[1, 2, 3], when([1, __, 3], ok)],
    [{ a: 1, b: 2 }, when({ a: __, b: 2 }, ok)],
  ])('untyped holes (%#)', (value, ...cases: any[]) => {
    const result = match(value, ...cases)
    expect(result).toBe(true)
  })

  test.each([
    [[1], when([__.rest], ok)],
    // matches 0 elements
    [[], when([__.rest], ok)],
    [[1, 2], when([__.rest], ok)],
    [[1, 2, 3], when([1, __.rest], ok)],
    [[1, 2, 3], when([1, 2, __.rest], ok)],
  ])('rest holes (%#)', (value, ...cases: any[]) => {
    const result = match(value, ...cases)
    expect(result).toBe(true)
  })

  test('rest holes throw if there are multiple rests in an array', () => {
    const fn = () => match([1, 2, 3], when([__.rest, __.rest], ok))
    expect(fn).toThrow()
  })

  test.each([
    ['', when(__.string, ok)],
    [null, when(__.string, err), when(__, ok)],

    [0, when(__.number, ok)],
    [null, when(__.number, err), when(__, ok)],

    [{}, when(__.object, ok)],
    [0, when(__.object, err), when(__, ok)],

    [id, when(__.function, ok)],
    [0, when(__.function, err), when(__, ok)],
  ])('typed holes holes (%#)', (value, ...cases: any[]) => {
    const result = match(value, ...cases)
    expect(result).toBe(true)
  })

  test.each([
    [1, V('x'), { x: 1 }],
    [1, V('x', __), { x: 1 }],
    [1, V('x', __.number), { x: 1 }],
    [1, V('x', __.string), noMatch],
    [{ a: 1, b: 2 }, { a: V('x') }, { x: 1 }],
    [[1, 2, 3], [V('hd'), __.rest], { hd: 1 }],
    // TODO [[1, 2, 3], [__, V("tl")(__.tail)], { tl: [2, 3] }],
  ])('variable capture: %p (%#)', (value: any, pattern: any, expected: any) => {
    expect(match(value, [pattern, id], [__, () => noMatch])).toEqual(expected)
  })

  test('no variables are captured by default', () => {
    expect(match(1, [__, id])).toEqual({})
  })

  test.todo('rest holes throw if used outside of an array')
})
