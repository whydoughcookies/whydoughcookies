// script.js - Complete with Mobile & Carousel Fixes

let blurFromKeyboard = false;
const NEW_PRODUCT_MODAL_KEY = 'whyDoughNewProductShown';

// Global state
const state = {
  cart: [],
  currentProduct: null,
  currentQuantity: 1,
  selectedBoxSize: null
};

// Constants
const ORDER_LIMITS = {
  premade: { ogSet: 9, classic6: 9, samplers: 9 },
  custom: { perCookie: 20 }
};

const COOKIE_FLAVORS = [
  { name: "The Usual", price: 100, label: "Classic Chocolate chip" },
  { name: "The Red One", price: 110, label: "Red velvet w/ creamcheese" },
  { name: "The Burnt One", price: 110, label: "Dark w/ creamcheese" },
  { name: "The Bizz", price: 115, label: "Lotus Biscoff" },
  { name: "The Milky One", price: 110, label: "Classic white Chocolate" },
  { name: "Pistash", price: 120, label: "Pistachio Cream and bits" },
  { name: "The OT", price: 115, label: "Ovaltine w/ Crunch" },
  { name: "Nut-so-Carrot", price: 130, label: "Carrot cake inspired" },
  { name: "Espress-oh", price: 115, label: "Coffee w/ creamcheese" },
  { name: "Berry match", price: 120, label: "Matcha w/ berry bits" },
  //{ name: "The Minty One", price: 130, label: "peppermint" },
  //{ name: "The Campfire", price: 115, label: "S'mores" },
  //{ name: "Nut Usual", price: 120, label: "Walnut & Caramel" },
];

const DUBAI_FLAVORS = [
  { name: "the dubai chewy cookie", price: 150 },
  { name: "the biscoff chewy cookie", price: 150 }
];

const dubaiState = {
  boxSize: null,
  selections: []
};

const PRODUCT_DATA = {
  ogSet: {
    name: "The OG Set",
    description: "3 signature cookies — The Usual, The Red One, and The Burnt One. Each cookie weighs 100g+ of chewy indulgence.",
    price: 320,
    image: "images/og-set.JPG",
    id: "ogSet"
  },
  classic6: {
    name: "The Classics", 
    description: "All 6 classic flavors in one box: The Usual, The Red One, The Burnt One, The Milky One, PiStash, and The Bizz. Perfect for sharing or treating yourself.",
    price: 660,
    image: "images/classics.JPG", 
    id: "classic6"
  },
  samplers: {
    name: "Samplers",
    description: "6-piece sampler (50g each) — one of every classic flavor. Perfect for tasting it all.",
    price: 320,
    image: "images/samplers.JPG",
    id: "samplers"
  }
};

// DOM Utilities
const DOM = {
  get: (selector) => document.querySelector(selector),
  getAll: (selector) => document.querySelectorAll(selector),
  show: (element) => element?.classList?.remove('hidden'),
  hide: (element) => element?.classList?.add('hidden'),
  addClass: (element, className) => element?.classList?.add(className),
  removeClass: (element, className) => element?.classList?.remove(className)
};

