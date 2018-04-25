"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
// Ignore all logging until the spy is set up.
log._stream = { write: function() {} };

describe("log._prefix", function() {
  var stdWrite;
  beforeEach(function() {
    log._setLevel("debug");
    
    stdWrite = simple.spy();
    log._stream = {write: stdWrite};
  });
  
  afterEach(function() {
    simple.restore();
  });
  
  it("should add the given prefix", function() {
    log._prefix("> ");
    log.info("inf");
    log._deprefix();
    
    expect(stdWrite.callCount).to.equal(1);
    expect(stdWrite.calls[0].args).to.deep.equal(["[INFO]  > inf\n"]);
  });
  
  it("should properly stack prefixes", function() {
    log._prefix("1> ");
    log._prefix("2> ");
    log.info("inf");
    log._deprefix();
    log._deprefix();
    
    expect(stdWrite.callCount).to.equal(1);
    expect(stdWrite.calls[0].args).to.deep.equal(["[INFO]  1> 2> inf\n"]);
  });
  
  it("should properly remove prefixes", function() {
    log._prefix("1> ");
    log._prefix("2> ");
    log._prefix("3> ");
    log._deprefix();
    log.info("inf");
    log._deprefix();
    log._deprefix();
    
    expect(stdWrite.callCount).to.equal(1);
    expect(stdWrite.calls[0].args).to.deep.equal(["[INFO]  1> 2> inf\n"]);
  });
  
  it("should prefix multiple lines", function() {
    log._prefix("> ");
    log.info("inf\nand again");
    log._deprefix();
    
    expect(stdWrite.callCount).to.equal(1);
    expect(stdWrite.calls[0].args).to.deep.equal(["[INFO]  > inf\n    >>> > and again\n"]);
  });
});
