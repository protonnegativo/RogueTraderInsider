const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/gameState\.tradeTick = 0;/, "gameState.tradeTick = 0;\n    gameState.wavePhase = Math.random() * 100;\n    gameState.wavePhase2 = Math.random() * 100;");

const waveLogic = `    // Macro market waves to give Technical Analysis (SMAs) a real purpose.
    const wave = (Math.sin(gameState.tradeTick / 150 + gameState.wavePhase) * 0.0015
               + Math.sin(gameState.tradeTick / 50 + gameState.wavePhase2) * 0.0008) 
               * stock.price * ts;
               
    stock.price += stock.vel + wave + (stock.trend * stock.price * 0.005 * ts);`;
    
code = code.replace(/stock\.price \+= stock\.vel \+ \(stock\.trend \* stock\.price \* 0\.005 \* ts\);/, waveLogic);

fs.writeFileSync('main.js', code);
