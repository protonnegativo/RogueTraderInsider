const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/chartOverlay\.classList\.add\('hidden'\);/g, "chartOverlay.style.display = 'none';");
code = code.replace(/chartOverlay\.classList\.remove\('hidden'\);/g, "chartOverlay.style.display = 'flex';");

fs.writeFileSync('main.js', code);
