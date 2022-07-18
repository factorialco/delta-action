import * as core from '@actions/core'

import diffParser from 'git-diff-parser'
import * as path from 'path'

import {DeltaResult, DeltaOffense} from './main'
import {intersection, lines, notEmpty, changedFiles} from './utils'

type Eslint = FileOffense[]

type SuppressedMessage = unknown
type UsedDeprecatedRule = unknown
type Suggestion = unknown

interface FileOffense {
  filePath: string
  messages: Message[]
  suppressedMessages: SuppressedMessage[]
  errorCount: number
  fatalErrorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  source?: string
  usedDeprecatedRules: UsedDeprecatedRule[]
}

interface Message {
  ruleId: string
  severity: number
  message: string
  line: number
  column: number
  nodeType: string
  messageId: string
  endLine: number
  endColumn: number
  suggestions: Suggestion[]
}

const cleanName = (name: string): string => {
  return name.replace(/\/runner\/_work\/([^/]*)\/([^/]*)\//, '') // Remove runner context
}

const filterErrors = (message: Message): boolean => message.severity > 1

export function eslint(
  diff: diffParser.Result,
  mainData: string,
  branchData: string,
  monorepoPrefix: string
): DeltaResult[] {
  const {files, renames} = changedFiles(diff)

  const eslintInMain: Eslint = JSON.parse(mainData)
  const eslintInBranch: Eslint = JSON.parse(branchData)

  const results: DeltaResult[] = files.map((file: string) => {
    const fileInMain = eslintInMain.find(
      f =>
        path.join(monorepoPrefix, cleanName(f.filePath)) ===
        (renames[file] ?? file)
    )
    const fileInBranch = eslintInBranch.find(
      f => path.join(monorepoPrefix, cleanName(f.filePath)) === file
    )
    const main = fileInMain?.messages.filter(filterErrors).length ?? 0
    const branch = fileInBranch?.messages.filter(filterErrors).length ?? 0

    core.info(
      `eslintInMain.results[0].path: ${path.join(
        monorepoPrefix,
        eslintInMain[0].filePath
      )}`
    )
    core.info(
      `eslintInBranch.results[0].path: ${path.join(
        monorepoPrefix,
        eslintInBranch[0].filePath
      )}`
    )

    let offenses: DeltaOffense[] = []

    if (main < branch) {
      const diffLines = lines(diff, file)
      const eslintLines =
        fileInBranch?.messages
          .filter(filterErrors)
          .map(message => message.line) ?? []

      const shared = intersection(diffLines, [...new Set(eslintLines)])

      offenses = shared
        .map(line => {
          const message = fileInBranch?.messages.find(m => m.line === line)

          if (!message) return null

          return {
            file,
            title: message.ruleId,
            message: message.message,
            startLine: message.line,
            endLine: message.endLine,
            startColumn: message.column,
            endColumn: message.endColumn
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
