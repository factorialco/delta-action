  const delta = rubocop(diff, mainData, branchData, '')
  const delta = eslint(diff, mainData, branchData)
  const delta = semgrep(diff, mainData, branchData, '')