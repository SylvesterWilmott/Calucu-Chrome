"use strict";

export function newWindow(id, width, height) {
  return new Promise((resolve, reject) => {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL("../html/index.html?id=" + id),
        type: "popup",
        width: width,
        height: height,
      },
      function (win) {
        resolve();
      }
    );
  });
}

export function getWindowDimensions() {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused({ populate: false }, function (win) {
      let dimensions = {
        width: win.width,
        height: win.height,
      };
      resolve(dimensions);
    });
  });
}
