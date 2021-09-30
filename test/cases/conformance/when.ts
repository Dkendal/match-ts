import { __, V, when } from 'src/index'
import { Test } from 'ts-toolbelt'

type Pass = Test.Pass

const { check, checks } = Test

when(__, value => {
  checks([check<typeof value, {}, Pass>()])
})

when(V('x'), value => {
  checks([check<typeof value, { x: any }, Pass>()])
})

when(V('x', __), value => {
  checks([check<typeof value, { x: any }, Pass>()])
})

when(V('x', __.string), value => {
  checks([check<typeof value, { x: string }, Pass>()])
})

when(V('x', __.number), value => {
  checks([check<typeof value, { x: number }, Pass>()])
})

when({ x: V('x') }, value => {
  checks([check<typeof value, { x: any }, Pass>()])
})

when(V('x', { a: V('y', { b: { c: V('z', { d: __ }) } }) }), value => {
  checks([
    check<
      typeof value,
      {
        x: { a: { b: { c: { d: any } } } }
        y: { b: { c: { d: any } } }
        z: { d: any }
      },
      Pass
    >(),
  ])
})

when([V('hd')], value => {
  checks([check<typeof value, { hd: any }, Pass>()])
})

when([V('hd'), V('tail', __.tail)], value => {
  checks([check<typeof value, { hd: any; tail: any[] }, Pass>()])
})
