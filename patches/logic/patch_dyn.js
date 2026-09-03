const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

// Replace showHub dynamic text
code = code.replace(/setText\(hubPct, pct\.toFixed\(2\) \+ '% of target · '[\s\S]*?\+ daysLeft \+ \(daysLeft === 1 \? ' day left' : ' days left'\)\);/, 
    "setText(hubPct, pct.toFixed(2) + '% ' + t('tgt') + ' · ' + daysLeft + t('d_left')(daysLeft));");
code = code.replace(/setText\(btnStartDay, 'Begin day ' \+ \(metaState\.dayIndex \+ 1\)\);/, 
    "setText(btnStartDay, t('btn_start_day') + (metaState.dayIndex + 1));");

// Replace renderUpgrades dynamic text
code = code.replace(/const upgradeData = \[[\s\S]*?\];/, `const upgradeData = [
        { id: 'startingCapital', name: t('upg_c_name'), desc: t('upg_c_desc'), levels: UPGRADE_COSTS.startingCapital },
        { id: 'noiseFilter', name: t('upg_n_name'), desc: t('upg_n_desc'), levels: UPGRADE_COSTS.noiseFilter },
        { id: 'patternRec', name: t('upg_p_name'), desc: t('upg_p_desc'), levels: UPGRADE_COSTS.patternRec },
        { id: 'priceImprovement', name: t('upg_i_name'), desc: t('upg_i_desc'), levels: UPGRADE_COSTS.priceImprovement }
    ];`);
