import {DeltaOffense, DeltaResult} from './main'

type BetterWorldSummary = 'neutral' | 'worse' | 'better'

const betterWorldCopy = (type: BetterWorldSummary): string => {
  if (type === 'neutral') return '🧘 Neutral'
  if (type === 'worse') return '🔥 Worse'
  if (type === 'better') return '🌿 Better World!'

  throw new Error('Unknown type')
}

// REVIEW: Check if this is the best strategy. It works for now.
const betterWorld = (main: number, branch: number): BetterWorldSummary => {
  if (branch === main) return 'neutral'
  if (branch > main) return 'worse'

  return 'better'
}

type GithubTable = (string[] | {data: string; header: boolean}[])[]

type Report = {
  aggregation: BetterWorldSummary
  table: GithubTable
  offenses: DeltaOffense[]
}

export function report(results: DeltaResult[]): Report {
  const tableResults = results.map(result => {
    return [
      result.file,
      String(result.main),
      String(result.branch),
      betterWorldCopy(betterWorld(result.main, result.branch))
    ]
  })

  const summary: DeltaResult = results.reduce(
    (memo, result) => {
      return {
        file: '',
        main: memo.main + result.main,
        branch: memo.branch + result.branch,
        offenses: [...memo.offenses, ...result.offenses]
      }
    },
    {file: '', main: 0, branch: 0, offenses: []}
  )

  const aggregation = betterWorld(summary.main, summary.branch)
  const offenses = summary.offenses

  const tableSummary = [
    'Summary:',
    String(summary.main),
    String(summary.branch),
    betterWorldCopy(aggregation)
  ]

  const headers = [
    {data: 'File', header: true},
    {data: 'Main branch', header: true},
    {data: 'Branch', header: true},
    {data: 'Result', header: true}
  ]

  const table = [headers, ...tableResults, tableSummary]

  return {
    aggregation,
    table,
    offenses
  }
}
