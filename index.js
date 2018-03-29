"use strict";

// Global imports
const util = require("util");
// Local imports
const l = require("./lib/levels");

// The current log level (Can never be set < -1, i.e., it will always print FATAL messages)
function _log(level, prefix, afterLog, ...messages) {
  // Only log if the level is <= the log level
  if (level > l.level) return;
  
  var msgs = [];
  for (var m of messages) {
    msgs.push(format(m).replace(/\n/g, "\n    >>> "));
  }
  // eslint-disable-next-line no-console
  console.log(prefix, ...msgs);
  
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
  // Clear the current functions
  for (let key in log) {
    delete log[key];
  }
  
  // Generate log functions
  for (var lvl of l.names()) {
    // Pad it out so all messages are the same distance, regardless of prefix
    let padding = " ".repeat(l.longest - lvl.length);
    // Add the log (bind the 'this' value to null, the 'level' to be i, and the 'prefix' to be the padded prefix)
    log[lvl] = _log.bind(null, l.list[lvl].level, `[${lvl.toUpperCase()}]${padding}`, l.list[lvl].afterLog);
  }
  
  // Set meta info
  log._setLevel = l.set.bind(l, log);
  log._addLevel = l.add.bind(l, log, generate);
}

// Generate the first set
generate();

// Export!
module.exports = log;