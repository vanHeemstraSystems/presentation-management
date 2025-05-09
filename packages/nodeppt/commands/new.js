/**
 * @file init Initialize the project
 */
const path = require('path')
const fs = require('fs-extra')

const home = require('user-home')
const inquirer = require('inquirer')

const exists = fs.existsSync
const rm = fs.removeSync

const generate = require('../lib/generate')

const {
  chalk,
  isLocalPath,
  getTemplatePath,
  error,
  updateSpinner,
  logWithSpinner,
  stopSpinner,
  log,
  downloadRepo,
  clearConsole
} = require('nodeppt-shared-utils')
const ALIAS_MAP = process.env.alias || {
  buildin: path.parse(require.resolve('nodeppt-template-default')).dir,
  default: 'ksky521/nodeppt-template-default'
}
const alias = name => {
  if (ALIAS_MAP[name]) {
    return ALIAS_MAP[name]
  }

  return name
}
module.exports = async (dest, opts) => {
  let template = opts.template
  // Use the built-in
  template = alias(template || 'buildin')
  if (!dest) {
    const { filename } = await inquirer.prompt([
      {
        name: 'filename',
        type: 'string',
        required: true,
        label: 'Please input markdown file name',
        default: 'nodeppt.md'
      }
    ])
    if (!filename) {
      return
    } else {
      dest = filename
    }
  }
  if (path.parse(dest).ext === '') {
    dest += '.md'
  }
  if (exists(dest)) {
    if (opts.force) {
      // Forceful deletion
      await fs.remove(dest)
    } else {
      clearConsole()
      // Prompt to delete
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `${dest} file exists. Continue?：`,
          choices: [
            { name: 'overwrite', value: 'overwrite' },
            { name: 'cancel', value: false }
          ]
        }
      ])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        log(`delete ${chalk.cyan(dest)}...`)
        await fs.remove(dest)
      }
    }
  }

  if (isLocalPath(template)) {
    // Use offline address
    // Copy directly without downloading GitHub code
    const templatePath = getTemplatePath(template)
    if (exists(templatePath)) {
      generate(templatePath, dest, opts)
    } else {
      error('Template not found')
    }
  } else {
    // Temporary storage address, stored in ~/.nodeppt-templates
    let tmp = path.join(
      home,
      '.nodeppt-templates',
      template.replace(/[/:#]/g, '-')
    )

    clearConsole()
    logWithSpinner('🗃', 'Download...')
    if (exists(tmp)) {
      rm(tmp)
    }

    downloadRepo(template, tmp, opts, err => {
      if (!err) {
        updateSpinner('🗃', 'Template download success！')
      } else {
        updateSpinner('❌', 'Template download error!')
      }
      stopSpinner()
      console.log()
      if (!err) {
        generate(tmp, dest, opts)
      } else {
        error('Failed to download repo ' + template + ': ' + err.message.trim())
        if (!process.env.DEBUG) {
          log(`Use「${chalk.bgYellow.black('DEBUG=*')}」 to get more info`)
        }
      }
    })
  }
}
