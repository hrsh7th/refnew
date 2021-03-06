import assert from "assert";
import { refnew } from "../src/refnew";
import { destructive, addDestructive } from "../src/destructives";
import shallowequal from "shallowequal";

// Object.
test("Object", () => {
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
  test(`Array#${name}(${args})`, () => {
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
  test(`Date#${name}`, () => {
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
    test(`Custom#${name}`, () => {
      const state = refnew({ custom: new Custom() });
      const custom = state.custom;
      assert.equal(custom, state.custom);
      // @ts-ignore
      custom[name]();
      assert.equal(custom === state.custom, equality);
    });
  }
);

// shallow-equal.
test("shallow-equal", () => {
  const state = refnew({ array: [{ value: 0 }] });
  const array = state.array;
  assert.equal(array, state.array);
  array[0].value++;
  assert.equal(shallowequal(array, state.array), false);
});

// update all parent.
test("update all parent", () => {
  const state = refnew({
    object1: {
      object2: {
        object3: {
          value: 0
        }
      }
    }
  });
  const object1 = state.object1;
  const object2 = object1.object2;
  const object3 = object2.object3;
  assert.equal(state.object1, object1);
  assert.equal(state.object1.object2, object2);
  assert.equal(state.object1.object2.object3, object3);
  object3.value++;
  assert.notEqual(state.object1, object1);
  assert.notEqual(state.object1.object2, object2);
  assert.notEqual(state.object1.object2.object3, object3);
});

// same layer property.
test("same layer property.", () => {
  const state = refnew({
    object1: {
      value: 0
    },
    object2: {
      value: 0
    }
  });
  const object1 = state.object1;
  assert.equal(state.object1, object1);
  const object2 = state.object2;
  assert.equal(state.object2, object2);

  state.object1.value++;

  assert.notEqual(state.object1, object1);
  assert.equal(state.object2, object2);
});

// remove property.
test("remove property", () => {
  const state = refnew({ object: { value: 0 } });
  const object = state.object;
  assert.equal(object, state.object);
  delete state.object;
  assert.equal(undefined, state.object);
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
