import * as core from '@actions/core'

import diffParser from 'git-diff-parser'
import * as path from 'path'

import {DeltaResult, DeltaOffense} from './main'
import {changedFiles, intersection, lines, notEmpty} from './utils'

interface Semgrep {
  errors: SemgrepError[]
  paths: SemgrepPath
  results: SemgrepOffense[]
}

type SemgrepError = unknown
type SemgrepPath = unknown

interface SemgrepOffense {
  path: string
  check_id: string
  start: Position
  end: Position
  extra: Extra
}

type Position = {
  col: number
  line: number
  offset: number
}

type Extra = {
  is_ignored: boolean
  lines: string
  message: string
  metadata: unknown
  metavars: unknown
  severity: string
}

export function semgrep(
  diff: diffParser.Result,
  mainData: string,
  branchData: string,
  monorepoPrefix: string
): DeltaResult[] {
  const {files, renames} = changedFiles(diff)

  const semgrepInMain: Semgrep = JSON.parse(mainData)
  const semgrepInBranch: Semgrep = JSON.parse(branchData)

  core.info(`files: ${files.join(',')}`)
  core.info(`renames: ${renames}`)

  const results: DeltaResult[] = files.map((changedFile: string) => {
    core.info(`changedFile: ${changedFile}`)

    const file = path.join(monorepoPrefix, changedFile)
    core.info(`file: ${file}`)

    const fileInMain = semgrepInMain.results.filter(
      o => o.path === (renames[file] ?? file)
    )

    core.info(`semgrepInMain.results[0].path: ${semgrepInMain.results[0].path}`)

    const fileInBranch = semgrepInBranch.results.filter(o => o.path === file)

    core.info(
      `semgrepInBranch.results[0].path: ${semgrepInBranch.results[0].path}`
    )

    const main = fileInMain.length ?? 0
    const branch = fileInBranch.length ?? 0

    let offenses: DeltaOffense[] = []

    if (main < branch) {
      const diffLines = lines(diff, file)
      const semgrepLines =
        fileInBranch?.map(offense => offense.start.line) ?? []

      const shared = intersection(diffLines, [...new Set(semgrepLines)])

      offenses = shared
        .map(line => {
          const message = fileInBranch?.find(
            offense => offense.start.line === line
          )

          if (!message) return null

          return {
            file,
            title: message.check_id,
            message: message.extra.message,
            startLine: message.start.line,
            endLine: message.end.line,
            startColumn: message.start.col,
            endColumn: message.end.col
          }
        })
        .filter(notEmpty)
    }

    return {
      file,
      main,
      branch,
      offenses
    }
  })

  return results
}
