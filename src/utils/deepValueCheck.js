module.exports = (target, p, value) => {
  if (typeof target !== 'object' || target === null) {
    return false;
  }

  const parts = p.split('.');

  while (parts.length) {
    const property = parts.shift();
    // eslint-disable-next-line
    if (!(target.hasOwnProperty(property))) {
      return false;
    }
    // eslint-disable-next-line
    target = target[ property ];
  }

  if (value) {
    return target === value;
  }
  return true;
};
