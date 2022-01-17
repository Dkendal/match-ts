import type { A, B, I, M, Union } from "ts-toolbelt";

import type { __ } from ".";

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
} from "./const";

type True = 1;

type ExtractSubcapture<T> = T extends M.Primitive | M.BuiltIn
  ? never
  : T extends object
  ? T[Exclude<keyof T, keyof [] | keyof {}>]
  : never;

type PartialAssignment<K, V> = V extends never
  ? never
  : K extends string
  ? { [k in K]: V }
  : never;

type EmptyToNever<T> = {} extends T ? never : T;

export type Kind =
  | typeof any_
  | typeof rest_
  | typeof string_
  | typeof number_
  | typeof boolean_
  | typeof function_
  | typeof symbol_
  | typeof bigint_
  | typeof object_;

export interface Hole<Type = any, Label = any> {
  T: Type;
  readonly [__kind__]: Label;
}

export type HoleInnerType<T> = T extends Hole<infer U> ? U : T;

export interface Capture<Name extends String = any, Pattern = any> {
  readonly [__capture__]: Name;
  readonly pattern: Pattern;
}

type CapturePattern<T> = T extends Capture<any, infer Pattern> ? Pattern : T;

type RecursiveExpandCapture<T> = A.Equals<T, any> extends True
  ? T
  : T extends Hole | Capture
  ? ExpandCapture<T>
  : T extends Record<string, any>
  ? { [K in keyof T]: ExpandCapture<T[K]> }
  : never;

export type ExpandCapture<T> = RecursiveExpandCapture<
  CapturePattern<HoleInnerType<T>>
>;

type NeverToEmpty<T> = [T] extends [never] ? {} : T;

type Explode<T> = T[keyof T];

export type RecursiveCollect<Node> = NeverToEmpty<DoRecursiveCollect<Node>>;

type IsLeafNode<T> = B.Or<
  B.Not<A.Extends<T, Record<string, any>>>,
  B.Or<A.Extends<T, Hole>, A.Equals<T, any>>
>;

type WalkChildren<Node> = Explode<
  { [Key in keyof Node]: DoRecursiveCollect<Node[Key]> }
>;

type DoRecursiveCollect<Node> = IsLeafNode<Node> extends True
  ? never
  : Node extends Capture<any, infer P>
  ? Node | DoRecursiveCollect<P>
  : WalkChildren<Node>;

type UnionizeCapture<T> = T extends Capture<infer K, infer V>
  ? K extends string
    ? { [k in K]: V }
    : never
  : never;

export type CaptureToEntry<T> = Union.Merge<UnionizeCapture<T>>;

export type VariableCapture<T> = ExpandCapture<
  CaptureToEntry<RecursiveCollect<T>>
>;

export type PatternHandler<Pattern> = (
  arg1: VariableCapture<Pattern>
) => unknown;

type IsTopType<T> = A.Extends<
  True,
  | A.Equals<T, unknown>
  | A.Equals<T, object>
  | A.Equals<T, Object>
  | A.Equals<T, any>
>;

export type UnifyAll<Value, Pattern> = IsTopType<Value> extends True
  ? VariableCapture<Pattern>
  : Overlapping<Value, ExpandCapture<Pattern>> extends {}
  ? DoUnifyAll<Value, Pattern>
  : never;

export type DoUnifyAll<Value, Pattern> = Pattern extends Capture<
  infer VarName,
  infer Child
>
  ?
      | PartialAssignment<VarName, Overlapping<Value, ExpandCapture<Child>>>
      | UnifyAll<Value, Child>
  : Overlapping<Value, ExpandCapture<Pattern>> extends object
  ? ExtractSubcapture<
      {
        [K in keyof Value]: K extends keyof Pattern
          ? UnifyAll<Value[K], Pattern[K]>
          : never;
      }
    >
  : never;

export type ShouldUnifyAll<Value, Pattern> = B.Not<
  B.Or<
    A.Equals<Pattern, any> & A.Equals<Value, any>,
    A.Extends<Pattern, M.Primitive> & A.Extends<Value, M.Primitive>
  >
>;

export type CaseParameters<Value, Pattern> = EmptyToNever<
  Union.Merge<UnifyAll<Value, Pattern>>
>;

export type Overlapping<
  A,
  B,
  Depth extends I.Iteration = I.IterationOf<0>
> = A.Equals<A, any> extends True
  ? B
  : A extends B
  ? A
  : [A, B, keyof A] extends
      | [Array<any>, Array<any>, any]
      | [object, object, keyof B]
  ? RejectMismatch<
      {
        [Key in keyof A]: Key extends keyof B
          ? Overlapping<A[Key], B[Key], I.Next<Depth>>
          : A[Key];
      }
    >
  : never;

export type RejectMismatch<T> = {} extends T
  ? never
  : T extends AnyNever<A.Cast<T, object>>
  ? never
  : T;

export type AnyNever<T extends object> = keyof T extends infer S
  ? S extends any
    ? { [K in A.Cast<S, string | number | symbol>]: never }
    : never
  : never;
