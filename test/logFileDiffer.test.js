'use strict';

require('should');
const fs = require('fs');
const path = require('path');
const bunyan = require('bunyan');
const LogFileDiffer = require('../index');


describe('LogFileDiffer', () => {
  const filePath = path.resolve(__dirname, '../foo.log');
  let logger = null;
  const logDiffer = new LogFileDiffer(filePath);
  before(() => {
    // remove old log file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    };
  });
  before((done) => {
    // init new log file
    logger = bunyan.createLogger({
      name: 'foo',
      streams: [{
        path: filePath,
      }]
    });
    logger.info('init');
    setTimeout(() => {
      done();
    }, 1000);
  });

  it('should get differences between unexisted file and written file', () => {
    logDiffer.setupBaseline();
    logger.info('hello');
    const diff = logDiffer.diffLines();
    diff.length.should.equal(1);
    diff[0].should.containEql({name: 'foo', msg: 'hello'});
  });

  it('should get differences between last baseline in file and now', (done) => {
    logDiffer.setupBaseline();
    logger.info('hello again');
    logger.info({ test: 'test' });
    setTimeout(() => {
      const diff = logDiffer.diffLines();
      diff.length.should.equal(2);
      diff[0].should.containEql({ name: 'foo', msg: 'hello again' });
      diff[1].should.containEql({ name: 'foo', test: 'test' });
      done();
    }, 1000);
  });
});
