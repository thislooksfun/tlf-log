"use strict";
const defaultLevels = {
  fatal: {level: -Infinity, afterLog: function() { process.exit(1); }},
  
  error: {level: 0},
  warn:  {level: 1},
  info:  {level: 2},
  trace: {level: 3},
  debug: {level: 4}
};
// The default level (Must be one of the levels above)
const defaultLvl = defaultLevels.info.level;

module.exports = {
  list: defaultLevels,
  level: defaultLvl,
  longest: 5,  // 'fatal', 'error', 'warn', 'trace', and 'debug' are all length 5
  names() { return Object.keys(this.list); },
  add(log, generate, name, opts) {
    if (typeof name !== "string") {
      log.fatal(`Can't add log level '${name}', name must be a string.`);
    }
    if (name === "") {
      log.fatal("Can't add log level, name must be a non-empty string.");
    }
    if (name === "silent") {
      log.fatal("Can't add log level, 'silent' is reserved.");
    }
    if (name[0] === "_") {
      log.fatal(`Can't add log level '${name}', name must not start with '_'.`);
    }
    if (name in this.list) {
      log.fatal(`Can't add log level '${name}', level already exists.`);
    }
    
    opts = opts || {};
    
    if (opts.after !== undefined && opts.before !== undefined) {
      log.fatal(`Can't add log level '${name}': both 'after' and 'before' are set.`);
    }
    
    
    var newItem;
    if (opts.after !== undefined) {
      // Place after
      if (opts.after === "debug") {
        log.fatal(`Can't add log level '${name}' after 'debug'. Debug must always be the last level.`);
      }
      if (!(opts.after in this.list)) {
        log.fatal(`Can't add log level '${name}' after '${opts.after}', key not found.`);
      }
      
      newItem = {level: this.list[opts.after].level + 1};
    } else {
      let before = opts.before || "debug";
      // Place before
      if (before === "fatal") {
        log.fatal(`Can't add log level '${name}' before 'fatal'. Fatal must always be the first level.`);
      }
      if (!(before in this.list)) {
        log.fatal(`Can't add log level '${name}' before '${before}', key not found.`);
      }
      newItem = {level: this.list[before].level};
    }
    
    if (typeof opts.afterLog === "function") {
      newItem.afterLog = opts.afterLog;
    }
    
    for (var n of this.names()) {
      if (this.list[n].level >= newItem.level) {
        this.list[n].level++;
      }
    }
    
    this.list[name] = newItem;
    
    if (name.length > this.longest) {
      this.longest = name.length;
    }
    
    // call the generate function to add the new log level
    generate();
  },
  set(log, lvl) {
    if (typeof lvl !== "string") {
      log.fatal("log._setLog must be called with a string.");
    }
    
    if (lvl === "silent") {
      this.level = -1;
    } else {
      var l = this.list[lvl.toLowerCase()];
      if (l === undefined) {
        log.fatal(`Unknown log level '${lvl}'\nValid log levels are:\n  ${this.names().join(", ")}, and silent.`);
      }
      this.level = l.level;
    }
    log.trace(`Set log level to '${lvl}'.`);
  }
};