"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
var l   = require("../lib/levels.js");
// Ignore all logging until the spy is set up.


describe("log._setLevel", function() {
  var ftl;
  
  before(function() {
    simple.mock(process, "exit", function() { throw Error("process.exit : " + arguments[0]); });
    log.__set__("process", process);
  });
  
  beforeEach(function() {
    // Clean up
    log.__set__("console", { log: function() {} });
    
    ftl = simple.mock(log, "fatal");
  });
  
  after(function() {
    simple.restore();
  });
  
  it("should error on non-string name", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel()).to.throw("process.exit : 1");
    expect(() => log._addLevel(null)).to.throw("process.exit : 1");
    expect(() => log._addLevel(1)).to.throw("process.exit : 1");
    expect(() => log._addLevel([])).to.throw("process.exit : 1");
    expect(() => log._addLevel({})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(5);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'undefined', name must be a string."]);
    expect(ftl.calls[1].args).to.deep.equal(["Can't add log level 'null', name must be a string."]);
    expect(ftl.calls[2].args).to.deep.equal(["Can't add log level '1', name must be a string."]);
    expect(ftl.calls[3].args).to.deep.equal(["Can't add log level '', name must be a string."]);
    expect(ftl.calls[4].args).to.deep.equal(["Can't add log level '[object Object]', name must be a string."]);
  });
  
  it("should error on an empty string name", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("")).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level, name must be a non-empty string."]);
  });
  
  it("should error on a name that starts with '_'", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("_invalid")).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level '_invalid', name must not start with '_'."]);
  });
  
  it("should error trying to add 'silent'", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("silent")).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level, 'silent' is reserved."]);
  });
  
  it("should error on adding a duplicate level", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("info")).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'info', level already exists."]);
  });
  
  it("should error if both 'after' and 'before' are set", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("new", {before: "", after: ""})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'new': both 'after' and 'before' are set."]);
  });
  
  it("shouldn't insert after 'debug'", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("new", {after: "debug"})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'new' after 'debug'. Debug must always be the last level."]);
  });
  
  it("shouldn't insert before 'fatal'", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("new", {before: "fatal"})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'new' before 'fatal'. Fatal must always be the first level."]);
  });
  
  it("should error if the 'after' value is invalid", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("new", {after: "missing"})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'new' after 'missing', key not found."]);
  });
  
  it("should error if the 'before' value is invalid", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("new", {before: "missing"})).to.throw("process.exit : 1");
    expect(l.names().length).to.equal(beforeNameLen);
    
    expect(ftl.callCount).to.equal(1);
    expect(ftl.calls[0].args).to.deep.equal(["Can't add log level 'new' before 'missing', key not found."]);
  });
  
  it("Should insert properly if 'after' is set correctly", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("after", {after: "trace"})).to.not.throw();
    expect(l.names().length).to.equal(beforeNameLen + 1);
    expect(log.after).to.be.a("function");
    
    // It shouldn't log if the log level is too high
    log._setLevel("trace");
    var cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.after("aftr")).to.not.throw();
    expect(cnslLg.callCount).to.equal(0);
    
    // It shouldn't log if the log level is low enough
    log._setLevel("after");
    cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.after("aftr")).to.not.throw();
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[AFTER]", "aftr"]);
  });
  
  it("Should insert properly if 'before' is set correctly", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("before", {before: "trace"})).to.not.throw();
    expect(l.names().length).to.equal(beforeNameLen + 1);
    expect(log.before).to.be.a("function");
    
    // It should log
    log._setLevel("before");
    cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.before("bfr")).to.not.throw();
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[BEFORE]", "bfr"]);
    
    // ... but it shouldn't log the 'after' level
    log._setLevel("before");
    var cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.trace("trce")).to.not.throw();
    expect(cnslLg.callCount).to.equal(0);
  });
  
  it("Should insert before 'debug' if 'before' not set", function() {
    var beforeNameLen = l.names().length;
    expect(() => log._addLevel("notset")).to.not.throw();
    expect(l.names().length).to.equal(beforeNameLen + 1);
    expect(log.notset).to.be.a("function");
    
    // It should log
    log._setLevel("notset");
    var cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.notset("ntst")).to.not.throw();
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[NOTSET]", "ntst"]);
    
    // ... but it shouldn't log 'debug'
    log._setLevel("notset");
    cnslLg = simple.mock();
    log.__set__("console", { log: cnslLg });
    expect(() => log.debug("dbg")).to.not.throw();
    expect(cnslLg.callCount).to.equal(0);
  });
  
  it("should call 'afterLog' if set", function() {
    var beforeNameLen = l.names().length;
    let aftr = simple.mock();
    expect(() => log._addLevel("withafter", {afterLog: aftr})).to.not.throw();
    expect(l.names().length).to.equal(beforeNameLen + 1);
    expect(log.withafter).to.be.a("function");
    
    // It shouldn't call if the log didn't happen
    log._setLevel("silent");
    expect(() => log.withafter("wthaftr")).to.not.throw();
    expect(aftr.callCount).to.equal(0, "'aftr' called on silent");
    
    // ...but if it did, it should call the 'afterLog' function with no arguments
    log._setLevel("withafter");
    expect(() => log.withafter("wthaftr")).to.not.throw();
    expect(aftr.callCount).to.equal(1, "'aftr' not called");
    expect(aftr.calls[0].args.length).to.equal(0);
  });
  
});
