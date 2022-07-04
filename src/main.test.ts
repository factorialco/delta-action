import * as fs from 'fs'
import {expect, test} from '@jest/globals'
import diffParser from 'git-diff-parser'

  const files = ['foo.rb']
  const diff = diffParser(
    `diff --git a/foo.rb b/foo.rb\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = rubocop(files, diff, mainData, branchData)

  expect(delta).toStrictEqual([
    {file: 'foo.rb', main: 2, branch: 1, offenses: []}
  ])
  const files = ['bar.js']
  const diff = diffParser(
    `diff --git a/bar.js b/bar.js\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = eslint(files, diff, mainData, branchData)

  expect(delta).toStrictEqual([
    {file: 'bar.js', main: 2, branch: 1, offenses: []}
  ])
  const files = ['baz.ts']
  const diff = diffParser(
    `diff --git a/baz.ts b/baz.ts\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const delta = semgrep(files, diff, mainData, branchData)

  expect(delta).toStrictEqual([
    {file: 'baz.ts', main: 2, branch: 1, offenses: []}
  ])