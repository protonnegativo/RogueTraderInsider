const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<button id="btn-trade-buy" class="huge-btn btn-buy">Buy <small>\(B\)<\/small><\/button>/, 
    '<button id="btn-trade-buy" class="huge-btn btn-buy">Buy <small>(B)</small></button>\n                        <button id="btn-trade-cover" class="huge-btn btn-buy hidden">Cover <small>(B)</small></button>');
    
html = html.replace(/<button id="btn-trade-sell" class="huge-btn btn-sell">Sell <small>\(S\)<\/small><\/button>/, 
    '<button id="btn-trade-sell" class="huge-btn btn-sell">Sell <small>(S)</small></button>\n                        <button id="btn-trade-short" class="huge-btn btn-sell hidden">Short <small>(S)</small></button>');

fs.writeFileSync('index.html', html);
