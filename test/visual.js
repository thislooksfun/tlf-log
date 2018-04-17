"use strict";

var log = require("../index.js");

log._setLevel("debug");

log.debug("dbg");

log._indent();
log.trace("trce");
log._deindent();

log.info("inf");

log._prefix("> ");
log.warn("wrn");
log._deprefix();

log._indent();
log._indent();
log.error("err\non two lines");
log._deindent();

log.fatal("ftl");