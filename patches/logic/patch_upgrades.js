const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/const UPGRADE_COSTS = \{[\s\S]*?\};/, `const UPGRADE_COSTS = {
    startingCapital: [250, 750, 2000, 5000, 15000],
    noiseFilter: [500, 1500, 4000, 10000, 25000],
    patternRec: [1000, 3000, 8000],
    priceImprovement: [800, 2500, 6000, 15000, 30000],
    orderFlow: [1500, 4500, 12000]
};`);

code = code.replace(/const upgradeData = \[[\s\S]*?\{ id: 'priceImprovement'[\s\S]*?\}\n\s*\];/, `const upgradeData = [
        { id: 'startingCapital', name: t('upg_c_name'), desc: t('upg_c_desc'), levels: UPGRADE_COSTS.startingCapital },
        { id: 'noiseFilter', name: t('upg_n_name'), desc: t('upg_n_desc'), levels: UPGRADE_COSTS.noiseFilter },
        { id: 'patternRec', name: t('upg_p_name'), desc: t('upg_p_desc'), levels: UPGRADE_COSTS.patternRec },
        { id: 'priceImprovement', name: t('upg_i_name'), desc: t('upg_i_desc'), levels: UPGRADE_COSTS.priceImprovement },
        { id: 'orderFlow', name: t('upg_o_name'), desc: t('upg_o_desc'), levels: UPGRADE_COSTS.orderFlow }
    ];`);
    
fs.writeFileSync('main.js', code);
