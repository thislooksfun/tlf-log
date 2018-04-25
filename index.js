"use strict";

// Global imports
const util = require("util");
// Local imports
const l = require("./lib/levels");

var globalPrefixSections = [];
var globalPrefix = "";
function buildPrefix() {
  globalPrefix = "";
  for (let sect of globalPrefixSections) {
    globalPrefix += sect;
  }
}

var lastPrintedNewline = true;
function _log(level, prefix, afterLog, printNewLine, ...messages) {
  // Only log if the level is <= the log level
  if (level > l.level) return;
  
  var msgs = [];
  for (var m of messages) {
    msgs.push(format(m).replace(/\n/g, "\n    >>> " + globalPrefix));
  }
  
  if (lastPrintedNewline) {
    if (msgs.length > 0) {
      msgs[0] = globalPrefix + msgs[0];
    }
    
    msgs.unshift(prefix);
  }
  
  let str = util.format(...msgs);
  this._stream.write(str + (printNewLine ? "\n" : ""));
  
  lastPrintedNewline = printNewLine;
  
  // Call after log function, if it exists
  afterLog && afterLog();
}

function format(m) {
  switch (typeof m) {
  case "string":
    return m;
  case "number":
  case "boolean":
    return "" + m;
  default:
    if (Array.isArray(m)) {
      return m.map((e) => format(e)).join(",");
    } else {
      return util.inspect(m, {showHidden: true, depth: null});
    }
  }
}

var log = {};
function generate() {
  let _stream = log._stream;
  
  // Clear the current functions
  for (let key in log) {
    delete log[key];
  }
  
  log._stream = _stream;
  
  // Generate log functions
  for (var lvl of l.names()) {
    // Pad it out so all messages are the same distance, regardless of prefix
    let padding = " ".repeat(l.longest - lvl.length);
    // Add the log (bind the 'this' value to null, the 'level' to be i, and the 'prefix' to be the padded prefix)
    log[lvl] = _log.bind(log, l.list[lvl].level, `[${lvl.toUpperCase()}]${padding}`, l.list[lvl].afterLog, true);
    log[lvl + "_"] = _log.bind(log, l.list[lvl].level, `[${lvl.toUpperCase()}]${padding}`, l.list[lvl].afterLog, false);
  }
  
  // Set meta info
  log._setLevel = l.set.bind(l, log);
  log._addLevel = l.add.bind(l, log, generate);
  
  // Add prefixes
  log._prefix = function(p) { globalPrefixSections.push(p); buildPrefix(); };
  log._deprefix = function() { globalPrefixSections.pop(); buildPrefix(); };
  
  // Add indentation
  log._indent = log._prefix.bind(null, "  ");
  log._deindent = log._deprefix;
}

// Generate the first set
generate();

log._stream = process.stdout;

// Export!
module.exports = log;