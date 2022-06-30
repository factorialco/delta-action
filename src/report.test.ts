import {report} from './report'
import * as fs from 'fs'
import {expect, test} from '@jest/globals'
import {rubocop} from './rubocop'

test('return rubocop results', () => {
  const mainData = fs.readFileSync('fixtures/rubocop/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/rubocop/branch.json', 'utf8')
  const results = rubocop(mainData, branchData)
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
    table
  })
})
