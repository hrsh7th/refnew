# refnew

proxy based state management utility.

# why?

Typically React apps needs to implement `shouldComponentUpdate` for performance.
But it tends to be ugly implementation because object references are same always.
`redux` and `immer` are try solve this problem by immutability.

I tried implementing `refnew` to solve this problem by other way.
`refnew` provide way to manage object references.
If you modify object's value, you can check object equality by `===`.

See refnew's test.

# install

`npm install refnew`

# note

- runtime environment required `Proxy`.
- refnew is hobby project now, you don't use this in production yet.
- refnew is fast to mutate but property access is slow.
  - it's means `refnew is maybe slow in real world apps`.
  - if you use chrome62 or higher, refnew is meybe better performance.
    - [see this article.](https://v8project.blogspot.com/2017/10/optimizing-proxies.html)
  - see `performance` section.
- inspired by `mweststrate/immer`.

# binding

- react
  - [refnew-react](https://github.com/hrsh7th/refnew-react)

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

// off course, object are equal.
assert.equal(todos, state.todos);

// modify part of state.
todos.push({ name: "my todo3", status: "in-progress" });

// can check object equality by `===`.
assert.notEqual(todos, state.todos);
```

# performance

`npm run perf` //=> node v10.9.0

```sh
# 500000/kind

## nested property mutate: refnew
1059

## nested property access: refnew
128

## nested property mutate: immer
2490

## nested property access: immer
4
```

# todo

- support more built-in classes.
- support edge case and messages.
- test on real world apps.
