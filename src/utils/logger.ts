/**
 * Enhanced logger utility for the Roblox Studio MCP Server
 */

// Environment variables
const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase() || 'info';
const LOG_TIMESTAMP = process.env.LOG_TIMESTAMP !== 'false';
const LOG_COLOR = process.env.LOG_COLOR !== 'false';

// Log levels with numeric values for comparison
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Helper to check if a log level should be displayed
const shouldLog = (level: string): boolean => {
  const configuredLevel = LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS] ?? LOG_LEVELS.info;
  const messageLevel = LOG_LEVELS[level as keyof typeof LOG_LEVELS] ?? LOG_LEVELS.info;
  return messageLevel >= configuredLevel;
};

// Helper to format a log message
const formatMessage = (level: string, message: string): string => {
  const timestamp = LOG_TIMESTAMP ? `${new Date().toISOString()} ` : '';
  let prefix = `[${level.toUpperCase()}]`;
  
  if (LOG_COLOR) {
    let color = COLORS.reset;
    switch (level) {
      case 'debug':
        color = COLORS.gray;
        break;
      case 'info':
        color = COLORS.green;
        break;
      case 'warn':
        color = COLORS.yellow;
        break;
      case 'error':
        color = COLORS.red;
        break;
    }
    prefix = `${color}${prefix}${COLORS.reset}`;
  }
  
  return `${timestamp}${prefix} ${message}`;
};

export const logger = {
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message), ...args);
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message), ...args);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },
  
  error: (message: string, ...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message), ...args);
    }
  },
  
  // Log with stack trace for critical errors
  critical: (message: string, error?: Error): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', `CRITICAL: ${message}`));
      if (error && error.stack) {
        console.error(COLORS.red + error.stack + COLORS.reset);
      }
    }
  },
};
