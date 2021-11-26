import { __ } from 'src'
import { Capture, ExpandCapture } from 'src/types'
import { A } from 'ts-toolbelt'
import { check, checks, Pass } from 'ts-toolbelt/out/Test'
import { Data, Result, Success, Text } from './test-helper'

checks([
  check<
    ExpandCapture<
      { type: 'ok'; data: { type: 'img'; src: Capture<'src', __> } }
    >,
    { type: 'ok'; data: { type: 'img'; src: any } },
    Pass
  >(),
])
