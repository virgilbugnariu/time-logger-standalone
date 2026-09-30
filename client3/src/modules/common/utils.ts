import { eifActions } from "../../store";

type ApiValidationError = {
  code: number;
  message: string;
  data?: {
    [key: string]: {
      code: string;
      message: string;
    };
  };
};

export function dispatchApiValidationResponse(path: string, error?: ApiValidationError) {
  if (error?.code !== 400) {
    return;
  }

  Object.keys(error.data || {})
    .forEach(key => {
      if (error.data && error.data[key]) {
        eifActions.setError(`${path}.${key}`, error.data[key].message)
      }
    });
}


let uniqueId = 0;
export function getUniqueId() {
  return ++uniqueId;
}

export function setToStorage<T>(key:string, data: T) {
  if (localStorage) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function getFromStorage<T>(key: string): T | null {
  if (localStorage) {
    const dataStringified = localStorage.getItem(key);
    try {
      return JSON.parse(dataStringified) as T;
    } catch (err) {
      return null;
    }
  }

  return null;
}

