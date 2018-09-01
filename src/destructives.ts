/**
 * destructive method definitions.
 */
export const destructives = new Map<Function, true>();

/**
 * annotate destructive methods.
 */
export const destructive = (_?: () => boolean) => {
  return function(_: any, __: PropertyKey, descriptor: PropertyDescriptor) {
    destructives.set(descriptor.value, true);
  };
};

/**
 * add destructive function.
 */
export const addDestructive = (fn: Function) => {
  destructives.set(fn, true);
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
].forEach(name => destructives.set((Array.prototype as any)[name], true));

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
].forEach(name => destructives.set((Date.prototype as any)[name], true));
