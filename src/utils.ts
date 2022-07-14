import diffParser from 'git-diff-parser'

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}

export const lines = (diff: diffParser.Result, diffFile: string): number[] => {
  const items = diff.commits.flatMap(commit => {
    return commit.files.flatMap(file => {
      if (diffFile !== file.name) return []

      return file.lines
        .map(line => (line.type !== 'deleted' ? line.ln1 : null))
        .filter(notEmpty)
    })
  })

  return [...new Set(items)]
}

export const intersection = (array1: number[], array2: number[]): number[] =>
  array1.filter(value => array2.includes(value))
