/**
 * @file Tool function export
 */

[
    'logger',
    'spinner',
    'get-debug',
    'eval',
    'path',
    'new-version-log',
    'download-repo',
    'git-user',
    'get-latest-version',
    'webpack-error',
    'prepare-urls',
    'find-existing'
].forEach(m => {
    Object.assign(exports, require(`./lib/${m}`));
});

exports.chalk = require('chalk');