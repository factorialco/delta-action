import * as fs from 'fs'
import {expect, test} from '@jest/globals'
import diffParser from 'git-diff-parser'

import {rubocop} from './rubocop'
import {eslint} from './eslint'
import {semgrep} from './semgrep'

test('return rubocop results', () => {
  const mainData = fs.readFileSync('fixtures/rubocop/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/rubocop/branch.json', 'utf8')
  const diff = diffParser(
    `diff --git a/foo.rb b/foo.rb\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = rubocop(diff, mainData, branchData, '')

  expect(delta).toStrictEqual([
    {file: 'foo.rb', main: 2, branch: 1, offenses: []}
  ])
})

test('return eslint results', () => {
  const mainData = fs.readFileSync('fixtures/eslint/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/eslint/branch.json', 'utf8')
  const diff = diffParser(
    `diff --git a/bar.js b/bar.js\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = eslint(diff, mainData, branchData, '')

  expect(delta).toStrictEqual([
    {file: 'bar.js', main: 2, branch: 1, offenses: []}
  ])
})

test('return semgrep results', () => {
  const mainData = fs.readFileSync('fixtures/semgrep/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/semgrep/branch.json', 'utf8')
  const diff = diffParser(
    `diff --git a/baz.ts b/baz.ts\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = semgrep(diff, mainData, branchData, '')

  expect(delta).toStrictEqual([
    {file: 'baz.ts', main: 2, branch: 1, offenses: []}
  ])
})
