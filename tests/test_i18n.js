const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const i18n = fs.readFileSync('i18n.js', 'utf8');
const main = fs.readFileSync('main.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

try {
    window.eval(i18n);
    window.eval(main);
    console.log("Scripts loaded successfully.");
    
    // Simulate click
    const btn = window.document.getElementById('btn-lang');
    console.log("Current lang:", window.currentLang);
    console.log("Button text before:", btn.textContent);
    btn.click();
    console.log("Current lang after click:", window.currentLang);
    console.log("Button text after click:", btn.textContent);
    console.log("Hub target text:", window.document.querySelector('#screen-hub .obj-row span').textContent);
} catch (e) {
    console.error("Error:", e);
}
