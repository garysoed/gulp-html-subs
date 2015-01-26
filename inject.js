var gutil   = require('gulp-util');
var jsdom   = require('jsdom');
var path    = require('path');
var through = require('through2');

function processJsDom(targetFile, cb, errors, window) {
  if (errors) {
    cb(errors);
  }
  
  var elements = window.document.querySelectorAll('script');
  for (var i = 0; i < elements.length; i++) {
    elements[i].innerHTML = targetFile.$components[i];
  }

  targetFile.contents = new Buffer(window.document.querySelector(':root').outerHTML);
  this.push(targetFile);
  cb();
}

function Inject(targetFiles) {
  return through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      var ext = path.extname(file.path);
      var filepath = file.path.substring(0, file.path.length - ext.length);
      var id = ext.substring(1);
      var targetFile = targetFiles[filepath];

      targetFile.$components[id] = String(file.contents);

      // Check if all the components are ready.
      var isReady = true;
      for (var i in targetFile.$components) {
        isReady = isReady && targetFile.$components[i] !== null;
      };

      if (isReady) {
        jsdom.env(String(targetFile.contents), [], processJsDom.bind(this, targetFile, cb));
      } else {
        cb();
      }
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

module.exports = Inject;