const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/drawRefLine\(ctx, plotL, plotR, yOf\(stock\.openPrice\), plotT, plotB, '#5a5a7a', 'OPEN',/g,
    "drawRefLine(ctx, plotL, plotR, yOf(stock.openPrice), plotT, plotB, '#5a5a7a', t('trd_legend_o').toUpperCase(),");
code = code.replace(/drawRefLine\(ctx, plotL, plotR, yOf\(avg\), plotT, plotB, '#ffcc00', 'AVG',/g,
    "drawRefLine(ctx, plotL, plotR, yOf(avg), plotT, plotB, '#ffcc00', t('trd_legend_a').toUpperCase(),");

code = code.replace(/c\.fillText\('open', cx, cy - r - 8\);/g, "c.fillText(t('trd_legend_o').toLowerCase(), cx, cy - r - 8);");
code = code.replace(/c\.fillText\('avg', cx, cy - r - 8\);/g, "c.fillText(t('trd_legend_a').toLowerCase(), cx, cy - r - 8);");

fs.writeFileSync('main.js', code);
