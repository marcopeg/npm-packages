import { deepLog, deepInfo, deepWarn, deepError } from './deeplog';

describe('deeplog/lib', () => {
  test('it should deeplog a list of arguments', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    deepLog({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });

  test('it should deepinfo a list of arguments', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation();
    deepInfo({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });

  test('it should deepwarn a list of arguments', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    deepWarn({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });

  test('it should deeperror a list of arguments', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    deepError({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });
});