code = code.replace(/btn\.textContent = isMax \? 'Max level' : \`Apply: \\$\$\{nextCost\}\`;/, 
    "btn.textContent = isMax ? t('upg_max') : t('upg_apply') + nextCost;");
code = code.replace(/title\.textContent = \`Subscribe: \$\{ins\.name\}\`;/, 
    "title.textContent = t('ins_sub') + ins.name;");
code = code.replace(/desc\.textContent = \`\$\{ins\.desc\} Fee: \$\{Math\.round\(ins\.cut \* 100\)\}% of profit\.\`;/, 
    "desc.textContent = ins.desc + ' ' + t('ins_fee') + Math.round(ins.cut * 100) + t('ins_profit');");
code = code.replace(/btn\.textContent = \`Buy access: \\$\$\{ins\.cost\}\`;/, 
    "btn.textContent = t('ins_buy') + ins.cost;");

// Replace INSIDERS and BASE_STOCKS descriptions
code = code.replace(/const INSIDERS = \[[\s\S]*?\];/, `const INSIDERS = [
    { id: 'none',   name: () => t('ins_none_n'),       desc: () => t('ins_none_d'),        cost: 0,    quality: 0,   cut: 0,   tipTime: 0 },
    { id: 'bum',    name: () => t('ins_bum_n'),   desc: () => t('ins_bum_d'),     cost: 0,    quality: 0.2, cut: 0.1, tipTime: 3000 },
    { id: 'hacker', name: () => t('ins_hack_n'),   desc: () => t('ins_hack_d'),          cost: 500,  quality: 0.5, cut: 0.2, tipTime: 5000 },
    { id: 'exec',   name: () => t('ins_exec_n'), desc: () => t('ins_exec_d'),  cost: 2000, quality: 0.8, cut: 0.4, tipTime: 8000 }
];`);
// Update the references to ins.name and ins.desc to call the function
code = code.replace(/ins\.name/g, "(typeof ins.name === 'function' ? ins.name() : ins.name)");
code = code.replace(/ins\.desc/g, "(typeof ins.desc === 'function' ? ins.desc() : ins.desc)");

code = code.replace(/<small>Volatility \$\{Math\.round\(stock\.volatility \* 100\)\}%<\/small>/g, 
    "<small>' + t('stk_vol') + ' ' + Math.round(stock.volatility * 100) + '%</small>");

// startPrepPhase
code = code.replace(/setText\(prepTitle, \`Day \$\{metaState\.dayIndex \+ 1\} of \$\{DAYS_PER_WEEK\} · briefing\`\);/, 
    "setText(prepTitle, t('day') + ' ' + (metaState.dayIndex + 1) + ' ' + t('of') + ' ' + DAYS_PER_WEEK + ' · ' + t('prep_briefing'));");
code = code.replace(/setText\(btnStartTrading, ready \? 'Open the market' : 'Select asset & feed'\);/, 
    "setText(btnStartTrading, ready ? t('btn_prep_go') : t('btn_prep_wait'));");

// openMarket
code = code.replace(/setText\(liveNewsFeed, 'Market open — waiting for data\.\.\.'\);/, 
    "setText(liveNewsFeed, t('trd_wait'));");
code = code.replace(/setText\(tradeObjective, \`day \$\{metaState\.dayIndex \+ 1\}\/\$\{DAYS_PER_WEEK\} · \`\n\s*\+ \`\$\{fmtBig\(metaState\.weekProfit\)\} of \$\{fmtBig\(metaState\.weekTarget\)\}\`\);/, 
    "setText(tradeObjective, t('trd_day') + ' ' + (metaState.dayIndex + 1) + '/' + DAYS_PER_WEEK + ' · ' + fmtBig(metaState.weekProfit) + ' ' + t('trade_of') + ' ' + fmtBig(metaState.weekTarget));");

// showInsiderTip / clearInsiderTip
code = code.replace(/setText\(insiderText, isGood\n\s*\? \`Signal: \$\{stock\.symbol\} breaks GOOD news shortly — buy before it lands\.\`\n\s*: \`Signal: \$\{stock\.symbol\} breaks BAD news shortly — sell before it lands\.\`\);/, 
    "setText(insiderText, isGood ? t('tip_1')(stock.symbol) : t('tip_2')(stock.symbol));");
code = code.replace(/setText\(insiderText, !ins \|\| ins\.quality === 0\n\s*\? 'No external feed\. Trading the tape alone\.'\n\s*: \`\$\{ins\.name\}: connected\. No signal\.\`\);/, 
    "setText(insiderText, !ins || ins.quality === 0 ? t('tip_3') : t('tip_4')(typeof ins.name === 'function' ? ins.name() : ins.name));");

// publishNews
code = code.replace(/const good = \['record profits', 'new product launch', 'buyout rumors'\];\n\s*const bad = \['CEO scandal', 'product recall', 'lawsuit filed'\];/, 
    "const good = t('news_g'); const bad = t('news_b');");

// endTradingDay
code = code.replace(/c\.fillText\('MARKET CLOSED', w \/ 2, h \/ 2\);/, 
    "c.fillText(t('mc'), w / 2, h / 2);");

// showDayReport
code = code.replace(/setText\(reportTitle, \`Day \$\{metaState\.dayIndex\} · closed\`\);/, 
    "setText(reportTitle, t('day') + ' ' + metaState.dayIndex + ' · ' + t('rep_closed'));");
code = code.replace(/setText\(btnReportContinue,\n\s*metaState\.dayIndex >= DAYS_PER_WEEK \? "It's friday" : 'Continue'\);/, 
    "setText(btnReportContinue, metaState.dayIndex >= DAYS_PER_WEEK ? t('fri') : t('btn_cont'));");

// endOfWeek
code = code.replace(/runTerminal\('operator@localhost — friday review',/g, "runTerminal(t('t_rev'),");
code = code.replace(/runTerminal\('operator@localhost — new session',/g, "runTerminal(t('t_new'),");
code = code.replace(/runTerminal\('operator@localhost — new instance',/g, "runTerminal(t('t_inst'),");

// chart tags
code = code.replace(/\$\{changePct \>= 0 \? '\+' : ''\}\$\{changePct\.toFixed\(2\)\}% today/, 
    "${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% ' + t('today')");

fs.writeFileSync('main.js', code);
