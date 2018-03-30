tlf-log
=======

[![npm version](https://img.shields.io/npm/v/tlf-log.svg?style=flat-square)](https://www.npmjs.com/package/tlf-log)
[![npm total downloads](https://img.shields.io/npm/dt/tlf-log.svg?style=flat-square)](https://www.npmjs.com/package/tlf-log)
[![npm monthly downloads](https://img.shields.io/npm/dm/tlf-log.svg?style=flat-square)](https://www.npmjs.com/package/tlf-log)
[![License](https://img.shields.io/github/license/thislooksfun/tlf-log.svg?style=flat-square)](https://github.com/thislooksfun/tlf-log/blob/master/LICENSE)  
[![Build status](https://img.shields.io/travis/thislooksfun/tlf-log/master.svg?style=flat-square)](https://travis-ci.org/thislooksfun/tlf-log)
[![Coveralls](https://img.shields.io/coveralls/github/thislooksfun/tlf-log.svg?style=flat-square)](https://coveralls.io/github/thislooksfun/tlf-log?branch=master)  
[![Dependency status](https://img.shields.io/david/thislooksfun/tlf-log.svg?style=flat-square)](https://david-dm.org/thislooksfun/tlf-log)
[![DevDependency status](https://img.shields.io/david/dev/thislooksfun/tlf-log.svg?style=flat-square)](https://david-dm.org/thislooksfun/tlf-log#info=devDependencies)

A simple module for easy logging


## Installation

```
npm i -S tlf-log
```


## Typical Usage

```javascript
const log = require("tlf-log");
log.trace("Starting up!");
```


## Documentation

| Function                        | Description                                                               |
|---------------------------------|---------------------------------------------------------------------------|
| `log.<level>(msgs)`             | Logs the given messages at the specified level.                           |
| `log._setLevel(<lvl>)`          | Sets the minimum level to log -- all lower levels will be ignored. Can also be set to 'silent' to silence all but fatal messages. |
| `log._addLevel(<name>, <opts>)` | Adds a new log level. Valid options are "before", "after" and "afterLog". |


