import { __, __function, __object, __string } from 'src'
import type {
  Capture as $,
  CaptureToEntry,
  ExpandCapture,
  Hole,
  HoleInnerType,
  RecursiveCollect,
  VariableCapture,
} from 'src/types'
import { Test } from 'ts-toolbelt'

// Just for testing clarity
type $a<T = any> = $<'a', T>
type $b<T = any> = $<'b', T>
type $c<T = any> = $<'c', T>

const { check, checks } = Test
type Pass = Test.Pass

checks([
  check<HoleInnerType<__>, any, Pass>(),
  check<HoleInnerType<__['string']>, string, Pass>(),
  check<HoleInnerType<__['number']>, number, Pass>(),
  check<HoleInnerType<__['rest']>, any[], Pass>(),
])

checks([
  check<CaptureToEntry<$a>, { a: any }, Pass>(),
  check<CaptureToEntry<$a<{}>>, { a: {} }, Pass>(),
  check<CaptureToEntry<$a<1>>, { a: 1 }, Pass>(),
  check<CaptureToEntry<$a<{ x: 1 }>>, { a: { x: 1 } }, Pass>(),
  check<CaptureToEntry<$a | $b | $c>, { a: any; b: any; c: any }, Pass>(),
  check<
    CaptureToEntry<$a<{ b: $b<1> }> | $b<1>>,
    { a: { b: $b<1> }; b: 1 },
    Pass
  >(),
])

checks([
  // No effect if captures are absent
  check<RecursiveCollect<never>, {}, Pass>(),
  check<RecursiveCollect<{}>, {}, Pass>(),
  check<RecursiveCollect<any>, {}, Pass>(),
  check<RecursiveCollect<string>, {}, Pass>(),
  check<RecursiveCollect<Hole<'any', any>>, {}, Pass>(),
  check<RecursiveCollect<__>, {}, Pass>(),
  check<RecursiveCollect<__['string']>, {}, Pass>(),
  check<RecursiveCollect<__object>, {}, Pass>(),
  check<RecursiveCollect<__function>, {}, Pass>(),
  check<RecursiveCollect<__string>, {}, Pass>(),
  check<RecursiveCollect<1>, {}, Pass>(),
  check<RecursiveCollect<{ a: {} }>, {}, Pass>(),
  check<RecursiveCollect<{ a: { b: {} } }>, {}, Pass>(),
  // single capture, const
  check<RecursiveCollect<$a<any>>, $a<any>, Pass>(),
  check<RecursiveCollect<$a<__>>, $a<__>, Pass>(),
  check<RecursiveCollect<$a<1>>, $a<1>, Pass>(),
  // Nested captures
  check<RecursiveCollect<$a<$b<1>>>, $a<$b<1>> | $b<1>, Pass>(),
  check<
    RecursiveCollect<$a<{ b: $b<__>; c: $c<__> }>>,
    $c<__> | $b<__> | $a<{ b: $b<__>; c: $c<__> }>,
    Pass
  >(),
])

checks([
  check<ExpandCapture<{}>, {}, Pass>(),
  check<ExpandCapture<any>, any, Pass>(),
  check<ExpandCapture<unknown>, unknown, Pass>(),
  check<ExpandCapture<number>, number, Pass>(),
  check<ExpandCapture<1>, 1, Pass>(),
  check<ExpandCapture<__>, any, Pass>(),
  check<ExpandCapture<__string>, string, Pass>(),
  check<ExpandCapture<$a>, any, Pass>(),
  check<ExpandCapture<$a<$b<$c<any>>>>, any, Pass>(),
  check<ExpandCapture<{ a: any }>, { a: any }, Pass>(),
  check<ExpandCapture<{ a: $b }>, { a: any }, Pass>(),
  check<ExpandCapture<{ a: $b }>, { a: any }, Pass>(),
  check<ExpandCapture<{ a: $b<__> }>, { a: any }, Pass>(),
])

checks([
  check<VariableCapture<__>, {}, Pass>(),
  check<VariableCapture<$a>, { a: any }, Pass>(),
  check<VariableCapture<$a<__>>, { a: any }, Pass>(),
  check<VariableCapture<$a<__string>>, { a: string }, Pass>(),
  check<VariableCapture<$a<{}>>, { a: {} }, Pass>(),
  check<VariableCapture<$a<{}> | $b<{}>>, { a: {}; b: {} }, Pass>(),
  check<
    VariableCapture<$a<{ b: $b<{}> }> | $b<{}>>,
    { a: { b: {} }; b: {} },
    Pass
  >(),
  check<VariableCapture<$a<{ b: __ }>>, { a: { b: any } }, Pass>(),
])
