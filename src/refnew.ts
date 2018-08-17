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

const isObject = (object: any) => {
  return typeof object === "object" && object !== null;
};
const isMethod = (method: any) => {
  return typeof method === "function" && destructives.has(method);
};
const isChange = (x: any, y: any) => {
  return x !== y;
};

type RefnewObject<T> = T & {
  [StateSymbol]?: {
    instance: T;
    refnew: () => void;
  };
};

/**
 * create refnew object.
 */
export const refnew = <T extends any>(object: T): T => {
  if (!isObject(object)) {
    throw new Error("refnew supported only object type.");
  }
  return createObject(object, {}, 0);
};

/**
 * create refnew object.
 */
const createObject = <T extends any>(
  instance: RefnewObject<T>,
  trapped: { [K in any]: true },
  version: number,
  parent?: RefnewObject<any>,
  parentKey?: any
): T => {
  /**
   * Object version property.
   * @NOTE this property will trap in Proxy#get.
   */
  instance[VersionProperty] = true;

  /**
   * Proxy state.
   */
  instance[StateSymbol] = {
    instance,
    refnew: () => {
      if (parent && parentKey) {
        parent[parentKey] = createObject(
          instance,
          trapped,
          version + 1,
          parent,
          parentKey
        );
        if (!!parent[StateSymbol]) {
          parent[StateSymbol].refnew();
        }
      }
    }
  };

  return Proxy.revocable<T & object>(instance, {
    /**
     * check object is proxy.
     */
    has(target: T, key: any) {
      return key === ProxySymbol || key in target;
    },

    /**
     * trap mutation.
     */
    set(target: T, key: any, value: any) {
      if (isChange(target[key], value)) {
        target[StateSymbol].refnew();
      }
      target[key] = value;
      return true;
    },

    /**
     * trap object & method.
     */
    get(target: T, key: any) {
      if (key === VersionProperty) {
        return version;
      }

      if (trapped[key]) {
        return target[key];
      }
      trapped[key] = true;

      const value = target[key];
      if (isObject(value)) {
        return (target[key] = createObject(value, trapped, 0, target, key));
      } else if (isMethod(value)) {
        return (target[key] = createMethod(value, target));
      }
      return value;
    }
  }).proxy;
};

/**
 * create destructive method.
 */
const createMethod = (method: any, target: any): any => {
  return Proxy.revocable(method, {
    /**
     * check object is proxy.
     */
    has(target: any, key: any) {
      return key === ProxySymbol || key in target;
    },

    /**
     * trap destructive method.
     */
    apply(method: Function, _: any, args: any[]) {
      const returns = method.apply(target[StateSymbol].instance, args);
      target[StateSymbol].refnew();
      return returns;
    }
  }).proxy;
};
