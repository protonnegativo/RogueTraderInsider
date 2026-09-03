const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/const btnTradeBuy = \$\('btn-trade-buy'\);\n\s*const btnTradeSell = \$\('btn-trade-sell'\);/, 
    "const btnTradeBuy = $('btn-trade-buy');\nconst btnTradeCover = $('btn-trade-cover');\nconst btnTradeSell = $('btn-trade-sell');\nconst btnTradeShort = $('btn-trade-short');");

// In bindEvents()
code = code.replace(/btnTradeBuy\.addEventListener\('click', buyStock\);/, 
    "btnTradeBuy.addEventListener('click', buyStock);\n    if (btnTradeCover) btnTradeCover.addEventListener('click', buyStock);");
code = code.replace(/btnTradeSell\.addEventListener\('click', sellStock\);/, 
    "btnTradeSell.addEventListener('click', sellStock);\n    if (btnTradeShort) btnTradeShort.addEventListener('click', sellStock);");

// In renderTrading()
const renderLogic = `    btnTradeBuy.disabled = !gameState.tradingActive || tradableQty('buy') <= 0;
    btnTradeSell.disabled = !gameState.tradingActive || tradableQty('sell') <= 0;
    if (btnTradeCover) btnTradeCover.disabled = btnTradeBuy.disabled;
    if (btnTradeShort) btnTradeShort.disabled = btnTradeSell.disabled;

    if (p.shares > 0) {
        btnTradeBuy.classList.remove('hidden');
        if (btnTradeCover) btnTradeCover.classList.add('hidden');
        btnTradeSell.classList.remove('hidden');
        if (btnTradeShort) btnTradeShort.classList.add('hidden');
    } else if (p.shares < 0) {
        btnTradeBuy.classList.add('hidden');
        if (btnTradeCover) btnTradeCover.classList.remove('hidden');
        btnTradeSell.classList.add('hidden');
        if (btnTradeShort) btnTradeShort.classList.remove('hidden');
    } else {
        btnTradeBuy.classList.remove('hidden');
        if (btnTradeCover) btnTradeCover.classList.add('hidden');
        btnTradeSell.classList.add('hidden');
        if (btnTradeShort) btnTradeShort.classList.remove('hidden');
    }`;

code = code.replace(/btnTradeBuy\.disabled = !gameState\.tradingActive \|\| tradableQty\('buy'\) <= 0;\n\s*btnTradeSell\.disabled = !gameState\.tradingActive \|\| tradableQty\('sell'\) <= 0;/, renderLogic);

fs.writeFileSync('main.js', code);
