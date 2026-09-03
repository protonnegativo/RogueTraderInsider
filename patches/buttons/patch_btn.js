const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Remove global lang button
code = code.replace(/<div id="lang-toggle"[\s\S]*?<\/div>\n    <div id="game-container">/, '    <div id="game-container">');

// Add it to hub
code = code.replace(/<div id="screen-hub" class="screen hidden">/, '<div id="screen-hub" class="screen hidden">\n            <div id="lang-toggle" style="position: absolute; top: 10px; right: 10px;"><button id="btn-lang" class="btn-ghost" style="padding: 5px 10px; font-size: 0.8rem;">PT-BR</button></div>');

fs.writeFileSync('index.html', code);
