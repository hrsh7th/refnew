/**
 * destructive method definitions.
 */
export const destructives = new Set();

/**
 * annotate destructive methods.
 */
export const destructive = (_?: () => boolean) => {
  return function(_: any, __: PropertyKey, descriptor: PropertyDescriptor) {
    destructives.add(descriptor.value);
  };
};

/**
 * add destructive function.
 */
export const addDestructive = (fn: Function) => {
  destructives.add(fn);
};

// Array.
[
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "copyWithin",
  "fill",
  "reverse",
  "sort"
].forEach(name => destructives.add((Array.prototype as any)[name]));

// Date.
[
  "setDate",
  "setFullYear",
  "setHours",
  "setMilliseconds",
  "setMinutes",
  "setMonth",
  "setSeconds",
  "setTime",
  "setUTCDate",
  "setUTCFullYear",
  "setUTCHours",
  "setUTCMilliseconds",
  "setUTCMinutes",
  "setUTCSeconds",
  "setYear"
].forEach(name => destructives.add((Date.prototype as any)[name]));
