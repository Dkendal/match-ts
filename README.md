# pattern-matching.js

Provides pattern matching features typically found in functional
languages like Elixir/Erlang, ML, F\#, etc.

## Installation

TODO

## The `match` function

The match function lets us compare a value against many patterns until
we find one that matches.

```typescript
import { __, match, when } from 'pattern-matching'

match(
  [1, 2, 3],
  when([4, 5, 6], () => "This clause won't match"),
  when([1, __, 3], () => 'This clause will match, __ will match any value'),
  when(__, () => 'This clause would match any value'),
)

'This clause will match, __ will match any value'
```

The value that was passed into `match` is also passed to the callback:

```typescript
const x = 10

match(
  x,
  when(__, (value) => value * 10),
)
100
```

If none of the cases match and error is thrown:

```typescript
match([1, 2, 3]
      when([1, 2], () => "this won't match as the array lengths don't agree"))
// (Error) unmatched case: [1, 2, 3]
```

## The `when` function

The `when` function exists purely for typing. When you use it gives the callback
the proper type expressed in the left-hand-side pattern:

```typescript
when(
  V('checkout', {
    type: 'checkout',
    lineItems: [V('firstLineItem', { type: 'line_item', data: __ }), __.rest],
  }),
  ({ checkout, firstLineItem }) => {
    var checkout: {
      type: 'checkout'
      id: number
      lineItems: [{
        type: 'line_item'
        id: number
        data: any
      }, any[]]
    }

    var firstLineItem: {
      type: 'line_item'
      id: number
      data: any
    }
  },
)
```

## `match` function continued

Array's are matched as tuples, the lengths have to be the same:

```typescript
match([1, 2, 3]
      when([1, 2], () => "this won't match"),
      when([1, 2, 3], () => "this will match"))
"this will match"
```

The tail of a list can be matched with `__.rest`, or it's aliases
`__.tail` or `__.tl`:

```typescript
match(
  range(50, 100),
  when([50, 51, __.rest], () => 'this will match'),
)
;('this will match')
```

Primitive types can be matched with special operators:

```typescript
const thingy: {
  data: {
    someNumber: 1
    metadata: { foobar: 'foobar' }
    someOtherProp: {}
  }
  list: [1, 2, 3]
}

match(
  thingy,
  when(
    {
      data: { someNumber: __.number, metadata: __.object },
      list: [__, __.rest],
    },
    () => 'this will match',
  ),
)
;('this will match')
```

You can capture variables and use them on the right hand side of match, if you
use `when` the callback will be typed with all variable bindings:

```typescript
const thingy: {
  meta: {
    type: 'contrived example',
    x: 1,
    y: 2,
  },
  data: {
    a: {
      b: {
        c: {
          d: {
            message: 'hello world'
            value: 42
          }
        }
      }
    }
  }
}

match(thingy,
      when({ meta: V('x'),
         data: { a: { b: { c: { d: { value: V('y') } } } } }
       }, (captures) => captures))
{
  x: {
    type: 'contrived example',
    x: 1,
    x: 2,
  }
  y: 42
}
```

Variable captures can also apply a pattern that must also match for the
case.

```typescript
import { match, __, V } from "pattern-matching"

const checkout = {
  object: "list",
  data: [
    {
      id: "li_1",
      object: "item",
      ...
    },
    {...},
    {...}
  ]
}
match(value,
      when( { object: 'list',
          data: V('data')([
            V('first')({ object: 'item' }),
            __.rest
          ])
        }, (captures) => captures ))

{
  data: [
    {
      id: "li_1",
      object: "item",
      ...
    },
    {...},
    {...}
  ]
  first: {
    id: "li_1",
    object: "item",
    ...
  },
}
```

## TODOs

- [ \] Proper type inference right-hand-side of match case
- [ \] Exhaustive type check for match cases
