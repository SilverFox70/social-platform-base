const { createLogger, format, transports } = require('winston')
const colors = require('colors/safe')

// This is a singleton class for logging
class Logger {
  constructor () {
    // Setting up some basic logging with winston
    this.winstonLogger = createLogger({
      transports: [
        new transports.Console({
          format: this._getWinstonFormat(true)
        })
      ]
    })
  }

  setLoggingFile (filename) {
    this.winstonLogger.add(
      new transports.File({
        filename,
        format: this._getWinstonFormat(false)
      })
    )
  }

  set level (level) {
    this.winstonLogger.level = level
  }

  get level () {
    return this.winstonLogger.level
  }

  /**
   * Avoid sending color data to file logs
   * @param {boolean} useColor
   */
  _getWinstonFormat (useColor = true) {
    let combineOptions = []

    if (useColor) combineOptions.push(format.colorize())

    combineOptions.push(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZZ' })
    )

    combineOptions.push(
      format.printf(info => {
        let timestamp = info.timestamp
        let section = ''
        let errorDetails = ''

        if (useColor) {
          timestamp = colors.dim.yellow(timestamp)
        }

        if (info.section && useColor) {
          section = colors.blue(`[${info.section}] `)
        } else {
          section = `[${info.section}] `
        }

        if (info.errorDetails && useColor) {
          errorDetails = `\n ${colors.dim.red('[Error details]')}\n   ${colors.gray(info.errorDetails)}`
        } else if (info.errorDetails) {
          errorDetails = `\n [Error details]\n   ${info.errorDetails}`
        }

        return `${timestamp} ${section}${info.level}: ${info.message}${errorDetails}`
      })
    )

    return format.combine(...combineOptions)
  }

  /**
   * Logging wrapper. Levels from winston:
   * error: 0
   * warn: 1
   * info: 2
   * verbose: 3
   * debug: 4
   * silly: 5
   * @param {string} message
   * @param {string} level - see levels
   * @param {string} section - used to categorize the log, e.g., a ClassName
   */
  log (message, level = 'info', section = null, errorDetails = null) {
    this.winstonLogger.log(level, message, { section, errorDetails })
  }

  // Shortcut methods
  /**
   * @param {string} message
   * @param {string} section
   * @param {error} errorObject
   */
  error (message, section, error = null) {
    let errorDetails = null
    // If error object is provided, make the printing a little cleaner
    if (error && error.stack) {
      // Print first 5 lines of stack trace
      errorDetails = error.stack.match(/(.*\n?){0,5}/)[0]
      // // message += `\n ${colors.dim.red('[Error details]')}\n   ${colors.gray(errorLines)}`
      // message += `\n [Error details]\n   ${errorLines}`
    }

    this.log(message, 'error', section, errorDetails)
  }

  warn (message, section) {
    this.log(message, 'warn', section)
  }

  info (message, section) {
    this.log(message, 'info', section)
  }

  verbose (message, section) {
    this.log(message, 'verbose', section)
  }

  debug (message, section) {
    this.log(message, 'debug', section)
  }
}

module.exports = new Logger()
