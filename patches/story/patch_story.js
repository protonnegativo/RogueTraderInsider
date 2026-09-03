const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

code = code.replace(/const STORY = \{[\s\S]*?\n\};\n/, `const STORY = {
    firstBoot() {
        return [
            { t: t('st_conn'), c: 'sys', speed: 10 },
            { t: t('st_cold')(1), c: 'sys', speed: 10, pause: 500 },
            { t: '' },
            { t: t('st_f1'), c: 'user' },
            { t: t('st_f2')(BASE_BUDGET), c: 'user' },
            { t: t('st_f3'), c: 'user' },
            { t: t('st_f4')(fmtBig(FIRST_TARGET)), c: 'user' },
            { t: t('st_f5'), c: 'user' },
            { t: t('st_f6'), c: 'user', pause: 800 },
            { t: '' },
            { t: t('st_f7')(fmtBig(FIRST_TARGET)), c: 'sys' },
            { t: t('st_f8')(fmtBig(BASE_BUDGET)), c: 'sys' },
            { t: t('st_f9'), c: 'sys', pause: 700 },
            { t: '' },
            { t: t('st_f10'), c: 'me' }
        ];
    },

    rebirth() {
        const upgradeCount = Object.values(metaState.upgrades).reduce((a, b) => a + b, 0)
                           + (metaState.unlockedInsiders.length - 2);
        return [
            { t: t('st_conn'), c: 'sys', speed: 10 },
            { t: t('st_cold')(metaState.generation), c: 'sys', speed: 10, pause: 500 },
            { t: '' },
            { t: t('st_r1'), c: 'sys' },
            { t: t('st_r2'), c: 'sys', speed: 7 },
            { t: t('st_r3'), c: 'sys', speed: 7 },
            { t: t('st_r4'), c: 'sys', speed: 7, pause: 600 },
            { t: '' },
            { t: t('st_r5'), c: 'me', pause: 600 },
            { t: '' },
            { t: t('st_r6'), c: 'note' },
            { t: t('st_r7'), c: 'note' },
            { t: t('st_r8'), c: 'note' },
            { t: t('st_r9'), c: 'note', pause: 1000 },
            { t: '' },
            { t: t('st_r10'), c: 'me', pause: 500 },
            { t: t('st_r11'), c: 'sys' },
            { t: t('st_r12')(fmtBig(metaState.metaCash), upgradeCount), c: 'sys', pause: 800 },
            { t: '' },
            { t: t('st_r13'), c: 'user' },
            { t: t('st_r14'), c: 'user' },
            { t: t('st_r15')(fmtBig(metaState.weekTarget)), c: 'user', pause: 800 },
            { t: '' },
            { t: t('st_r16'), c: 'me', pause: 700 },
            { t: t('st_r17'), c: 'me' }
        ];
    },

    weekFailed() {
        const pct = (metaState.weekProfit / metaState.weekTarget) * 100;
        return [
            { t: t('st_x1'), c: 'user', pause: 600 },
            { t: t('st_x2')(fmtBig(metaState.weekTarget)), c: 'user' },
            { t: t('st_x3')(fmtBig(metaState.weekProfit)), c: 'user' },
            { t: t('st_x4')(pct.toFixed(1)), c: 'user', pause: 1000 },
            { t: '' },
            { t: t('st_x5'), c: 'user', pause: 900 },
            { t: '' },
            { t: t('st_x6')(metaState.generation), c: 'warn' },
            { t: t('st_x7'), c: 'sys' },
            { t: t('st_x8'), c: 'sys', speed: 7 },
            { t: t('st_x9'), c: 'sys', speed: 7 },
            { t: t('st_x10'), c: 'sys', speed: 7, pause: 700 },
            { t: '' },
            { t: t('st_x11'), c: 'me', pause: 600 },
            { t: t('st_x12'), c: 'me', pause: 1000 },
            { t: '' },
            { t: t('st_x13'), c: 'sys' }
        ];
    },

    weekPassed(newTarget) {
        return [
            { t: t('st_w1'), c: 'user', pause: 600 },
            { t: t('st_w2')(fmtBig(metaState.weekProfit), fmtBig(metaState.weekTarget)), c: 'user', pause: 900 },
            { t: t('st_w3'), c: 'user', pause: 700 },
            { t: t('st_w4'), c: 'user', pause: 800 },
            { t: '' },
            { t: t('st_w5')(metaState.generation, fmtBig(newTarget)), c: 'sys' },
            { t: '' },
            { t: t('st_w6'), c: 'me' }
        ];
    },

    briefing() {
        const day = metaState.dayIndex + 1;
        const last = metaState.lastDayRatio;
        if (day === DAYS_PER_WEEK) return t('b_fri');
        if (day === 1) return t('b_mon');
        if (last === null) return t('b_0');
        if (last <= -0.4) return t('b_1');
        if (last < 0) return t('b_2');
        if (last < 0.3) return t('b_3');
        if (last < 1) return t('b_4');
        return t('b_5');
    },

    dayReaction(ratio) {
        if (ratio <= -0.5) return t('rx_1');
        if (ratio < -0.1)  return t('rx_2');
        if (ratio < 0.02)  return t('rx_3');
        if (ratio < 0.25)  return t('rx_4');
        if (ratio < 0.75)  return t('rx_5');
        if (ratio < 2)     return t('rx_6');
        return t('rx_7');
    },

    daySelfLine(ratio) {
        if (ratio < 0)    return t('sf_1');
        if (ratio < 0.25) return t('sf_2');
        if (ratio < 1)    return t('sf_3');
        return t('sf_4');
    }
};\n`);

fs.writeFileSync('main.js', code);
