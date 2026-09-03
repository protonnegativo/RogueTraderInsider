const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const win = dom.window;

// Mock audio
win.Audio = class { play() {} };

const i18n = fs.readFileSync('i18n.js', 'utf8');
const main = fs.readFileSync('main.js', 'utf8');

win.eval(i18n);
try {
    win.eval(main);
    win.btnUpgrades.click();
    console.log("No errors!");
} catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
}
