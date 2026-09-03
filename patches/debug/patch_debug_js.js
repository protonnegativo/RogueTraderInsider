const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const debugLogic = `
    // Debug Menu Logic
    const dbgMenu = $('debug-menu');
    const btnDbgToggle = $('btn-debug-toggle');
    if (btnDbgToggle) btnDbgToggle.addEventListener('click', () => {
        dbgMenu.style.display = dbgMenu.style.display === 'flex' ? 'none' : 'flex';
    });
    
    if ($('btn-dbg-close')) $('btn-dbg-close').addEventListener('click', () => {
        dbgMenu.style.display = 'none';
    });
    
    if ($('btn-dbg-cash')) $('btn-dbg-cash').addEventListener('click', () => {
        metaState.metaCash += 10000;
        saveMetaState();
        if (!screens.hub.classList.contains('hidden')) showHub();
        if (!screens.upgrades.classList.contains('hidden')) renderUpgrades();
        sfx.buy();
    });
    
    if ($('btn-dbg-cash-big')) $('btn-dbg-cash-big').addEventListener('click', () => {
        metaState.metaCash += 1000000;
        saveMetaState();
        if (!screens.hub.classList.contains('hidden')) showHub();
        if (!screens.upgrades.classList.contains('hidden')) renderUpgrades();
        sfx.buy();
    });
    
    if ($('btn-dbg-win')) $('btn-dbg-win').addEventListener('click', () => {
        metaState.weekProfit = metaState.weekTarget + 1000;
        metaState.dayIndex = DAYS_PER_WEEK;
        saveMetaState();
        if (!screens.hub.classList.contains('hidden')) showHub();
        sfx.alert();
    });
    
    if ($('btn-dbg-insiders')) $('btn-dbg-insiders').addEventListener('click', () => {
        metaState.unlockedInsiders = ['none', 'bum', 'hacker', 'exec'];
        saveMetaState();
        if (!screens.upgrades.classList.contains('hidden')) renderUpgrades();
        sfx.alert();
    });
    
    if ($('btn-dbg-reset')) $('btn-dbg-reset').addEventListener('click', () => {
        localStorage.removeItem('rogueTraderMeta');
        location.reload();
    });
`;

code = code.replace(/function bindEvents\(\) \{/, 'function bindEvents() {\n' + debugLogic);

fs.writeFileSync('main.js', code);
