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
 * check Refnew object.
 */
export const isRefnew = (object: any) => {
  return isObject(object) && ProxySymbol in object;
};

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
  [StateSymbol]?: ProxyState<T>;
};

type ProxyState<T> = {
  instance: T;
  trapped: { [K in any]: RefnewObject<any> };
  refnew: () => RefnewObject<any>;
};

/**
 * create refnew object.
 */
export const refnew = <T extends any>(object: T): RefnewObject<T> => {
  if (!isObject(object)) {
    throw new Error("refnew supported only object type.");
  }
  return createObject(object, undefined, undefined);
};

/**
 * create refnew object.
 */
const createObject = <T extends any>(
  instance: RefnewObject<T>,
  parent?: RefnewObject<any>,
  parentKey?: any
): RefnewObject<T> => {
  /**
   * Proxy state.
   */
  const state: ProxyState<T> = {
    instance,
    trapped: {},
    refnew: () => {
      if (!parent && !parentKey) {
        return refnew; // the root state.
      }

      const newParent = parent[StateSymbol].refnew();
      return (newParent[parentKey] = createObject(
        instance,
        newParent,
        parentKey
      ));
    }
  };

  const refnew: RefnewObject<T> = Proxy.revocable<T & object>(instance, {
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
      if (isRefnew(value)) {
        state.trapped[key] = value;
        return true;
      }

      if (isChange(target[key], value)) {
        state.refnew();
      }
      target[key] = value;
      return true;
    },

    /**
     * trap object & method.
     */
    get(target: T, key: any) {
      if (key === StateSymbol) {
        return state;
      }

      if (state.trapped[key]) {
        return state.trapped[key];
      }

      const value = target[key];
      if (isObject(value)) {
        return (state.trapped[key] = createObject(value, refnew, key));
      } else if (isMethod(value)) {
        return (state.trapped[key] = createMethod(value, refnew));
      }
      return value;
    },

    /**
     * remove property.
     */
    deleteProperty(target: T, key: any) {
      if (state.trapped[key]) {
        delete state.trapped[key];
      }
      delete target[key];
      return true;
    }
  }).proxy as RefnewObject<T>;

  return refnew;
};

/**
 * create destructive method.
 */
const createMethod = (method: any, refnew: any): any => {
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
      const returns = method.apply(refnew[StateSymbol].instance, args);
      refnew[StateSymbol].refnew();
      return returns;
    }
  }).proxy;
};
