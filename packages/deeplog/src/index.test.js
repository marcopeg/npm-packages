import deeplog, { deepLog, deepInfo, deepWarn, deepError } from './index'

describe('deeplog/index', () => {
  test('deeplog', () => {
    expect(typeof deeplog).toBe('function')
  })
  test('deepLog', () => {
    expect(typeof deepLog).toBe('function')
  })
  test('deepInfo', () => {
    expect(typeof deepInfo).toBe('function')
  })
  test('deepWarn', () => {
    expect(typeof deepWarn).toBe('function')
  })
  test('deepError', () => {
    expect(typeof deepError).toBe('function')
  })
})
