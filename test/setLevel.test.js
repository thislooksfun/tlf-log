"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
var l   = require("../lib/levels.js");
// Ignore all logging until the spy is set up.


describe("log._setLevel", function() {
  var ftl;
  var trce;
  
  before(function() {
    simple.mock(process, "exit", function() { throw Error("process.exit : " + arguments[0]); });
    log.__set__("process", process);
  });
  
  beforeEach(function() {
    // Clean up
    log.__set__("console", { log: function() {} });
    
    ftl = simple.mock(log, "fatal");
    trce = simple.mock(log, "trace");
  });
  
  after(function() {
    simple.restore();
  });
  
  it("should log to info on setting level", function() {
    log._setLevel("debug");
    expect(trce.callCount).to.equal(1);
    expect(trce.calls[0].args).to.deep.equal(["Set log level to 'debug'."]);
  });
  
  it("should set l.level", function() {
    log._setLevel("debug");
    expect(l.level).to.equal(4);
  });
  
  it("should only print if the level is lower", function() {
    let cnslLg = simple.spy();
    log.__set__("console", {log: cnslLg});
    log._setLevel("info");
    
    log.debug("dbg");
    log.trace("trce");
    log.info("inf");
    log.warn("wrn");
    expect(() => log.fatal("ftl")).to.throw("process.exit : 1");
    
    expect(cnslLg.callCount).to.equal(3);
    expect(cnslLg.calls[0].args).to.deep.equal(["[INFO] ", "inf"]);
    expect(cnslLg.calls[1].args).to.deep.equal(["[WARN] ", "wrn"]);
    expect(cnslLg.calls[2].args).to.deep.equal(["[FATAL]", "ftl"]);
  });
  
  it("should set l.level to -1 on 'silent'", function() {
    log._setLevel("silent");
    expect(l.level).to.equal(-1);
  });
  
  it("should error on invalid level", function() {
    var before = l.level;
    expect(() => log._setLevel("invalid")).to.throw("process.exit : 1");
    expect(l.level).to.equal(before);
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Unknown log level 'invalid'\nValid log levels are:\n  fatal, error, warn, info, trace, debug, and silent."]);
  });
  
  it("should error on non-string argument", function() {
    var before = l.level;
    
    expect(() => log._setLevel()).to.throw("process.exit : 1");
    expect(() => log._setLevel(null)).to.throw("process.exit : 1");
    expect(() => log._setLevel(1)).to.throw("process.exit : 1");
    expect(() => log._setLevel([])).to.throw("process.exit : 1");
    expect(() => log._setLevel({})).to.throw("process.exit : 1");
    
    expect(l.level).to.equal(before);
    
    expect(ftl.callCount).to.equal(5);
    expect(ftl.calls[0].args).to.deep.equal(["log._setLevel must be called with a string."]);
    expect(ftl.calls[1].args).to.deep.equal(["log._setLevel must be called with a string."]);
    expect(ftl.calls[2].args).to.deep.equal(["log._setLevel must be called with a string."]);
    expect(ftl.calls[3].args).to.deep.equal(["log._setLevel must be called with a string."]);
    expect(ftl.calls[4].args).to.deep.equal(["log._setLevel must be called with a string."]);
  });
  
});
