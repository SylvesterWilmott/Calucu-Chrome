"use strict";

export function save(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      function () {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        resolve();
      }
    );
  });
}

export function load(key, defaults) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      {
        [key]: defaults,
      },
      function (value) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        resolve(value[key]);
      }
    );
  });
}

export function clear(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
      resolve();
    });
  });
}
