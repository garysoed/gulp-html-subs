/* global describe, it */
'use strict';

var fs = require('fs');
var expect = require('chai').expect;

require('mocha');

delete require.cache[require.resolve('../')];

var gutil = require('gulp-util');
var htmlSubs = require('../');

function createFile(name, baseName, content) {
  var file = new gutil.File({
    path: 'test/fixtures/' + baseName,
    cwd: 'test/',
    base: 'test/fixtures',
    contents: content
  });
  file.htmlSubsPath = 'test/fixtures/' + name;
  return file;
}

function loadExpectedFile(name, baseName) {
  return createFile(name, baseName, fs.readFileSync('test/expected/' + name));
}

function loadFixtureFile(name, baseName) {
  return createFile(name, baseName, fs.readFileSync('test/fixtures/' + name));
}

function expectFileEquals(expected, actual) {
  expect(actual.htmlSubsPath).to.be.equal(expected.htmlSubsPath);
  expect(actual.path).to.be.equal(expected.path);
  expect(actual.cwd).to.be.equal(expected.cwd);
  expect(actual.base).to.be.equal(expected.base);
  expect(String(actual.contents)).to.be.equal(String(expected.contents));
}

describe('gulp-html-subs', function () {
  describe('extract', function() {
    it('should produce the expected files via buffer', function(done) {
      var expectedFiles = {
        '0': loadExpectedFile('extract.html.0', 'extract.html'),
        '1': loadExpectedFile('extract.html.1', 'extract.html'),
        '2': loadExpectedFile('extract.html.2', 'extract.html')
      };
      var srcFile = loadFixtureFile('extract.html', 'extract.html');

      var plugin = htmlSubs('script').extract;

      plugin.on('data', function(newFile) {
        var path = newFile.htmlSubsPath;
        var key = path[path.length - 1];
        var expectedFile = expectedFiles[key];
        expectFileEquals(expectedFile, newFile);

        delete expectedFiles[key];
        if (Object.keys(expectedFiles).length === 0) {
          done();
        }
      });

      plugin.write(srcFile);
      plugin.end();
    });

    it('should produce empty file on files without any script tags', function(done) {
      var expectedFile = createFile('extract-empty.html.0', 'extract-empty.html', new Buffer(''));
      var srcFile = loadFixtureFile('extract-empty.html', 'extract-empty.html');

      var plugin = htmlSubs('script').extract;
      plugin.on('data', function(newFile) {
        expectFileEquals(expectedFile, newFile);
        done();
      });

      plugin.write(srcFile);
      plugin.end();
    });
  });

  describe('inject', function() {
    it('should produce the expected files via buffer', function(done) {
      var inputFile = loadFixtureFile('inject.html', 'inject.html');
      var expectedFile = loadExpectedFile('inject.html', 'inject.html');
      var segmentFiles = {
        '0': loadFixtureFile('inject.html.0', 'inject.html'),
        '1': loadFixtureFile('inject.html.1', 'inject.html'),
        '2': loadFixtureFile('inject.html.2', 'inject.html')
      };

      var subs = htmlSubs('script');
      subs.extract.write(inputFile);
      subs.extract.on('data', function(file) {
        var path = file.htmlSubsPath;
        subs.inject.write(segmentFiles[path[path.length - 1]]);
      });

      subs.inject.on('data', function(newFile) {
        expectedFile.htmlSubsPath = undefined;
        expectFileEquals(expectedFile, newFile);
        done();
      });
    });
  });
});
