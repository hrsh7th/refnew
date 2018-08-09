import { destructives } from "./destructives";

/**
 * Symbol for proxy.
 */
export const ProxySymbol: unique symbol = Symbol();

/**
 * Symbol for proxy state.
 */
export const StateSymbol: unique symbol = Symbol();

/**
 * Symbol for shallow equals.
 */
export const VersionProperty: string = "$$refnew-version-property";

const isObjectTarget = (object: any) =>
  object !== null && typeof object === "object" && !(ProxySymbol in object);
const isMethodTarget = (method: any) =>
  typeof method === "function" && destructives.has(method);
const isChange = (x: any, y: any) => x !== y;

type RefnewObject<T> = T & {
  [StateSymbol]?: {
    parent?: RefnewObject<any>;
    parentKey?: PropertyKey;
    instance: T;
    version: number;
    refnew: () => void;
  };
};

/**
 * create refnew object.
 */
export const refnew = <T extends any>(object: T): T => {
  if (!isObjectTarget(object)) {
    throw new Error("refnew supported only object type.");
  }
  return createObject(object);
};
export default refnew;

/**
 * create refnew object.
 */
const createObject = <T extends any>(
  instance: RefnewObject<T>,
  parent?: RefnewObject<any>,
  parentKey?: PropertyKey,
  version: number = 0
): T => {
  const { proxy } = Proxy.revocable<T & object>(instance, {
    /**
     * check object is proxy.
     */
    has(target: T, key: PropertyKey) {
      return key === ProxySymbol || key in target;
    },

    /**
     * trap mutation.
     */
    set(target: T, key: PropertyKey, value: any) {
      if (isChange(target[key], value)) {
        target[StateSymbol].refnew();
      }
      target[key] = value;
      return true;
    },

    /**
     * trap object & method.
     */
    get: (target: T, key: PropertyKey): any => {
      if (key === VersionProperty) {
        return version;
      }

      const value = target[key];
      if (isObjectTarget(value)) {
        target[key] = createObject(value, target, key);
      }
      if (isMethodTarget(value)) {
        target[key] = createMethod(value, target);
      }
      return target[key];
    }
  });

  /**
   * Object version property.
   * @NOTE this property will trap in Proxy#get.
   */
  instance[VersionProperty] = true;

  /**
   * Proxy state.
   */
  instance[StateSymbol] = {
    parent,
    parentKey,
    instance,
    version,
    refnew: (depth: number = 0) => {
      if (parent && parentKey) {
        parent[parentKey] = createObject(
          instance,
          parent,
          parentKey,
          version + 1
        );
        if (!!parent[StateSymbol] && depth === 0) {
          parent[StateSymbol].refnew(depth + 1);
        }
      }
    }
  };

  return proxy;
};

/**
 * create destructive method.
 */
const createMethod = (fn: any, target: any): any => {
  const { proxy } = Proxy.revocable(fn, {
    /**
     * check object is proxy.
     */
    has(target: any, key: PropertyKey) {
      return key === ProxySymbol || key in target;
    },

    /**
     * trap destructive method.
     */
    apply(fn: Function, _: any, args: any[]): any {
      const returns = fn.apply(target[StateSymbol].instance, args);
      target[StateSymbol].refnew();
      return returns;
    }
  });
  return proxy;
};
