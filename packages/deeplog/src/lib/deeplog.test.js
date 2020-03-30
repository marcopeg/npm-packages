import deeplog from './deeplog';

describe('deeplog', () => {
  test('it should deeplog a list of arguments', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    deeplog({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });

  test('it should deepwarn a list of arguments', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    deeplog.warn({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });

  test('it should deeperror a list of arguments', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    deeplog.error({ foo: 123 }, 'hoho', 223, true);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockRestore();
  });
});
