import {Result} from './main'

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

export function eslint(mainData: string, branchData: string): Result[] {
  const main: Eslint = JSON.parse(mainData)
  const branch: Eslint = JSON.parse(branchData)

  const results: Result[] = branch.reduce(
    (memo: Result[], file: FileOffense) => {
      const fileInMain = main.find(f => f.filePath === file.filePath)

      memo.push({
        file: cleanName(file.filePath),
        main: fileInMain?.messages.length ?? 0,
        branch: file?.messages.length ?? 0
      })

      return memo
    },
    []
  )

  return results
}
