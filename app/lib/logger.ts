export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export class ConsoleLogger implements Logger {
  info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}

export class NoOpLogger implements Logger {
  info(message: string, ...args: any[]): void {}
  error(message: string, ...args: any[]): void {}
  warn(message: string, ...args: any[]): void {}
  debug(message: string, ...args: any[]): void {}
}

// Simple decorator that logs method entry and exit
export function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const methodName = propertyKey;
    const className = target.constructor.name;
    
    console.log(`[${className}] ${methodName} called`);
    
    try {
      const result = await originalMethod.apply(this, args);
      console.log(`[${className}] ${methodName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`[${className}] ${methodName} failed:`, error);
      throw error;
    }
  };

  return descriptor;
}

// Decorator factory that accepts a logger instance
export function withLogger(logger: Logger) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodName = propertyKey;
      const className = target.constructor.name;
      
      logger.info(`${className}.${methodName} called`);
      
      try {
        const result = await originalMethod.apply(this, args);
        logger.info(`${className}.${methodName} completed successfully`);
        return result;
      } catch (error) {
        logger.error(`${className}.${methodName} failed:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

// Default logger instance
export const defaultLogger = new ConsoleLogger(); 