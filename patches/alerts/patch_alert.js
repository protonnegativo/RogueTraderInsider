const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const str = `    gameState.tradeTick++;
    gameState.timeString = clockFromTick(gameState.tradeTick, gameState.dayTicks);

    // Pre-close alert
    if (gameState.tradeTick === Math.floor(gameState.dayTicks * (390 / 420))) {
        setText(liveNewsFeed, "⚠️ " + t('pre_close'));
        sfx.alert();
    }`;
    
code = code.replace(/gameState\.tradeTick\+\+;\n\s*gameState\.timeString = clockFromTick\(gameState\.tradeTick, gameState\.dayTicks\);/, str);

fs.writeFileSync('main.js', code);
