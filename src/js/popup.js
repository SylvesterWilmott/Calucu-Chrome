"use strict";

import * as storage from "./storage.js";
import * as win from "./window.js";
import * as i18n from "./localize.js";
import * as icons from "./icons.js";

let listNavItems; // List of elements available for keyboard navigation
let navIndex; // Index of currently selected element
let docData;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await loadData();
  loadNavigation();
  loadListeners();
  i18n.localize();
}

async function loadData() {
  let data = await getData();
  renderList(data);
}

function getData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, async function (items) {
      let data = [];

      for (let key in items) {
        if (items[key].type === "document") {
          // Remove documents with no text
          if (!items[key].text || items[key].text === "") {
            await storage.clear(key);
          } else {
            data.push(items[key]);
          }
        }
      }

      resolve(data);
    });
  });
}

function renderList(data) {
  let list = document.getElementById("list");
  let sorted = getListSortedByDate(data);
  list.innerHTML = "";

  if (data.length === 0) return;

  for (let item of sorted) {
    let li = document.createElement("li");
    li.setAttribute("data-id", item.id);
    li.classList.add("item", "nav-index");
    li.innerText = item.title;

    let delButton = document.createElement("button");
    delButton.innerText = "D";
    delButton.classList.add("delete");
    delButton.innerHTML = icons.ICON_CLOSE;

    li.appendChild(delButton);
    list.appendChild(li);
  }
}

function getListSortedByDate(arr) {
  return arr.sort((a, b) => {
    return new Date(b.modified) - new Date(a.modified);
  });
}

function loadListeners() {
  document.getElementById("list").addEventListener("click", onListClick, false);
  document.getElementById("actions").addEventListener("click", onActionsClick);
  document.addEventListener("keydown", documentOnKeydown, false);
  document.addEventListener("mouseout", documentOnMouseout, false);
}

async function onListClick(e) {
  if (e.target.classList.contains("delete")) {
    deleteSelectedDocument();
  } else {
    let id = listNavItems[navIndex].dataset.id;
    let data = await storage.load(id, { width: 550, height: 400 });
    await win.newWindow(id, data.width, data.height);
    window.close();
  }
}

function onActionsClick(e) {
  let target = e.target;

  switch (e.target.id) {
    case "new":
      createNewDocument();
      break;
  }
}

async function createNewDocument() {
  let id = getUid();
  await win.newWindow(id, 550, 400);
  window.close();
}

function getUid() {
  return Math.random().toString(36).slice(-8);
}

function documentOnKeydown(e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    navigateDirection(e);
  } else if (e.key === "Enter") {
    clickSelectedItem();
  } else if (e.key === "Backspace" && listNavItems[navIndex].dataset.id) {
    deleteSelectedDocument();
  }
}

function documentOnMouseout(e) {
  removeAllSelections();
}

async function deleteSelectedDocument() {
  let id = listNavItems[navIndex].dataset.id;

  if (confirm(chrome.i18n.getMessage("delete_confirm"))) {
    await storage.clear(id);
    await loadData();
    loadNavigation();
  }
}

function loadNavigation() {
  listNavItems = document.querySelectorAll(".nav-index");

  for (let [i, item] of listNavItems.entries()) {
    item.addEventListener(
      "mouseover",
      function (e) {
        removeAllSelections();
        this.classList.add("selected");
        navIndex = i;
      },
      false
    );
  }
}

function navigateDirection(e) {
  e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      setNavIndex();
      navigateListDown();
      break;
    case "ArrowUp":
      setNavIndex();
      navigateListUp();
      break;
  }

  if (navIndex <= 1) scrollToTop();
  if (navIndex >= listNavItems.length - 1) scrollToBottom();

  listNavItems[navIndex].classList.add("selected");
  listNavItems[navIndex].scrollIntoView({ block: "nearest" });
}

function setNavIndex() {
  if (!navIndex) {
    navIndex = 0;
  }
}

function navigateListDown() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== listNavItems.length - 1 ? navIndex++ : listNavItems.length - 1;
  } else {
    navIndex = 0;
  }
}

function navigateListUp() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== 0 ? navIndex-- : 0;
  } else {
    navIndex = listNavItems.length - 1;
  }
}

function clickSelectedItem(e) {
  let el = listNavItems[navIndex];
  el.click();
}

function removeAllSelections() {
  for (let item of listNavItems) {
    item.classList.remove("selected");
  }

  navIndex = null;
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}
