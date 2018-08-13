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

- check performance.
- support more built-in classes.
- support edge case and messages.
- test on real world apps.

# limitation

- runtime environment required `Proxy`.

# note

- inspired by `mweststrate/immer`.
- don't use this production.
