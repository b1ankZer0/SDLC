// "use client";
import { signal, computed, effect } from "@preact/signals-react";
import Cookies from "js-cookie";

const project = {
  name: "health",
  description: "This is a project",
};

class MySignal {
  constructor(data) {
    this.data = signal(data);
    this.computed = [];
    this.effect = [];
  }

  get r() {
    return this.data;
  }

  get value() {
    return this.data.v;
  }

  set value(newValue) {
    return (this.data.value = newValue);
  }

  setComputed(compute) {
    const com = computed(() => compute(this.data));
    this.computed.push(com);
    return com;
  }

  setEffect(eff) {
    const e = effect(() => eff(this.data));
    this.effect.push(e);
    return e;
  }

  remove() {
    this.computed = [];
    this.effect = [];
    this.data.value = null;
    this.data = null;
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }
}

export function mySignal(data: any): MySignal {
  return new MySignal(data);
}

class LocalStore {
  constructor(name) {
    this.name = project.name + ":" + name;
    this.data = new mySignal(0);
    const data = localStorage.getItem(this.name);
    if (data) {
      this.data.value = JSON.parse(data);
    }
    this.data.setEffect((x) =>
      localStorage.setItem(this.name, JSON.stringify(x.value))
    );
  }

  get r() {
    return this.data.r;
  }

  get value() {
    return this.data.value;
  }

  set value(data) {
    return (this.data.value = data);
  }
  setComputed(computed) {
    return this.data.setComputed(computed);
  }

  setEffect(eff) {
    return this.data.seteffect(eff);
  }
  remove() {
    localStorage.removeItem(this.name);
    if (this.data && typeof this.data.remove === "function") {
      this.data.remove();
    }
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }
}

export function localStore(name: string): LocalStore {
  return new LocalStore(name);
}

class SessionStore {
  constructor(name) {
    this.name = project.name + ":" + name;
    this.data = new mySignal(0);
    const data = sessionStorage.getItem(this.name);
    if (data) {
      this.data.value = JSON.parse(data);
    }
    this.data.setEffect((x) =>
      sessionStorage.setItem(this.name, JSON.stringify(x.value))
    );
  }

  get r() {
    return this.data.r;
  }

  get value() {
    return this.data.value;
  }

  set value(data) {
    return (this.data.value = data);
  }

  setComputed(computed) {
    return this.data.setComputed(computed);
  }

  setEffect(eff) {
    return this.data.seteffect(eff);
  }
  remove() {
    sessionStorage.removeItem(this.name);
    if (this.data && typeof this.data.remove === "function") {
      this.data.remove();
    }
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }
}

export function sessionStore(name: string): SessionStore {
  return new SessionStore(name);
}

class CookieStore {
  constructor(name) {
    this.name = `${project.name}:${name}`;
    this.data = new mySignal(0);

    const cookieData = Cookies.get(this.name);
    if (cookieData) {
      this.data.value = JSON.parse(cookieData);
    }

    // Set up effect to update cookie when value changes
    this.data.setEffect((signal) => {
      Cookies.set(this.name, JSON.stringify(signal.value), {
        expires: 7, // Cookie expires in 7 days
        path: "/", // Available across the site
        sameSite: "strict",
      });
    });
  }

  get r() {
    return this.data.r;
  }

  get value() {
    return this.data.value;
  }

  set value(data) {
    this.data.value = data;
  }

  setComputed(compute) {
    return this.data.setComputed(compute);
  }

  setEffect(eff) {
    return this.data.setEffect(eff);
  }

  remove() {
    Cookies.remove(this.name, { path: "/" });
    if (this.data && typeof this.data.remove === "function") {
      this.data.remove();
    }
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }
}

export function cookieStore(name: string): CookieStore {
  return new CookieStore(name);
}

class UrlStore {
  constructor(name) {
    this.name = name;
    this.data = new mySignal(0);

    const params = new URLSearchParams(window.location.search);
    const storedData = params.get(this.name);
    if (storedData) {
      this.data.value = JSON.parse(storedData);
    }

    this.data.setEffect((signal) => {
      const params = new URLSearchParams(window.location.search);
      params.set(this.name, JSON.stringify(signal.value));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    });
  }

  get r() {
    return this.data.r;
  }

  get value() {
    return this.data.value;
  }

  set value(data) {
    this.data.value = data;
  }

  setComputed(compute) {
    return this.data.setComputed(compute);
  }

