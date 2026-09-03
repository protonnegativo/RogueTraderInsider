const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/setText\(prepOperator, 'Wallet funded by operator: \\$' \+ fmtBig\(op\)\);/,
    "setText(prepOperator, t('prep_funded') + fmtBig(op));");
code = code.replace(/setText\(prepBudgetOp, 'Wallet funded by operator: \\$' \+ fmtBig\(op\)\);/,
    "setText(prepBudgetOp, t('prep_funded') + fmtBig(op));");
code = code.replace(/setText\(prepBudgetCache, 'Reserve wallet from local cache: \+\\$' \+ fmtBig\(cache\)\);/,
    "setText(prepBudgetCache, t('prep_reserve') + fmtBig(cache));");
code = code.replace(/setText\(prepCash, 'Working capital today: \\$' \+ fmtBig\(op \+ cache\)\);/,
    "setText(prepCash, t('prep_capital') + fmtBig(op + cache));");

fs.writeFileSync('main.js', code);
