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

kind("nested property access: refnew", () => {
  const state = refnew(createState());
  bench(() => {
    state.nest1.nest2.nest3.value;
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

kind("nested property access: immer", () => {
  const state = produce(createState(), state => {
    state.nest1.nest2.nest3.value++;
  });

  bench(() => {
    state.nest1.nest2.nest3.value;
  }, RUN_COUNT);
});

function kind(name: string, fn: () => void) {
  console.log(`## ${name}`);
  fn();
  console.log();
}
