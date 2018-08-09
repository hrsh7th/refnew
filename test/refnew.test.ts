import assert from "assert";
import refnew from "../src/refnew";
import * as Refnew from "../src/refnew";
import { destructive, addDestructive } from "../src/destructives";
import shallowEqual from "fbjs/lib/shallowEqual";

[
  { suite: "default", refnew: refnew },
  { suite: "named", refnew: Refnew.refnew }
].forEach(({ suite, refnew }) => {
  // Object.
  test(`${suite}: Object`, () => {
    const state = refnew({ object: { value: 0 } });
    const object = state.object;
    assert.equal(object, state.object);
    object.value++;
    assert.notEqual(object, state.object);
  });

  // Array.
  [
    ["push", [1]],
    ["pop", []],
    ["shift", []],
    ["unshift", [1]],
    ["splice", [0, 1]],
    ["splice", [0, 1, 2]]
  ].forEach(([name, args]) => {
    test(`${suite}: Array#${name}(${args})`, () => {
      const state = refnew({ array: [0] });
      const array = state.array;
      assert.equal(array, state.array);
      // @ts-ignore
      array[name].apply(array, args);
      assert.notEqual(array, state.array);
    });
  });

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
  ].forEach(name => {
    test(`${suite}: Date#${name}`, () => {
      const state = refnew({ date: new Date() });
      const date = state.date;
      assert.equal(date, state.date);
      // @ts-ignore
      date[name](new Date()[name.replace("set", "get")]);
      assert.notEqual(date, state.date);
    });
  });

  // Custom.
  [["getCount", true], ["increment", false], ["decriment", false]].forEach(
    ([name, equality]) => {
      test(`${suite}: Custom#${name}`, () => {
        const state = refnew({ custom: new Custom() });
        const custom = state.custom;
        assert.equal(custom, state.custom);
        // @ts-ignore
        custom[name]();
        assert.equal(custom === state.custom, equality);
      });
    }
  );

  // shallow-equals.
  test(`${suite}: shallow-equals`, () => {
    const state = refnew({ array: [{ name: 0 }] });
    const array = state.array;
    assert.equal(array, state.array);
    array[0].name++;
    assert.equal(shallowEqual(array, state.array), false);
  });
});

class Custom {
  private state = { count: 0 };
  getCount() {
    return this.state.count;
  }
  @destructive()
  increment() {
    this.state.count++;
  }
  decriment() {
    this.state.count--;
  }
}
addDestructive(Custom.prototype.decriment);
