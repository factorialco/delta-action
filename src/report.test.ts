import diffParser from 'git-diff-parser'

import {report} from './report'
  const files = ['foo.rb']
  const diff = diffParser(
    `diff --git a/foo.rb b/foo.rb\nnew file mode 100644\nindex 0000000..e69de29`
  )
  const results = rubocop(files, diff, mainData, branchData)
    ['Summary:', '2', '1', '🌿 Better World!']
    table,
    offenses: []