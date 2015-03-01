var gutil   = require('gulp-util');
var jsdom   = require('jsdom');
var through = require('through2');

function processJsDom(targetFile, selector, file, cb, errors, window) {
  if (errors) {
    cb(errors);
  }

  var elements = window.document.querySelectorAll(selector);

  // Create all the components first before calling push, since push can lead to the next
  // step.
  for (var i = 0; i < elements.length; i++) {
    targetFile.$components[i] = null;
  }

  for (var i = 0; i < elements.length; i++) {
    this.push(new gutil.File({
      cwd: file.cwd,
      path: file.path + '.' + i,
      base: file.base,
      stat: file.stat,
      contents: new Buffer(elements[i].innerHTML)
    }));
  };

  if (elements.length <= 0) {
    // Send out a fake file so the pipe can still go.
    this.push(new gutil.File({
      cwd: file.cwd,
      path: file.path + '.0',
      base: file.base,
      stat: file.stat,
      contents: new Buffer('')
    }));
  }

  cb();
}

function Extract(targetFiles, selector) {
  return through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      var html = String(file.contents);
      var targetFile = new gutil.File({
        cwd: file.cwd,
        path: file.path,
        base: file.base,
        stat: file.stat,
        contents: file.contents
      });
      targetFile.$components = {};
      targetFiles[file.path] = targetFile;

      jsdom.env(html, [], processJsDom.bind(this, targetFile, selector, file, cb));
    }

    if (file.isStream()) {
      // TODO(gs): Implement.
      this.emit(
          'error',
          new gutil.PluginError('gulp-html-subs', 'Stream content unsupported'));
      return cb();
    }
  });
}

module.exports = Extract;
