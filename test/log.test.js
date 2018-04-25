"use strict";

// Refresh the caches before starting
delete require.cache[require.resolve("../index.js")];
delete require.cache[require.resolve("../lib/levels.js")];

var log = rewire("../index.js");
// Ignore all logging until the spy is set up.
log._stream = { write: function() {} };

describe("log", function() {
  var stdWrite;
  var prcssExt;
  beforeEach(function() {
    log._setLevel("debug");
    log.error(""); // force it to print something.
    
    stdWrite = simple.spy();
    log._stream = {write: stdWrite};
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
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}\n`]);
        });
        
        it("should print with one arg", function() {
          log[lvl]("oh no");
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} oh no\n`]);
        });
        
        it("should print with multiple args", function() {
          log[lvl]("oh", "no");
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} oh no\n`]);
        });
        
        it("should stringify integers and booleans", function() {
          log[lvl](1, true);
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} 1 true\n`]);
        });
        
        it("should stringify objects", function() {
          log[lvl]({key: "value"});
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} { key: 'value' }\n`]);
        });
        
        it("should stringify arrays and arrays of objects", function() {
          log[lvl](["hello", "world"], [{a: "b"}, {c: "d"}]);
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} hello,world { a: 'b' },{ c: 'd' }\n`]);
        });
      });
      
      describe(`${lvl}_ (${l.list[lvl].level})`, function() {
        it("should write with no args", function() {
          log[lvl + "_"]();
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding}`]);
        });
        
        it("should write with one arg", function() {
          log[lvl + "_"]("oh no");
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} oh no`]);
        });
        
        it("should write with multiple args", function() {
          log[lvl + "_"]("oh", "no");
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} oh no`]);
        });
        
        it("should stringify integers and booleans", function() {
          log[lvl + "_"](1, true);
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} 1 true`]);
        });
        
        it("should stringify objects", function() {
          log[lvl + "_"]({key: "value"});
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} { key: 'value' }`]);
        });
        
        it("should stringify arrays and arrays of objects", function() {
          log[lvl + "_"](["hello", "world"], [{a: "b"}, {c: "d"}]);
          expect(stdWrite.callCount).to.equal(1);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} hello,world { a: 'b' },{ c: 'd' }`]);
        });
        
        it("should correctly concat multiple calls", function() {
          log[lvl + "_"]("first");
          log[lvl + "_"]("second");
          expect(stdWrite.callCount).to.equal(2);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} first`]);
          expect(stdWrite.calls[1].args).to.deep.equal(["second"]);
        });
        
        it("should correctly concat multiple calls interlaced with prints", function() {
          log[lvl + "_"]("first");
          log[lvl]("second");
          log[lvl + "_"]("third");
          log[lvl + "_"]("fourth");
          expect(stdWrite.callCount).to.equal(4);
          expect(stdWrite.calls[0].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} first`]);
          expect(stdWrite.calls[1].args).to.deep.equal(["second\n"]);
          expect(stdWrite.calls[2].args).to.deep.equal([`[${lvl.toUpperCase()}]${padding} third`]);
          expect(stdWrite.calls[3].args).to.deep.equal(["fourth"]);
        });
      });
    })(lvl);
  }
});
