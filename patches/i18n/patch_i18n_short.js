const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/btn_buy: "Buy <small>\\(B\\)<\\/small>",\n\s*btn_sell: "Sell <small>\\(S\\)<\\/small>",/, 
    "btn_buy: \"Buy / Cover <small>(B)</small>\",\n        btn_sell: \"Sell / Short <small>(S)</small>\",");
code = code.replace(/btn_buy: "Comprar <small>\\(B\\)<\\/small>",\n\s*btn_sell: "Vender <small>\\(S\\)<\\/small>",/, 
    "btn_buy: \"Comprar / Cobrir <small>(B)</small>\",\n        btn_sell: \"Vender / Short <small>(S)</small>\",");

fs.writeFileSync('i18n.js', code);
