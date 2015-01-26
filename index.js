var Extract = require('./extract');
var Inject  = require('./inject');

module.exports = function() {
  var targetFiles = {};
  return {
    extract: new Extract(targetFiles),
    inject: new Inject(targetFiles)
  }
};
