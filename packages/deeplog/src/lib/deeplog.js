/**
 * Console logs formatted JSON
 *
 */

export const deepLog = (...args) => {
  args.forEach(arg => {
    console.log(JSON.stringify(arg, null, 2));
  });
};

export const deepInfo = (...args) => {
  args.forEach(arg => {
    console.info(JSON.stringify(arg, null, 2));
  });
};

export const deepWarn = (...args) => {
  args.forEach(arg => {
    console.warn(JSON.stringify(arg, null, 2));
  });
};

export const deepError = (...args) => {
  args.forEach(arg => {
    console.error(JSON.stringify(arg, null, 2));
  });
};
