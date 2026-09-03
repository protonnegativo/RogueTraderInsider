const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/today: "today"/, "today: \"today\",\n        pre_close: \"MARKET CLOSES IN 30 MINUTES.\",\n        pre_open: (s) => `MARKET OPENS IN \${s}...`");
code = code.replace(/today: "hoje"/, "today: \"hoje\",\n        pre_close: \"O MERCADO FECHA EM 30 MINUTOS.\",\n        pre_open: (s) => `O MERCADO ABRE EM \${s}...`");

fs.writeFileSync('i18n.js', code);
