import * as fs from 'fs'
import {expect, test} from '@jest/globals'
import diffParser from 'git-diff-parser'

import {report} from './report'
import {rubocop} from './rubocop'

test('return rubocop results', () => {
  const mainData = fs.readFileSync('fixtures/rubocop/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/rubocop/branch.json', 'utf8')
  const diff = diffParser(
    `diff --git a/foo.rb b/foo.rb\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const results = rubocop(diff, mainData, branchData, '')
  const delta = report(results)

  const table = [
    [
      {data: 'File', header: true},
      {data: 'Main branch', header: true},
      {data: 'Branch', header: true},
      {data: 'Result', header: true}
    ],
    ['foo.rb', '2', '1', '🌿 Better World!'],
    ['Summary:', '2', '1', '🌿 Better World!']
  ]

  expect(delta).toStrictEqual({
    aggregation: 'better',
    table,
    offenses: [],
    analyzed: 1
  })
})
