/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
const utils_1 = __nccwpck_require__(918);
const cleanName = (name) => {
    return name.replace(/\/runner\/_work\/([^/]*)\/([^/]*)\//, ''); // Remove runner context
};
function eslint(files, diff, mainData, branchData) {
    const eslintInMain = JSON.parse(mainData);
    const eslintInBranch = JSON.parse(branchData);
    const diffLines = (0, utils_1.lines)(diff);
    const results = files.map((file) => {
        var _a, _b, _c;
        const fileInMain = eslintInMain.find(f => f.filePath === cleanName(file));
        const fileInBranch = eslintInBranch.find(f => f.filePath === cleanName(file));
        const main = (_a = fileInMain === null || fileInMain === void 0 ? void 0 : fileInMain.messages.length) !== null && _a !== void 0 ? _a : 0;
        const branch = (_b = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.messages.length) !== null && _b !== void 0 ? _b : 0;
        let offenses = [];
        if (main < branch) {
            const eslintLines = (_c = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.messages.map(message => message.line)) !== null && _c !== void 0 ? _c : [];
            const shared = (0, utils_1.intersection)(diffLines, eslintLines);
            offenses = shared
                .map(line => {
                const message = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.messages.find(m => m.line === line);
                if (!message)
                    return null;
                return {
                    file,
                    title: message.ruleId,
                    message: message.message,
                    startLine: message.line,
                    endLine: message.endLine,
                    startColumn: message.column,
                    endColumn: message.endColumn
                };
            })
                .filter(utils_1.notEmpty);
        }
        return {
            file,
            main,
            branch,
            offenses
        };
    });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.run = void 0;
const child_process_1 = __nccwpck_require__(129);
const git_diff_parser_1 = __importDefault(__nccwpck_require__(360));
            const headRef = core.getInput('head_ref');
            const forkpoint = core.getInput('forkpoint');
            core.info(`📝 Checking file differences between '${headRef}' and '${forkpoint}'...`);
            const diff = (0, git_diff_parser_1.default)((0, child_process_1.execSync)(`git diff ${forkpoint}..origin/${headRef}`));
            const files = diff.commits.flatMap(commit => commit.files.map(file => file.name));
                results = (0, rubocop_1.rubocop)(files, diff, mainData, branchData);
                results = (0, eslint_1.eslint)(files, diff, mainData, branchData);
                results = (0, semgrep_1.semgrep)(files, diff, mainData, branchData);
            const { aggregation, table, offenses } = (0, report_1.report)(results);
                for (const offense of offenses) {
                    core.warning(offense.message, {
                        file: offense.file,
                        title: offense.title,
                        startLine: offense.startLine,
                        endLine: offense.endLine,
                        startColumn: offense.startColumn,
                        endColumn: offense.endColumn
                    });
                }
exports.run = run;
        return '🧘 Neutral';
            branch: memo.branch + result.branch,
            offenses: [...memo.offenses, ...result.offenses]
    }, { file: '', main: 0, branch: 0, offenses: [] });
    const offenses = summary.offenses;
        'Summary:',
        table,
        offenses
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
const utils_1 = __nccwpck_require__(918);
function rubocop(files, diff, mainData, branchData) {
    const rubocopInMain = JSON.parse(mainData);
    const rubocopInBranch = JSON.parse(branchData);
    const diffLines = (0, utils_1.lines)(diff);
    const results = files.map((file) => {
        var _a, _b, _c;
        const fileInMain = rubocopInMain.files.find(f => f.path === file);
        const fileInBranch = rubocopInBranch.files.find(f => f.path === file);
        const main = (_a = fileInMain === null || fileInMain === void 0 ? void 0 : fileInMain.offenses.length) !== null && _a !== void 0 ? _a : 0;
        const branch = (_b = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.offenses.length) !== null && _b !== void 0 ? _b : 0;
        let offenses = [];
        if (main < branch) {
            const rubocopLines = (_c = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.offenses.map(offense => offense.location.line)) !== null && _c !== void 0 ? _c : [];
            const shared = (0, utils_1.intersection)(diffLines, rubocopLines);
            offenses = shared
                .map(line => {
                const message = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.offenses.find(offense => offense.location.line === line);
                if (!message)
                    return null;
                return {
                    file,
                    title: message.cop_name,
                    message: message.message,
                    startLine: message.location.line,
                    endLine: message.location.last_line,
                    startColumn: message.location.start_column,
                    endColumn: message.location.last_column
                };
            })
                .filter(utils_1.notEmpty);
        }
        return {
            file,
            main,
            branch,
            offenses
        };
    });
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
const utils_1 = __nccwpck_require__(918);
function semgrep(files, diff, mainData, branchData) {
    const semgrepInMain = JSON.parse(mainData);
    const semgrepInBranch = JSON.parse(branchData);
    const diffLines = (0, utils_1.lines)(diff);
    const results = files.map((file) => {
        var _a, _b, _c;
        const fileInMain = semgrepInMain.results.filter(o => o.path === file);
        const fileInBranch = semgrepInBranch.results.filter(o => o.path === file);
        const main = (_a = fileInMain.length) !== null && _a !== void 0 ? _a : 0;
        const branch = (_b = fileInBranch.length) !== null && _b !== void 0 ? _b : 0;
        let offenses = [];
        if (main < branch) {
            const semgrepLines = (_c = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.map(offense => offense.start.line)) !== null && _c !== void 0 ? _c : [];
            const shared = (0, utils_1.intersection)(diffLines, semgrepLines);
            offenses = shared
                .map(line => {
                const message = fileInBranch === null || fileInBranch === void 0 ? void 0 : fileInBranch.find(offense => offense.start.line === line);
                if (!message)
                    return null;
                return {
                    file,
                    title: message.check_id,
                    message: message.extra.message,
                    startLine: message.start.line,
                    endLine: message.end.line,
                    startColumn: message.start.col,
                    endColumn: message.end.col
                };
            })
                .filter(utils_1.notEmpty);
        }
        return {
            file,
            main,
            branch,
            offenses
        };
    });
/***/ }),

