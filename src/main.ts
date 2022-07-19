import * as core from '@actions/core'
import * as fs from 'fs'
import {spawn} from 'child_process'
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

const execShellCommand = async (
  cmd: string,
  args: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let output = ''
    const child = spawn(cmd, args)

    child.stdout.on('data', (data: string) => {
      output = output.concat(data)
    })

    child.on('error', (error: Error) => {
      return reject(error)
    })

    child.on('close', () => {
      return resolve(output)
    })
  })
}

export async function run(): Promise<void> {
  try {
    const engine = core.getInput('engine')
    const main = core.getInput('main')
    const branch = core.getInput('branch')
    const headRef = core.getInput('head_ref')
    const forkpoint = core.getInput('forkpoint')
    const monorepoPrefix = core.getInput('monorepo_prefix')

    core.info(
      `🔎 Executing delta for '${engine}' between '${main}' and '${branch}'...`
    )

    core.info(
      `📝 Checking file differences between '${headRef}' and '${forkpoint}'...`
    )

    const diffOutput = await execShellCommand('git', [
      'diff',
      `${forkpoint}..origin/${headRef}`
    ])
    const diff = diffParser(diffOutput)

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
      results = rubocop(diff, mainData, branchData, monorepoPrefix)
    } else if (engine === 'eslint') {
      results = eslint(diff, mainData, branchData)
    } else if (engine === 'semgrep') {
      results = semgrep(diff, mainData, branchData, monorepoPrefix)
    } else {
      throw new Error(`Unknown engine '${engine}'`)
    }

    const {aggregation, table, offenses, analyzed} = report(results)

    await core.summary
      .addHeading(`${engine} results`)
      .addRaw(
        `This is the list of all files analyzed by ${engine} and the BetterWorld™ result of each one.\n\n`
      )
      .addRaw(
        `If the aggregation of all offenses is positive, this job will fail.\n\n`
      )
      .addTable(table)
      .addRaw(
        `${analyzed} files were analyzed in this report. If a file doesn't appear in this list it means it was irrelevant to the BetterWorld™ score.\n\n`
      )
      .write()

    if (aggregation === 'worse') {
      core.setFailed(
        '🔥 This pull request is introducing new offenses to the code base. Try to not introduce them! Review the action summary or the shown GitHub annotations.'
      )

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

      const details = offenses
        .map(offense => `${offense.file}:${offense.startLine} ${offense.title}`)
        .join('\n')

      await core.summary
        .addDetails('Offenses details:', `<pre>${details}</pre>`)
        .write()
    } else if (aggregation === 'neutral') {
      core.info('🧘 Lost an opportunity to improve this world!')
    } else if (aggregation === 'awesome') {
      core.info(
        '✨ Awesome contribution! Thank you so much putting effort to make this world a better place!'
      )
    } else {
      core.info('🌿 Thank you so much! Better World!')
    }

    core.setOutput('aggregation', aggregation)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}

run()
