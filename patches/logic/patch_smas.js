const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const regex = /for \(let j = 0; j < 45; j\+\+\) \{[\s\S]*?if \(j < 15\) \{ sumF \+= hist\[i - j\]; countF\+\+; \}[\s\S]*?sumS \+= hist\[i - j\]; countS\+\+;[\s\S]*?\}/;
const replacement = `for (let j = 0; j < 180; j++) {
            if (i - j < 0) break;
            if (j < 60) { sumF += hist[i - j]; countF++; }
            sumS += hist[i - j]; countS++;
        }`;
        
code = code.replace(regex, replacement);

// And the projection ray needs to project further ahead maybe?
// Currently:
// const diff = hist[i] - hist[Math.max(0, i - 20)];
// ctx.lineTo(xOf(i) + (plotW * 0.1), yOf(hist[i] + diff * 3));
// 20 ticks is ~0.6 seconds. Let's make it 60 ticks.
code = code.replace(/const diff = hist\[i\] - hist\[Math\.max\(0, i - 20\)\];/, 'const diff = hist[i] - hist[Math.max(0, i - 60)];');

fs.writeFileSync('main.js', code);
