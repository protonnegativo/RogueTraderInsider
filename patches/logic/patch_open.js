const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const str = `    showScreen('trading');
    gameState.tradingActive = false; // Set true after countdown
    gameState.tradeTick = 0;
    gameState.pendingEvent = null;
    gameState.eventCooldown = 0;

    setText(liveNewsFeed, t('trd_wait'));
    setText(tradeObjective, t('trd_day') + ' ' + (metaState.dayIndex + 1) + '/' + DAYS_PER_WEEK + ' · ' + fmtBig(metaState.weekProfit) + ' ' + t('trade_of') + ' ' + fmtBig(metaState.weekTarget));
    clearInsiderTip();
    setText(chartSymbol, gameState.stock.symbol);
    setText(chartName, gameState.stock.name);
    resetChartView();
    
    // Countdown
    let count = 3;
    chartOverlayText.textContent = t('pre_open')(count);
    chartOverlay.classList.remove('hidden');

    const pat = metaState.upgrades.patternRec || 0;
    legendSmaFast.classList.toggle('hidden', pat < 1);
    legendSmaSlow.classList.toggle('hidden', pat < 2);
    legendProj.classList.toggle('hidden', pat < 3);

    lastFrameTs = 0;
    tickAccumulator = 0;
    renderTrading();
    drawRadarChart(gameState.stock);
    
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            chartOverlayText.textContent = t('pre_open')(count);
            sfx.click();
        } else {
            clearInterval(countInterval);
            chartOverlay.classList.add('hidden');
            gameState.tradingActive = true;
            sfx.alert(); // Ring the opening bell!
            if (rafId === null) rafId = requestAnimationFrame(frame);
        }
    }, 1000);`;
    
const regex = /showScreen\('trading'\);[\s\S]*?if \(rafId === null\) rafId = requestAnimationFrame\(frame\);/m;
code = code.replace(regex, str);

fs.writeFileSync('main.js', code);
