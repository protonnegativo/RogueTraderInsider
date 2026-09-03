const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/btn_buy: "Buy \/ Cover <small>\(B\)<\/small>",\n\s*btn_sell: "Sell \/ Short <small>\(S\)<\/small>",/, 
    'btn_buy: "Buy <small>(B)</small>",\n        btn_sell: "Sell <small>(S)</small>",\n        btn_cover: "Cover <small>(B)</small>",\n        btn_short: "Short <small>(S)</small>",');

code = code.replace(/btn_buy: "Comprar \/ Cobrir <small>\(B\)<\/small>",\n\s*btn_sell: "Vender \/ Short <small>\(S\)<\/small>",/, 
    'btn_buy: "Comprar <small>(B)</small>",\n        btn_sell: "Vender <small>(S)</small>",\n        btn_cover: "Cobrir <small>(B)</small>",\n        btn_short: "Short <small>(S)</small>",');

code = code.replace(/if \(\$\('btn-trade-buy'\)\) \$\('btn-trade-buy'\)\.innerHTML = t\('btn_buy'\);\n\s*if \(\$\('btn-trade-sell'\)\) \$\('btn-trade-sell'\)\.innerHTML = t\('btn_sell'\);/, 
    "if ($('btn-trade-buy')) $('btn-trade-buy').innerHTML = t('btn_buy');\n    if ($('btn-trade-sell')) $('btn-trade-sell').innerHTML = t('btn_sell');\n    if ($('btn-trade-cover')) $('btn-trade-cover').innerHTML = t('btn_cover');\n    if ($('btn-trade-short')) $('btn-trade-short').innerHTML = t('btn_short');");

fs.writeFileSync('i18n.js', code);
