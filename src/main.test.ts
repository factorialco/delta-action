import {rubocop} from './rubocop'
import {eslint} from './eslint'
import {semgrep} from './semgrep'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import {expect, test} from '@jest/globals'

test('return rubocop results', () => {
  const mainData = fs.readFileSync('fixtures/rubocop/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/rubocop/branch.json', 'utf8')
  const delta = rubocop(mainData, branchData)

  expect(delta).toStrictEqual([{file: 'foo.rb', main: 2, branch: 1}])
})

test('return eslint results', () => {
  const mainData = fs.readFileSync('fixtures/eslint/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/eslint/branch.json', 'utf8')
  const delta = eslint(mainData, branchData)

  expect(delta).toStrictEqual([{file: 'bar.js', main: 2, branch: 1}])
})

test('return semgrep results', () => {
  const mainData = fs.readFileSync('fixtures/semgrep/main.json', 'utf8')
  const branchData = fs.readFileSync('fixtures/semgrep/branch.json', 'utf8')
  const delta = semgrep(mainData, branchData)

  expect(delta).toStrictEqual([{file: 'baz.ts', main: 2, branch: 1}])
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_ENGINE'] = 'rubocop'
  process.env['INPUT_MAIN'] = 'fixtures/rubocop/main.json'
  process.env['INPUT_BRANCH'] = 'fixtures/rubocop/branch.json'
  process.env['GITHUB_STEP_SUMMARY'] = '/dev/null'

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
