const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/if \(!screens\.hub\.classList\.contains\('hidden'\)\) showHub\(\);\n\s*if \(!screens\.upgrades\.classList\.contains\('hidden'\)\) renderUpgrades\(\);\n\s*if \(!screens\.prep\.classList\.contains\('hidden'\)\) startPrepPhase\(\);/, 
    "if (document.getElementById('screen-hub') && !document.getElementById('screen-hub').classList.contains('hidden')) if (typeof showHub === 'function') showHub();\n    if (document.getElementById('screen-upgrades') && !document.getElementById('screen-upgrades').classList.contains('hidden')) if (typeof renderUpgrades === 'function') renderUpgrades();\n    if (document.getElementById('screen-prep') && !document.getElementById('screen-prep').classList.contains('hidden')) if (typeof startPrepPhase === 'function') startPrepPhase();");

fs.writeFileSync('i18n.js', code);
