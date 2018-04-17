"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
// Ignore all logging until the spy is set up.
log.__set__("console", {log: function() {}});

describe("log", function() {
  var cnslLg;
  var prcssExt;
  beforeEach(function() {
    log._setLevel("debug");
    
    cnslLg = simple.spy();
    log.__set__("console", {log: cnslLg});
    prcssExt = simple.mock(process, "exit", function() {});
    log.__set__("process", process);
  });
  
  afterEach(function() {
    simple.restore();
  });
  
  describe("fatal", function() {
    it("should exit with code 1", function() {
      log.fatal();
      expect(prcssExt.callCount).to.equal(1);
      expect(prcssExt.calls[0].args).to.deep.equal([1]);
    });
  });
  
  var l = require("../lib/levels.js");
  for (var lvl of l.names()) {
    (function(lvl) {
      let padding = " ".repeat(l.longest - lvl.length);
      
      describe(`${lvl} (${l.list[lvl].level})`, function() {
        it("should print with no args", function() {
          log[lvl]();
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`]);
        });
        
        it("should print with one arg", function() {
          log[lvl]("oh no");
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`, "oh no"]);
        });
        
        it("should print with multiple args", function() {
          log[lvl]("oh", "no");
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`, "oh", "no"]);
        });
        
        it("should stringify integers and booleans", function() {
          log[lvl](1, true);
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`, "1", "true"]);
        });
        
        it("should stringify objects", function() {
          log[lvl]({key: "value"});
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`, "{ key: 'value' }"]);
        });
        
        it("should stringify arrays and arrays of objects", function() {
          log[lvl](["hello", "world"], [{a: "b"}, {c: "d"}]);
          expect(cnslLg.callCount).to.equal(1);
          expect(cnslLg.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`, "hello,world", "{ a: 'b' },{ c: 'd' }"]);
        });
      });
    })(lvl);
  }
});
