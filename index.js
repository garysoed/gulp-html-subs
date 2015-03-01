var Extract = require('./extract');
var Inject  = require('./inject');

module.exports = function(selector) {
  var targetFiles = {};
  return {
    extract: new Extract(targetFiles, selector),
    inject: new Inject(targetFiles, selector)
  }
};
