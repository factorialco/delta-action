import diffParser from 'git-diff-parser'

import {DeltaResult, DeltaOffense} from './main'
import {intersection, lines, notEmpty} from './utils'

interface Rubocop {
  metadata: Metadata
  files: OffendedFile[]
  summary: Summary
}

interface Metadata {
  rubocop_version: string
  ruby_engine: string
  ruby_version: string
  ruby_patchlevel: string
  ruby_platform: string
}

interface OffendedFile {
  path: string
  offenses: Offense[]
}

interface Offense {
  severity: string
  message: string
  cop_name: string
  corrected: boolean
  correctable: boolean
  location: Location
}

interface Location {
  start_line: number
  start_column: number
  last_line: number
  last_column: number
  length: number
  line: number
  column: number
}

interface Summary {
  offense_count: number
  target_file_count: number
  inspected_file_count: number
}

export function rubocop(
  files: string[],
  diff: diffParser.Result,
  mainData: string,
  branchData: string
): DeltaResult[] {
  const rubocopInMain: Rubocop = JSON.parse(mainData)
  const rubocopInBranch: Rubocop = JSON.parse(branchData)

  const diffLines = lines(diff)

  const results: DeltaResult[] = files.map((file: string) => {
    const fileInMain = rubocopInMain.files.find(f => f.path === file)
    const fileInBranch = rubocopInBranch.files.find(f => f.path === file)
    const main = fileInMain?.offenses.length ?? 0
    const branch = fileInBranch?.offenses.length ?? 0

    let offenses: DeltaOffense[] = []

    if (main < branch) {
      const rubocopLines =
        fileInBranch?.offenses.map(offense => offense.location.line) ?? []

      const shared = intersection(diffLines, [...new Set(rubocopLines)])

      offenses = shared
        .map(line => {
          const message = fileInBranch?.offenses.find(
            offense => offense.location.line === line
          )

          if (!message) return null

          return {
            file,
            title: message.cop_name,
            message: message.message,
            startLine: message.location.line,
            endLine: message.location.last_line,
            startColumn: message.location.start_column,
            endColumn: message.location.last_column
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
