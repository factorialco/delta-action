import {Result} from './main'

interface Semgrep {
  errors: SemgrepError[]
  paths: SemgrepPath
  results: SemgrepOffense[]
}

type SemgrepError = unknown
type SemgrepPath = unknown
type Position = unknown
type Extra = unknown

interface SemgrepOffense {
  path: string
  check_id: string
  start: Position
  end: Position
  extra: Extra
}

export function semgrep(mainData: string, branchData: string): Result[] {
  const main: Semgrep = JSON.parse(mainData)
  const branch: Semgrep = JSON.parse(branchData)

  const filesNames = branch.results.reduce(
    (memo: string[], offense: SemgrepOffense) => {
      memo.push(offense.path)

      return memo
    },
    []
  )

  const files = [...new Set(filesNames)]

  const results: Result[] = files.reduce((memo: Result[], fileName: string) => {
    const file = branch.results.filter(o => o.path === fileName)
    const fileInMain = main.results.filter(o => o.path === fileName)

    memo.push({
      file: fileName,
      main: fileInMain.length ?? 0,
      branch: file.length ?? 0
    })

    return memo
  }, [])

  return results
}
