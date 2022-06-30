import * as core from '@actions/core'
import * as fs from 'fs'

import {rubocop} from './rubocop'
import {eslint} from './eslint'
import {semgrep} from './semgrep'
import {report} from './report'

export interface Result {
  file: string
  main: number
  branch: number
}

async function run(): Promise<void> {
  try {
    const engine: string = core.getInput('engine')
    const main: string = core.getInput('main')
    const branch: string = core.getInput('branch')

    core.info(
      `🔎 Executing delta for '${engine}' between '${main}' and '${branch}'...`
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
      results = rubocop(mainData, branchData)
    } else if (engine === 'eslint') {
      results = eslint(mainData, branchData)
    } else if (engine === 'semgrep') {
      results = semgrep(mainData, branchData)
    } else {
      throw new Error(`Unknown engine '${engine}'`)
    }

    const {aggregation, table} = report(results)

    await core.summary.addHeading(`${engine} results`).addTable(table).write()

    if (aggregation === 'worse') {
      core.setFailed('🔥 The world is getting worse due to this pull request!')
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
