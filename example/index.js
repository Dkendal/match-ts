import { __, match, V, when } from '@dkendal/match'

match(
  1,
  when(__, () => {
    console.log('hello')
  }),
)
