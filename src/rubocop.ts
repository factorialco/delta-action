import {Result} from './main'

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

export function rubocop(mainData: string, branchData: string): Result[] {
  const main: Rubocop = JSON.parse(mainData)
  const branch: Rubocop = JSON.parse(branchData)

  const results: Result[] = branch.files.reduce(
    (memo: Result[], file: OffendedFile) => {
      const fileInMain = main.files.find(f => f.path === file.path)

      memo.push({
        file: file.path,
        main: fileInMain?.offenses.length ?? 0,
        branch: file?.offenses.length ?? 0
      })

      return memo
    },
    []
  )

  return results
}
