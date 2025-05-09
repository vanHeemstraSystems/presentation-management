const path = require('path');
const fs = require('fs-extra');
const defaultDeep = require('lodash.defaultsdeep');
const ejs = require('ejs');
const loaderUtils = require('loader-utils');

const getParser = require('./lib/get-parser');
// parsers
const yamlParser = require('./lib/yaml-parser');

const defaults = require('./defaults');

// Template
const defaultTemplate = fs.readFileSync(path.join(__dirname, './template/index.ejs')).toString();
// Don't use arrow functions here, this points to the problem!
/* eslint-disable space-before-function-paren */
module.exports = function (content) {
    /* eslint-enable space-before-function-paren */
    const {plugins = []} = loaderUtils.getOptions(this);
    const resourcePath = this.resourcePath;
    const parser = getParser(plugins);

    const settings = content.split(/<slide.*>/i)[0];
    const yamlSettings = yamlParser(settings);
    // Support baseTemplate, pass in ejs template
    let template = defaultTemplate;
    if (yamlSettings.baseTemplate && typeof yamlSettings.baseTemplate === 'string') {
        const baseTemplate = path.resolve(path.dirname(resourcePath), yamlSettings.baseTemplate);
        if (fs.existsSync(baseTemplate)) {
            template = fs.readFileSync(baseTemplate).toString();
        }
    }
    // Header yaml settings section
    const globalSettings = defaultDeep(yamlSettings, defaults);
    content = parser(content);

    return ejs.render(template, {...globalSettings, content});
};