const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const str = `    ctx.beginPath();
    ctx.rect(plotL, plotT, plotW, plotH);
    ctx.clip();

    // --- Order Flow Walls ---
    if (metaState.upgrades.orderFlow > 0) {
        const wallH = plotH * 0.05;
        if (gameState.resWall) {
            ctx.fillStyle = 'rgba(255, 51, 102, 0.1)';
            ctx.fillRect(plotL, yOf(gameState.resWall) - wallH/2, plotW, wallH);
            ctx.fillStyle = 'rgba(255, 51, 102, 0.2)';
            ctx.fillRect(plotL, yOf(gameState.resWall), plotW, 1);
        }
        if (gameState.supWall) {
            ctx.fillStyle = 'rgba(0, 255, 102, 0.1)';
            ctx.fillRect(plotL, yOf(gameState.supWall) - wallH/2, plotW, wallH);
            ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
            ctx.fillRect(plotL, yOf(gameState.supWall), plotW, 1);
        }
    }
    
    // --- Future Shadow ---
    if (pat >= 3 && gameState.tradingActive) {
        const futureTicks = 120; // 4 seconds ahead
        ctx.beginPath();
        let simPrice = stock.price;
        let simVel = stock.vel;
        let simTrend = stock.trend;
        const ts = gameState.timeScale;
        const mom = Math.pow(PRICE_MOMENTUM, ts);
        
        ctx.moveTo(xOf(hist.length - 1), yOf(simPrice));
        for (let i = 1; i <= futureTicks; i++) {
            simVel = simVel * mom; // Predictable momentum (no noise)
            const simTradeTick = gameState.tradeTick + i;
            const wave = (Math.sin(simTradeTick / 150 + gameState.wavePhase) * 0.0004
                       + Math.sin(simTradeTick / 50 + gameState.wavePhase2) * 0.0002) 
                       * simPrice * ts;
            simPrice += simVel + wave + (simTrend * simPrice * 0.005 * ts);
            simTrend *= (1 - 0.01 * ts);
            ctx.lineTo(xOf(hist.length - 1 + i), yOf(simPrice));
        }
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(xOf(startIndex), yOf(hist[startIndex]));`;

code = code.replace(/ctx\.beginPath\(\);\n\s*ctx\.rect\(plotL, plotT, plotW, plotH\);\n\s*ctx\.clip\(\);\n\n\s*ctx\.beginPath\(\);\n\s*ctx\.moveTo\(xOf\(startIndex\), yOf\(hist\[startIndex\]\)\);/, str);

// Remove the old projection ray
code = code.replace(/if \(pat >= 3\) \{[\s\S]*?ctx\.stroke\(\);\n\s*\}/, "");

fs.writeFileSync('main.js', code);
