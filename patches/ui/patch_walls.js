const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/gameState\.wavePhase2 = Math\.random\(\) \* 100;/, 
    "gameState.wavePhase2 = Math.random() * 100;\n    gameState.resWall = gameState.stock.openPrice * (1 + 0.06 + Math.random() * 0.04);\n    gameState.supWall = gameState.stock.openPrice * (1 - 0.06 - Math.random() * 0.04);");

const tickLogic = `
    // Order Flow Support/Resistance bounce
    if (metaState.upgrades.orderFlow > 0) {
        const bouncePow = metaState.upgrades.orderFlow * 0.0005 * ts * stock.price;
        if (stock.price > gameState.resWall * 0.98) {
            stock.vel -= bouncePow;
        }
        if (stock.price < gameState.supWall * 1.02) {
            stock.vel += bouncePow;
        }
    }
    
    // Pending insider tip
`;
code = code.replace(/\/\/ Pending insider tip/m, tickLogic);

fs.writeFileSync('main.js', code);
