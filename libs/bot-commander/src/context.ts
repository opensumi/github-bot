export function createContext<T>(): Context<T> {
  let contextValue: T;
  const Provider = (value: T, callback: () => void) => {
    const currentValue = contextValue;
    contextValue = value;
    callback();
    contextValue = currentValue;
  };

  const Consumer = () => {
    return contextValue;
  };

  return {
    Provider,
    Consumer,
  };
}

type Context<T> = {
  Provider: (value: T, callback: () => void) => void;
  Consumer: () => T;
};

export function useContext<T>(contextRef: Context<T>) {
  return contextRef.Consumer();
}
