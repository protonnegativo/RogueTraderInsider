const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/function updateStaticText\(\) {/, "function updateStaticText() {\n    const $ = (id) => document.getElementById(id);");

fs.writeFileSync('i18n.js', code);
