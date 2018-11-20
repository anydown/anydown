export const LOCALSTORAGE_KEY = "anydown_items";
export const LOCALSTORAGE_LAST_EDITED_FILE = "anydown_last_edited_file";
import { example } from "./example.js";

export function saveLocalStorage(key, data) {
  let storage = loadLocalStorage();
  if (storage) {
    storage[key] = data;
  } else {
    storage = {};
  }
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(storage));
}

export function saveLocalStorageAll(data) {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
}

export function loadLocalStorage() {
  const data = localStorage.getItem(LOCALSTORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    default: example
  };
}