  setEffect(eff) {
    return this.data.setEffect(eff);
  }

  // Helper to get shareable URL
  getShareableURL() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  remove() {
    const params = new URLSearchParams(window.location.search);
    params.delete(this.name);

    const newUrl = `${window.location.pathname}`;
    window.history.pushState({}, "", newUrl);

    if (this.data && typeof this.data.remove === "function") {
      this.data.remove();
    }

    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }
}

export function urlStore(name: string): UrlStore {
  return new UrlStore(name);
}

class IndexDbStore {
  constructor(name) {
    this.name = project.name + ":" + name;
    this.data = new mySignal(0);

    // Retrieve stored data from IndexedDB
    indexDbStore
      .dbGet(this.name)
      .then((result) => {
        if (result) {
          this.data.value = result.value;
        }
      })
      .catch((err) => {
        console.error("Error retrieving from IndexedDB:", err);
      });

    // Register an effect to update IndexedDB whenever the signal changes
    this.data.setEffect((newValue) => {
      indexDbStore
        .dbSet(this.name, newValue.value)
        .then(() => {
          console.log("Value saved to IndexedDB.");
        })
        .catch((err) => {
          console.error("Error saving to IndexedDB:", err);
        });
    });
  }

  get r() {
    return this.data.r;
  }

  get value() {
    return this.data.value;
  }

  set value(data) {
    this.data.value = data;
  }

  setComputed(computed) {
    return this.data.setComputed(computed);
  }

  setEffect(eff) {
    return this.data.setEffect(eff);
  }

  remove() {
    indexDbStore
      .dbDelete(this.name)
      .then(() => {
        console.log("Value deleted from IndexedDB.");
      })
      .catch((err) => {
        console.error("Error deleting from IndexedDB:", err);
      });

    if (this.data && typeof this.data.remove === "function") {
      this.data.remove();
    }
    for (const prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        delete this[prop];
      }
    }
  }

  static dbGet(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MyDatabase", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("signals")) {
          db.createObjectStore("signals", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("signals", "readonly");
        const store = transaction.objectStore("signals");
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static dbSet(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MyDatabase", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("signals")) {
          db.createObjectStore("signals", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("signals", "readwrite");
        const store = transaction.objectStore("signals");
        const putRequest = store.put({ id: key, value });
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(putRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static dbDelete(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MyDatabase", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("signals")) {
          db.createObjectStore("signals", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("signals", "readwrite");
        const store = transaction.objectStore("signals");
        const deleteRequest = store.delete(key);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
        // Close the database when transaction is complete
        transaction.oncomplete = () => db.close();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export function indexDbStore(name: string): IndexDbStore {
  return new IndexDbStore(name);
}

type StorageType =
  | "mySignal"
  | "localStore"
  | "sessionStore"
  | "cookieStore"
  | "urlStore"
  | "indexDbStore";

const allStoreFun: Record<StorageType, any> = {
  mySignal: mySignal,
  localStore: localStore,
  sessionStore: sessionStore,
  cookieStore: cookieStore,
  urlStore: urlStore,
  indexDbStore: indexDbStore,
};

const storeType: Record<StorageType, any> = {
  mySignal: MySignal,
  localStore: LocalStore,
  sessionStore: SessionStore,
  cookieStore: CookieStore,
  urlStore: UrlStore,
  indexDbStore: IndexDbStore,
};

const store = {};

export function globalStore(type: StorageType, name: string, value?: any) {
  if (store[name]) throw new Error(`Store already exists name: ${name}`);

  const selectedStore = allStoreFun[type];
  if (!selectedStore) throw new Error(`Invalid store type: ${type}`);

  store[name] = selectedStore(name);
  if (value) store[name].value = value;

  return store[name];
}

export function getStore(name: string) {
  if (!store[name]) throw new Error(`Store does not exist name: ${name}`);
  return store[name];
}

export function removeStore(name: string): void {
  if (!store[name]) throw new Error(`Store does not exist name: ${name}`);
  store[name].remove();
  delete store[name];
}

export function clearAllStores(): void {
  for (const name in store) {
    if (Object.prototype.hasOwnProperty.call(store, name)) {
      store[name].remove();
      delete store[name];
    }
  }
}

export function getFormObj(e: any): object {
  e.preventDefault();
  const formData = new FormData(e.target);
  const obj = Object.fromEntries(formData.entries());
  return obj;
}
