import { refnew } from "../src/index";
import produce from "immer";
import { bench } from "@thi.ng/bench";

const RUN_COUNT = 500000;

const createState = () => ({
  nest1: {
    nest2: {
      nest3: {
        value: 1
      }
    }
  }
});

console.log(`# ${RUN_COUNT}/kind`);
console.log();

kind("nested property mutate: refnew", () => {
  const state = refnew(createState());
  bench(() => {
    state.nest1.nest2.nest3.value++;
  }, RUN_COUNT);
});

kind("nested property mutate: immer", () => {
  let state = createState();
  bench(() => {
    state = produce(state, state => {
      state.nest1.nest2.nest3.value++;
    });
  }, RUN_COUNT);
});

kind("nested property access: refnew", () => {
  const state = refnew(createState());
  bench(() => {
    state.nest1.nest2.nest3.value;
  }, RUN_COUNT);
});

kind("nested property access: immer", () => {
  const state = produce(createState(), state => {
    state.nest1.nest2.nest3.value++;
  });

  bench(() => {
    state.nest1.nest2.nest3.value;
  }, RUN_COUNT);
});

kind("nested property access: native proxy", () => {
  const state = Proxy.revocable(createState(), {
    get(target: any, key: any) {
      const value = target[key];
      if (typeof value === "object") {
        return Proxy.revocable(value, {}).proxy;
      }
      return value;
    }
  }).proxy;
  bench(() => {
    state.nest1.nest2.nest3.value;
  }, RUN_COUNT);
});

kind("nested property access: native object", () => {
  const state = { value: 0 };
  bench(() => {
    state.value;
  }, RUN_COUNT);
});

function kind(name: string, fn: () => void) {
  console.log(`## ${name}`);
  fn();
  console.log();
}
