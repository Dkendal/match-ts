import { A, B, Union } from 'ts-toolbelt'
import { __ } from '.'

import type {
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

type True = 1

export type Kind =
  | typeof any_
  | typeof rest_
  | typeof string_
  | typeof number_
  | typeof boolean_
  | typeof function_
  | typeof symbol_
  | typeof bigint_
  | typeof object_

export interface Hole<Type = any, Label = any> {
  T: Type
  readonly [__kind__]: Label
}

export type HoleInnerType<T> = T extends Hole<infer U> ? U : T

export interface Capture<Name extends String = any, Pattern = any> {
  readonly [__capture__]: Name
  readonly pattern: Pattern
}

type CapturePattern<T> = T extends Capture<any, infer Pattern> ? Pattern : T

export type RecursiveExpandCapture<T> =
  // Guard against any as mapping it will cause an infite descent
  A.Equals<T, any> extends True ? T
    : T extends Hole | Capture ? ExpandCapture<T>
    : T extends Record<string, any> ? { [K in keyof T]: ExpandCapture<T[K]> }
    : T

export type ExpandCapture<T> = RecursiveExpandCapture<CapturePattern<HoleInnerType<T>>>

type NeverToEmpty<T> =
  // HACK: prevent distributing the type
  [T] extends [never] ? {} : T

type Explode<T> = T[keyof T]

export type RecursiveCollect<Node> = NeverToEmpty<DoRecursiveCollect<Node>>

type IsLeafNode<T> = B.Or<B.Not<A.Extends<T, Record<string, any>>>, B.Or<A.Extends<T, Hole>, A.Equals<T, any>>>

type WalkChildren<Node> = Explode<{ [Key in keyof Node]: DoRecursiveCollect<Node[Key]> }>

export type DoRecursiveCollect<Node> =
  // This has to be written this way instead of using If to prevent a circular
  // reference.
  IsLeafNode<Node> extends True ? never : Node extends Capture<any, infer Pattern> // save this capture, and recurse into its pattern
    ? Node | DoRecursiveCollect<Pattern>
  : WalkChildren<Node>

type UnionizeCapture<T> = T extends Capture<infer K, infer V> ? K extends string ? { [k in K]: V } : never : never

export type CaptureToEntry<T> = Union.Merge<UnionizeCapture<T>>

// Steps
// 1. Collect all variable captures as a union
// 2. Convert union to an object, key name is value of capture, value is the pattern
// 3. Remove captures and holes from all values
export type VariableCapture<T> = ExpandCapture<CaptureToEntry<RecursiveCollect<T>>>

export type PatternHandler<Pattern> = (arg: VariableCapture<Pattern>) => unknown
