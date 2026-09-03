const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/hudLabels\[3\]\.textContent = t\('trd_obj'\);/, "hudLabels[3].textContent = 'AI Sentiment';\n        if (hudLabels.length >= 5) hudLabels[4].textContent = t('trd_obj');");

fs.writeFileSync('i18n.js', code);