/***/ 918:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.intersection = exports.lines = exports.notEmpty = void 0;
function notEmpty(value) {
    return value !== null && value !== undefined;
}
exports.notEmpty = notEmpty;
const lines = (diff) => {
    return diff.commits.flatMap(commit => {
        return commit.files.flatMap(file => {
            return file.lines
                .map(line => (line.type !== 'deleted' ? line.ln1 : null))
                .filter(notEmpty);
        });
    });
};
exports.lines = lines;
const intersection = (array1, array2) => array1.filter(value => array2.includes(value));
exports.intersection = intersection;


/***/ }),

/***/ 360:
/***/ ((module, exports, __nccwpck_require__) => {

module.exports = exports = __nccwpck_require__(814);

/***/ }),

/***/ 814:
/***/ ((module, exports) => {

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Parser {
  constructor(lines) {
    this.lines = lines;
    this.ln = 0;

    this.result = {
      detailed: false,
      commits: []
    };

    while (this.ln < this.lines.length) {
      const line = this.lines[this.ln];
      // Metadata?
      if (line.indexOf("From ") === 0) {
        this.parseMetadata();
      } else if (line.indexOf("diff ") === 0) {
        this.parseDiff();
      } else {
        this.ln++;
      }
    }

    if (this.currentCommit) { this.result.commits.push(this.currentCommit); }
  }

  parseMetadata() {
    this.result.detailed = true;
    if (this.currentCommit) { this.result.commits.push(this.currentCommit); }

    this.currentCommit =
      {files: []};

    let isGettingMessage = false;

    return (() => {
      const result = [];
      while (this.ln < this.lines.length) {
        var matches;
        const line = this.lines[this.ln];

        if (line.indexOf("diff ") === 0) { break; }

        if (isGettingMessage) {
          if (line.indexOf("---") === 0) {
            isGettingMessage = false;
          } else {
            this.currentCommit.message += line.indexOf(" ") === 0 ? line : `\n${line}`;
          }

        } else if (line.indexOf("From ") === 0) {
          matches = line.match(/^From\s([a-z|0-9]*)\s(\w.*)$/);

          if (matches.length === 3) {
            this.currentCommit.sha  = matches[1];
            this.currentCommit.date = new Date(matches[2]);
          }

        } else if (line.indexOf("From: ") === 0) {
          matches = line.match(/^From:\s(.*)\s\<(\w.*)\>$/);

          if (matches.length === 3) {
            this.currentCommit.author  = matches[1];
            this.currentCommit.email = matches[2];
          } else {
            console.log(line);
            exit();
          }

        } else if (line.indexOf("Date: ") === 0) {
          matches = line.match(/^Date:\s(\w.*)$/);

          if (matches.length === 2) {
            this.currentCommit.date  = new Date(matches[1]);
          }

        } else if (line.indexOf("Subject: ") === 0) {
          this.currentCommit.message = line.substr(9);
          isGettingMessage = true;
        }

        result.push(this.ln++);
      }
      return result;
    })();
  }

  parseDiff() {
    if (!this.currentCommit) { this.currentCommit =
      {files: []}; }

    const parseFile = function(s) {
      s = s.trim();
      if (s[0] === '"') { s = s.slice(1, -1); }
      // ignore possible time stamp
      const t = (/\d{4}-\d\d-\d\d\s\d\d:\d\d:\d\d(.\d+)?\s(\+|-)\d\d\d\d/).exec(s);
      if (t) { s = s.substring(0, t.index).trim(); }
      // ignore git prefixes a/ or b/
      if (s.match((/^(a|b)\//))) { return s.substr(2); } else { return s; }
    };

    const file = {
      deleted: false,
      added: false,
      renamed: false,
      binary: false,
      lines: []
    };

    let firstRun = true;
    let lineBreak = false;

    let lnDel = 0;
    let lnAdd = 0;
    const noeol = "\\ No newline at end of file";

    while (this.ln < this.lines.length) {
      var matches;
      const line = this.lines[this.ln];
      
      if (((line.indexOf("diff ") === 0) && !firstRun) || (this.result.detailed && (line === "-- "))) {
        break;
      }

      if (line.indexOf("diff ") === 0) {
        // Git diff?
        matches = line.match(/^diff\s\-\-git\s("a\/.*"|a\/.*)\s("b\/.*"|b\/.*)$/);

        if (matches.length === 3) {
          file.from = parseFile(matches[1]);
          file.to   = parseFile(matches[2]);
        }

      } else if (line.indexOf("+++ ") === 0) {
        if (!file.to) { file.to = parseFile(line.substr(4)); }

      } else if (line.indexOf("--- ") === 0) {
        if (!file.from) { file.from = parseFile(line.substr(4)); }

      } else if (line === "GIT binary patch") {
        file.binary = true;
        break;

      } else if (/^deleted file mode \d+$/.test(line)) {
        file.deleted = true;

      } else if (/^new file mode \d+$/.test(line)) {
        file.added = true;

      } else if (/^new file mode \d+$/.test(line)) {
        file.added = true;

      } else if (/^index\s[\da-zA-Z]+\.\.[\da-zA-Z]+(\s(\d+))?$/.test(line)) {
        file.index = line.split(' ').slice(1);

      } else if (/^Binary\sfiles\s(.*)differ$/.test(line)) {
        file.binary = true;
        break;

      } else if (/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/.test(line)) {
        matches = line.match(/^@@\s+\-(\d+),(\d+)\s+\+(\d+),(\d+)\s@@/);
        lineBreak = file.lines.length !== 0;
        lnDel   = +matches[1];
        lnAdd   = +matches[3];

      } else {
        if (/^-/.test(line)) {
          file.lines.push({
            type: "deleted",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnDel++ : undefined
          });
        } else if (/^\+/.test(line)) {
          file.lines.push({
            type: "added",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnAdd++ : undefined
          });
        } else {
          if (line !== noeol) { file.lines.push({
            type: "normal",
            break: lineBreak && !file.added,
            text: line.substr(1),
            ln1:  line !== noeol ? lnDel++ : undefined,
            ln2:  line !== noeol ? lnAdd++ : undefined
          }); }
        }

        lineBreak = false;
      }


      firstRun = false;
      this.ln++;
    }

    if (file.from === "/dev/null") {
      file.added = true;
    } else {
      file.renamed = !file.added && !file.deleted && (file.to !== file.from);
      if (file.renamed) { file.oldName = file.from; }
    }

    file.name = file.to;

    // Let's just assume it's binary if this is the case
    if ((file.lines.length === 0) && !this.result.detailed) {
      file.binary = true;
    }
    
    delete file.from;
    delete file.to;

    return this.currentCommit.files.push(file);
  }
}


module.exports = (exports = function(input) {
  const result = {};
  if (input instanceof Buffer) { input  = input.toString(); }
  const lines  = input.split("\n");

  return (new Parser(lines)).result;
});
  

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),
