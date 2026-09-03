const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<div class="hud-item">\n\s*<span class="hud-label">Objective<\/span>/, `<div class="hud-item">
                        <span class="hud-label">AI Sentiment</span>
                        <span id="ai-sentiment" class="hud-value" style="color: #00ff66;">ANALYZING</span>
                    </div>
                    <div class="hud-item">
                        <span class="hud-label">Objective</span>`);
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('main.js', 'utf8');
js = js.replace(/const tradeObjective = \$\('trade-objective'\);/, "const tradeObjective = $('trade-objective');\nconst aiSentiment = $('ai-sentiment');");

const sentimentLogic = `
    if (metaState.upgrades.patternRec > 0 && aiSentiment) {
        // Calculate probability of uptrend based on trend + wave velocity
        const waveVel = (Math.cos(gameState.tradeTick / 150 + gameState.wavePhase) * (1/150) * 0.0004
               + Math.cos(gameState.tradeTick / 50 + gameState.wavePhase2) * (1/50) * 0.0002) * stock.price;
        const totalForce = stock.trend * 0.005 + waveVel * 10; 
        
        let prob = 50 + (totalForce * 1000);
        prob = Math.max(1, Math.min(99, prob));
        
        const isBull = prob >= 50;
        setText(aiSentiment, prob.toFixed(1) + '% ' + (isBull ? 'BULL' : 'BEAR'));
        aiSentiment.style.color = isBull ? '#00ff66' : '#ff3366';
        aiSentiment.parentElement.classList.remove('hidden');
    } else if (aiSentiment) {
        aiSentiment.parentElement.classList.add('hidden');
    }
`;

js = js.replace(/setText\(tradeTime, gameState\.timeString\);/, "setText(tradeTime, gameState.timeString);\n" + sentimentLogic);

fs.writeFileSync('main.js', js);
