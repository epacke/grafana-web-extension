// Logger utility with levels and nice formatting
import { config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private icons: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  };

  private colors: Record<LogLevel, string> = {
    debug: '#888',
    info: '#2196F3',
    warn: '#FF9800',
    error: '#F44336'
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level || 'debug',
      prefix: config.prefix
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.level];
  }

  private formatPrefix(): string {
    const parts: string[] = [
      new Date().toISOString()
    ];
    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }
    return `[${parts.join('] [')}]`;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    try {
      const prefix = this.formatPrefix();
      const levelText = `${this.icons[level]} ${level.toUpperCase()}`;

      const consoleMethod = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error
      }[level] || console.log;

      // Always use colors - style the prefix part
      consoleMethod(`%c${prefix}%c ${levelText} ${message}`, 
        `color: ${this.colors[level]}; font-weight: bold`, 
        '', 
        ...args);
    } catch (error) {
      // Fallback to plain console.log if there's an error
      console.error('[Logger Error]', error, 'Original message:', message, ...args);
    }
  }

  public debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public getLevel(): LogLevel {
    return this.config.level;
  }
}

// Default logger instance
const defaultLogger = new Logger({
  level: 'debug'
});

// Update default logger level from config
export function updateLogLevelFromConfig(logLevel: LogLevel): void {
  defaultLogger.setLevel(logLevel);
}

/**
 * Get the configured log level, with a default fallback
 */
export function getLogLevel(): LogLevel {
  return config.log_level || 'debug';
}

// Export
export { Logger, defaultLogger as logger };
export type { LogLevel, LoggerConfig };
