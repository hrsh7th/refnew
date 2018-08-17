# refnew

proxy based state management utility.

# install

`npm install refnew`

# usage

### basic.

```js
import assert from "assert";
import { refnew } from "refnew";

// create your state.
const state = refnew({
  todos: [
    { name: "my todo1", status: "in-progress" },
    { name: "my todo2", status: "done" }
  ]
});

// pick part of state.
const todos = state.todos;

// modify part of state.
todos.push({ name: "my todo3", status: "in-progress" });

// check equality.
assert.notEqual(todos, state.todos);
```

### custom class with annotation.

```js
import assert from "assert";
import { refnew, destructive } from "refnew";

// define your custom class.
class TodoList {
  _todos = [];

  @destructive()
  add(todo) {
    this._todos.push(todo);
  }
}

// create your state.
const state = refnew({
  todos: new TodoList()
});

// pick part of state.
const todos = state.todos;

// modify part of state.
todos.add({ name: "my todo3", status: "in-progress" });

// check equality.
assert.notEqual(todos, state.todos);
```

### custom class without annotation.

```js
import assert from "assert";
import { refnew, addDestructive } from "refnew";

// define your custom class.
class TodoList {
  _todos = [];

  add(todo) {
    this._todos.push(todo);
  }
}

addDestructive(TodoList.prototype.add);

// create your state.
const state = refnew({
  todos: new TodoList()
});

// pick part of state.
const todos = state.todos;

// modify part of state.
todos.add({ name: "my todo3", status: "in-progress" });

// check equality.
assert.notEqual(todos, state.todos);
```

# todo

- support more built-in classes.
- support edge case and messages.
- test on real world apps.

# limitation

- runtime environment required `Proxy`.
- refnew is fast to update but property access is slow.
  - it's means `refnew is maybe slow in real world apps`.
  - if you use chrome62 or higher, refnew is meybe better performance.

# performance

`npm run perf` //=> node v8.9.3

```sh
## nested property mutate: refnew
1342

## nested property mutate: immer
3936

## nested property access: refnew
494

## nested property access: immer
4

## nested property access: native proxy
196

## nested property access: native object
4
```

`npm run perf` //=> node v10.9.0

```sh
# 500000/kind

## nested property mutate: refnew
540

## nested property mutate: immer
2627

## nested property access: refnew
121

## nested property access: immer
5

## nested property access: native proxy
74

## nested property access: native object
4
```

# more

- react binding
  - [refnew-react](https://github.com/hrsh7th/refnew-react)

# note

- inspired by `mweststrate/immer`.
- don't use this in production.
