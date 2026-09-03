const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/setText\(\$\('report-budget'\), 'Wallet returned: \\$' \+ fmtBig\(budget\)\);/,
    "setText($('report-budget'), t('rep_ret') + fmtBig(budget));");
code = code.replace(/setText\(\$\('report-profit'\), 'Day\\'s profit: \\$' \+ fmtBig\(profit\)\);/,
    "setText($('report-profit'), t('rep_prof') + fmtBig(profit));");
code = code.replace(/setText\(\$\('report-fee'\), 'Data feed fee: \\$' \+ fmtBig\(fee\)\);/,
    "setText($('report-fee'), t('rep_fee') + fmtBig(fee));");
code = code.replace(/setText\(\$\('report-week'\), 'Week to date: \\$' \+ fmtBig\(metaState\.weekProfit\)\);/,
    "setText($('report-week'), t('rep_wtd') + '$' + fmtBig(metaState.weekProfit));");
code = code.replace(/setText\(\$\('report-cache'\), 'Written to local cache: \\$' \+ fmtBig\(Math\.max\(0, profit\)\)\);/,
    "setText($('report-cache'), t('rep_cache') + fmtBig(Math.max(0, profit)));");

fs.writeFileSync('main.js', code);
