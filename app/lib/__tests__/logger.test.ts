import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsoleLogger, NoOpLogger } from '../logger'

describe('Logger', () => {
  describe('ConsoleLogger', () => {
    let logger: ConsoleLogger
    let consoleSpy: any

    beforeEach(() => {
      logger = new ConsoleLogger()
      consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
      }
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should log info messages with prefix', () => {
      logger.info('Test message')
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test message')
    })

    it('should log error messages with prefix', () => {
      logger.error('Error message')
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error message')
    })

    it('should log warn messages with prefix', () => {
      logger.warn('Warning message')
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message')
    })

    it('should log debug messages with prefix', () => {
      logger.debug('Debug message')
      expect(consoleSpy.debug).toHaveBeenCalledWith('[DEBUG] Debug message')
    })

    it('should handle additional arguments', () => {
      const data = { key: 'value' }
      logger.info('Test message', data)
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test message', data)
    })
  })

  describe('NoOpLogger', () => {
    let logger: NoOpLogger

    beforeEach(() => {
      logger = new NoOpLogger()
    })

    it('should not log anything', () => {
      const consoleSpy = {
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
      }

      logger.info('Test message')
      logger.error('Error message')
      logger.warn('Warning message')
      logger.debug('Debug message')

      expect(consoleSpy.log).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.debug).not.toHaveBeenCalled()

      vi.restoreAllMocks()
    })
  })
}) 