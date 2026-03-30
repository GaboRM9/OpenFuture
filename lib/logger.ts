/**
 * Centralized logger. Swap the internals here to route to Sentry, Datadog, etc.
 * All server-side errors should go through this — never raw console.error.
 */

type LogContext = Record<string, unknown>

function format(level: string, message: string, context?: LogContext): string {
  const ts = new Date().toISOString()
  const ctx = context ? ' ' + JSON.stringify(context) : ''
  return `[${ts}] ${level} ${message}${ctx}`
}

export const logger = {
  error(message: string, err?: unknown, context?: LogContext) {
    const errDetail = err instanceof Error
      ? { name: err.name, message: err.message }
      : { raw: String(err) }
    console.error(format('ERROR', message, { ...context, error: errDetail }))
    // TODO: forward to Sentry/Datadog — e.g. Sentry.captureException(err, { extra: context })
  },

  warn(message: string, context?: LogContext) {
    console.warn(format('WARN', message, context))
  },

  info(message: string, context?: LogContext) {
    console.log(format('INFO', message, context))
  },
}
