import * as core from '@actions/core'
import * as fs from 'fs'
import {execSync} from 'child_process'
import diffParser from 'git-diff-parser'

import {rubocop} from './rubocop'
import {eslint} from './eslint'
import {semgrep} from './semgrep'
import {report} from './report'

export interface DeltaResult {
  file: string
  main: number
  branch: number
  offenses: DeltaOffense[]
}

export interface DeltaOffense {
  file: string
  title: string
  message: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
}

export async function run(): Promise<void> {
  try {
    const engine = core.getInput('engine')
    const main = core.getInput('main')
    const branch = core.getInput('branch')
    const headRef = core.getInput('head_ref')
    const forkpoint = core.getInput('forkpoint')

    core.info(
      `🔎 Executing delta for '${engine}' between '${main}' and '${branch}'...`
    )

    core.info(
      `📝 Checking file differences between '${headRef}' and '${forkpoint}'...`
    )

    const diff = diffParser(
      execSync(`git diff ${forkpoint}..origin/${headRef}`)
    )
    const files = diff.commits.flatMap(commit =>
      commit.files.map(file => file.name)
    )

    let mainData
    let branchData

    try {
      mainData = fs.readFileSync(main, 'utf8')
    } catch (err) {
      core.info('⚠️  Unable to find main branch file!')
      return
    }

    try {
      branchData = fs.readFileSync(branch, 'utf8')
    } catch (err) {
      core.setFailed('⛔ Unable to find branch file!')
      return
    }

    let results = []

    if (engine === 'rubocop') {
      results = rubocop(files, diff, mainData, branchData)
    } else if (engine === 'eslint') {
      results = eslint(files, diff, mainData, branchData)
    } else if (engine === 'semgrep') {
      results = semgrep(files, diff, mainData, branchData)
    } else {
      throw new Error(`Unknown engine '${engine}'`)
    }

    const {aggregation, table, offenses} = report(results)

    await core.summary.addHeading(`${engine} results`).addTable(table).write()

    if (aggregation === 'worse') {
      core.setFailed('🔥 The world is getting worse due to this pull request!')

      for (const offense of offenses) {
        core.warning(offense.message, {
          file: offense.file,
          title: offense.title,
          startLine: offense.startLine,
          endLine: offense.endLine,
          startColumn: offense.startColumn,
          endColumn: offense.endColumn
        })
      }
    } else if (aggregation === 'neutral') {
      core.info('☯️  Lost an opportunity to improve this world!')
    } else {
      core.info('🌿 Thank you so much! Better World!')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
