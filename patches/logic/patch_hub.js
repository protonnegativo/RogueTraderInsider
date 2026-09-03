const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/const subtitle = document\.querySelector\('#screen-hub \.subtitle'\);/g, "");
code = code.replace(/if \(subtitle\) subtitle\.innerHTML = \`instance <span id="hub-gen">\$\{metaState\.generation\}<\/span> · week <span id="hub-week">\$\{metaState\.week\}<\/span>\`;/g, 
    "const subtitle = document.querySelector('#screen-hub .subtitle');\n    if (subtitle) subtitle.innerHTML = t('hub_inst') + ` <span id=\"hub-gen\">${metaState.generation}</span> · ` + t('hub_wk') + ` <span id=\"hub-week\">${metaState.week}</span>`;");

fs.writeFileSync('main.js', code);
