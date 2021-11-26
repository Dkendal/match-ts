import { A, B, I, M, Union } from 'ts-toolbelt'
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

type ExtractSubcapture<T> = (T extends M.Primitive | M.BuiltIn
  ? Never<'T is literal', [T], 0>
  : (T extends object ? (T[Exclude<keyof T, keyof [] | keyof {}>]) : never))

type PartialAssignment<K, V> = V extends never ? never
  : K extends string ? { [k in K]: V }
  : never

type EmptyToNever<T> = {} extends T ? never : T

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

type RecursiveExpandCapture<T> =
  // Guard against any as mapping it will cause an infite descent
  A.Equals<T, any> extends True ? T
    : T extends Hole | Capture ? ExpandCapture<T>
    : T extends Record<string, any> ? { [K in keyof T]: ExpandCapture<T[K]> }
    : T

export type ExpandCapture<T> = RecursiveExpandCapture<
  CapturePattern<HoleInnerType<T>>
>

type NeverToEmpty<T> =
  // HACK: prevent distributing the type
  [T] extends [never] ? {} : T

type Explode<T> = T[keyof T]

export type RecursiveCollect<Node> = NeverToEmpty<DoRecursiveCollect<Node>>

type IsLeafNode<T> = B.Or<
  B.Not<A.Extends<T, Record<string, any>>>,
  B.Or<A.Extends<T, Hole>, A.Equals<T, any>>
>

type WalkChildren<Node> = Explode<
  {
    [Key in keyof Node]: DoRecursiveCollect<Node[Key]>
  }
>

type DoRecursiveCollect<Node> =
  // This has to be written this way instead of using If to prevent a circular
  // reference.
  IsLeafNode<Node> extends True ? never
    : Node extends Capture<any, infer Pattern> // save this capture, and recurse into its pattern
      ? Node | DoRecursiveCollect<Pattern>
    : WalkChildren<Node>

type UnionizeCapture<T> = T extends Capture<infer K, infer V>
  ? K extends string ? { [k in K]: V }
  : never
  : never

export type CaptureToEntry<T> = Union.Merge<UnionizeCapture<T>>

// Steps
// 1. Collect all variable captures as a union
// 2. Convert union to an object, key name is value of capture, value is the pattern
// 3. Remove captures and holes from all values
export type VariableCapture<T> = ExpandCapture<
  CaptureToEntry<RecursiveCollect<T>>
>

export type PatternHandler<Pattern> = (
  arg: VariableCapture<Pattern>,
) => unknown

type IsTopType<T> = A.Extends<
  True,
  | A.Equals<T, unknown>
  | A.Equals<T, object>
  | A.Equals<T, Object>
  | A.Equals<T, any>
>

/**
 * Same as DoUnifyAll, but with a guard against Value being a top type. If Value
 * is a top type then it's ignored and the return type is just whatever was
 * expliciitly defined in Pattern. */
export type UnifyAll<Value, Pattern> = IsTopType<Value> extends True // if the Value is unknown (or is another top type)
  ? VariableCapture<Pattern> // then use only the type information from the pattern
  : (
    // Value extends ExpandCapture<Pattern> ? // Else if pattern looks like it describes Value
    Overlapping<Value, ExpandCapture<Pattern>> extends {} ? // Else if pattern looks like it describes Value
    DoUnifyAll<Value, Pattern> // extract variables from it while preserving type information from Value
      : Never<
        "Pattern doesn't describe value"
      >
  )

// export type DoUnifyAll<Value, Pattern> = (
//   Pattern extends Capture<infer VarName, infer Child> // If Pattern is a Capture then assign the variable-name and the sub-pattern
//     ? (
//       | PartialAssignment<VarName, Overlapping<Value, ExpandCapture<Child>>> // Extract variable assignment, returns an object like { [VarName]: Value }
//       | UnifyAll<Value, Child> // Recursive operation into sub-pattern, extract any nested variable assignments
//     )
//     : (
//       If<
//         ShouldUnifyAll<Value, Pattern>,
//         (
//   Overlapping<Value, ExpandCapture<Pattern>> extends {} ? (
//               {
//                 [Key in keyof Pattern & keyof Value]: UnifyAll<
//                   Value[Key],
//                   Pattern[Key]
//                 >
//               }
//           )
//             : (
//               Never<
//                 "Value doesn't have overlap",
//                 [Value, ExpandCapture<Pattern>, Overlapping<Value, ExpandCapture<Value>>],
//                 1
//               >
//             )
//         ),
//         Never<'not ShouldUnifyAll', [Value, Pattern], 1>
//       >
//     )
// )
export type DoUnifyAll<Value, Pattern> = (
  Pattern extends Capture<infer VarName, infer Child> // If Pattern is a Capture then assign the variable-name and the sub-pattern
    ? (
      | PartialAssignment<VarName, Overlapping<Value, ExpandCapture<Child>>> // Extract variable assignment, returns an object like { [VarName]: Value }
      | UnifyAll<Value, Child> // Recursive operation into sub-pattern, extract any nested variable assignments
    )
    : (Overlapping<Value, ExpandCapture<Pattern>> extends object
      ? (ExtractSubcapture<
        {
          [K in keyof Value]:
            (K extends keyof Pattern ? UnifyAll<Value[K], Pattern[K]>
              : Never<'K not in keyof Pattern', [K], 0>)
        }
      >)
      : Never<
        "Doesn't have overlap",
        Overlapping<Value, ExpandCapture<Pattern>>,
        0
      >)
)

export type ShouldUnifyAll<Value, Pattern> = B.Not<
  B.Or<
    A.Equals<Pattern, any> & A.Equals<Value, any>,
    A.Extends<Pattern, M.Primitive> & A.Extends<Value, M.Primitive>
  >
>

export type CaseParameters<Value, Pattern> = EmptyToNever<
  Union.Merge<UnifyAll<Value, Pattern>>
>

export type Overlapping<A, B, Depth extends I.Iteration = I.IterationOf<0>> =
  (A.Equals<A, any> extends True ? B
    : (A extends B ? A
      : ([A, B, keyof A] extends
        | [any[], any[], any]
        | [object, object, keyof B] ? (
          RejectMismatch<
            {
              [Key in keyof A]: (
                Key extends keyof B ? Overlapping<A[Key], B[Key], I.Next<Depth>>
                  : A[Key]
              )
            }
          >
        )
        : Never<'No matching case', [A, B]>)))

export type RejectMismatch<T> = ({} extends T ? Never<'{} extends T == true', T>
  : (T extends AnyNever<A.Cast<T, object>>
    ? Never<'atleast one value in T is never', T>
    : T))

export type AnyNever<T extends object> = keyof T extends infer S
  ? (S extends any ? { [K in A.Cast<S, string | number | symbol>]: never }
    : never)
  : never

type D<T extends string | number, U = never> = {
  readonly [k in T]: U
}

type I<T> = { readonly value: T }

type NeverD<Msg extends string | number, Value = never> = {
  readonly [k in Msg]: Value
}

type Never<Msg extends string | number, Value = never, Debug = 0> =
  Debug extends 1 ? NeverD<Msg, Value> : never

type Id<T> = T
