import { Suite } from 'benchmark'

import * as ts from 'ts-pattern'
import { __, match, V } from '../src/index'

defsuite((suite) => {
  type Data = { type: 'text'; content: string } | { type: 'img'; src: string }

  type Result = { type: 'ok'; data: Data } | { type: 'error'; error: Error }

  const results: Result[] = [
    { type: 'ok', data: { type: 'img', src: 'mock-src' } },
    { type: 'error', error: new Error() },
    { type: 'ok', data: { type: 'text', content: 'hello world' } },
  ]

  for (const result of results) {
    {
      suite.add('@dkendal/match', () => {
        match(
          result,
          [{ type: 'error' }, () => `<p>Oups! An error occured</p>`],
          [
            V('res', { type: 'ok', data: { type: 'text' } }),
            ({ res }) => `<p>${res.data.content}</p>`,
          ],
          [
            { type: 'ok', data: { type: 'img', src: V('src') } },
            ({ src }) => `<img src=${src} />`,
          ],
        )
      })

      suite.add('ts-pattern', () => {
        ts
          .match(result)
          .with({ type: 'error' }, (_res) => `<p>Oups! An error occured</p>`)
          .with(
            { type: 'ok', data: { type: 'text' } },
            (res) => `<p>${res.data.content}</p>`,
          )
          .with(
            { type: 'ok', data: { type: 'img', src: ts.select() } },
            (src) => `<img src=${src} />`,
          )
          .exhaustive()
      })
    }
  }
})

// defsuite((suite) => {
//   const value: unknown = [];

//   suite.add("match", () => {
//     match(value, [[], () => "empty"], [[V("hd"), __.tail], ({ hd }) => hd]);
//   });

//   suite.add("explicit", () => {
//     if (typeof value === "object" && value instanceof Array) {
//       if (value === []) return "empty";
//       else return value[0];
//     }
//   });
// });

function defsuite(callback: (suite: Suite) => void) {
  const suite = new Suite()

  callback(suite)

  suite.on('cycle', function(event: any) {
    console.log(String(event.target))
  })

  suite.on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })

  suite.run()
}
