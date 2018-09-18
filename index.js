'use strict';

const fs = require('fs');
const jsdiff = require('diff');
const assert = require('assert');

const LF = '\n';
class LogFileDiffer {
  constructor(logFile) {
    this.logFile = logFile;
  }

  setupBaseline() {
    this.baseline = this.readLog();
  }

  diffLines() {
    // baseline can be empty string
    if (typeof this.baseline === 'undefined') {
      throw new Error('baseline should be set first');
    }
    const cur = this.readLog();
    const lines = jsdiff.diffLines(this.baseline, cur);
    assert(lines && lines[1].added);
    delete this.baseline;
    return lines[1].value.trim(LF).split(LF).map(ln => {
      return JSON.parse(ln);
    });
  }

  readLog() {
    return fs.readFileSync(this.logFile).toString(); // feeds jsdiff with string
  }
}

module.exports = LogFileDiffer;
