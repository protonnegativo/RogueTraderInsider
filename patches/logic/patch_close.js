const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add overlay to chart-stage
html = html.replace(/<canvas id="stock-chart"><\/canvas>/, '<canvas id="stock-chart"></canvas>\n                        <div id="chart-overlay" class="hidden" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5,5,16,0.85); display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none;"><h2 id="chart-overlay-text" style="color: #ff3366; font-size: 3rem; margin: 0; text-shadow: 0 0 20px #ff3366; letter-spacing: 4px;">MARKET CLOSED</h2></div>');

fs.writeFileSync('index.html', html);

let js = fs.readFileSync('main.js', 'utf8');

// Add DOM variable
js = js.replace(/const stockChart = \$\('stock-chart'\);/, "const stockChart = $('stock-chart');\nconst chartOverlay = $('chart-overlay');\nconst chartOverlayText = $('chart-overlay-text');");

// In openMarket, hide overlay
js = js.replace(/resetChartView\(\);/, "resetChartView();\n    chartOverlay.classList.add('hidden');");

// In endTradingDay, show overlay
js = js.replace(/\/\/ Visual overlay[\s\S]*?sfx\.close\(\);/, `// Visual overlay
    chartOverlayText.textContent = t('mc');
    chartOverlay.classList.remove('hidden');
    
    sfx.close();`);

fs.writeFileSync('main.js', js);
