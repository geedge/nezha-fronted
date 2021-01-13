'use strict'
let BUILD_MODE=process.argv.splice(2)[0] || 'prod';
module.exports = {
  NODE_ENV: '"production"',
  BUILD_MODE:'"'+BUILD_MODE+'"'
}
