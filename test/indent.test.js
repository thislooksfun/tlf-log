"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
// Ignore all logging until the spy is set up.
log.__set__("console", {log: function() {}});

describe("log._indent", function() {
  var cnslLg;
  beforeEach(function() {
    log._setLevel("debug");
    
    cnslLg = simple.spy();
    log.__set__("console", {log: cnslLg});
  });
  
  afterEach(function() {
    simple.restore();
  });
  
  it("should indent by two spaces", function() {
    log._indent();
    log.info("inf");
    log._deindent();
    
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[INFO] ", "  inf"]);
  });
  
  it("should indent by two spaces per call", function() {
    log._indent();
    log._indent();
    log.info("inf");
    log._deindent();
    log._deindent();
    
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[INFO] ", "    inf"]);
  });
  
  it("should deindent by two spaces", function() {
    log._indent();
    log._indent();
    log._indent();
    log._deindent();
    log.info("inf");
    log._deindent();
    log._deindent();
    
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[INFO] ", "    inf"]);
  });
  
  it("should indent multiple lines", function() {
    log._indent();
    log.info("inf\nand again");
    log._deindent();
    
    expect(cnslLg.callCount).to.equal(1);
    expect(cnslLg.calls[0].args).to.deep.equal(["[INFO] ", "  inf\n    >>>   and again"]);
  });
});
