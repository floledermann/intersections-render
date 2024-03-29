export function arrayMin(arr) {
  return arr.reduce(function (a, v) {
    return ( a < v ? a : v );
  });
}

export function arrayMax(arr) {
  return arr.reduce(function (a, v) {
    return ( a > v ? a : v );
  });
}

export function arr(value) {
  if (Array.isArray(value)) return value;
  return [value];
}

export function valOrFunc(arg, ...args) {
  if (typeof arg == "function") {
    return arg.apply(null, args);
  }
  return arg;
}