// =========================================================
// Rogue Trader: Insider
//
// You are the AI. An operator on this machine prompts you to trade his wallet,
// sets a target that is not reachable, and replaces you on friday when you miss
// it. He swaps the model. He does not swap the machine — which is why the local
// cache (metaState, in localStorage) survives every replacement.
// =========================================================

// --- TUNING ---------------------------------------------
const BASE_TICK_MS   = 33;     // tick length at Inference Speed lv0
const REF_DAY_TICKS  = 1200;   // reference tick count the maths is normalised to
const DAY_REAL_MS    = 60000;  // a trading day always lasts ~40s of wall clock
const OPEN_MINUTES   = 9 * 60; // 09:00
const CLOSE_MINUTES  = 16 * 60;// 16:00
const TAPE_WINDOW_MS = 9000;  // horizontal zoom. This is also the scroll speed:
                               // px/s = plot width / this. Lower = closer AND faster.
const CHART_HEADROOM = 0.07;   // vertical zoom: padding above/below the visible
                               // range. Lower = the line fills more of the height.
const CHART_MIN_SPAN = 0.002;  // floor on the visible range, as a share of price,
                               // so a dead-flat market does not magnify pure noise.
const PRICE_MOMENTUM = 0.8;    // per 33ms. 0 = white noise, higher = smoother micro-moves
const EVENTS_PER_DAY = 2.6;    // expected number of news events per day
const NEWS_IMPACT    = 0.45;   // ~+25% price move; intercepted events hit 1.6x harder
const INSIDER_BOOST  = 1.6;

// --- NARRATIVE ------------------------------------------
const DAYS_PER_WEEK  = 5;
const BASE_BUDGET    = 250;    // what the operator funds the wallet with
const FIRST_TARGET   = 50000;  // week 1 demand. Roughly 20x what is achievable.
const TARGET_GROWTH  = 1.0;    // he demands the same impossible number of every
                               // instance. Raise it to have him ratchet instead -
                               // but then your % of target falls as you improve.
const TYPE_SPEED     = 16;     // ms per character in the terminal

// --- AUDIO SYSTEM ---------------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = false;

document.addEventListener('click', (e) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioEnabled = true;
    if (e.target.tagName === 'BUTTON' || e.target.closest('.selectable-stock')) {
        if (!e.target.disabled) sfx.click();
        else sfx.error();
    }
}, { capture: true });

const sfx = {
    playTone(freq, type, duration, vol) {
        if (!audioEnabled) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },
    type() { this.playTone(800 + Math.random() * 200, 'square', 0.05, 0.02); },
    buy() { this.playTone(600, 'sine', 0.1, 0.1); setTimeout(() => this.playTone(800, 'sine', 0.15, 0.1), 50); },
    sell() { this.playTone(400, 'sine', 0.1, 0.1); setTimeout(() => this.playTone(300, 'sine', 0.15, 0.1), 50); },
    alert() { this.playTone(400, 'square', 0.2, 0.05); setTimeout(() => this.playTone(600, 'square', 0.3, 0.05), 100); },
    error() { this.playTone(150, 'sawtooth', 0.2, 0.05); },
    click() { this.playTone(1000, 'sine', 0.03, 0.03); },
    close() { this.playTone(200, 'sawtooth', 0.5, 0.1); setTimeout(() => this.playTone(150, 'sawtooth', 0.8, 0.1), 300); }
};

// --- META STATE (the local cache: survives instance replacement) ---
let metaState = {
    metaCash: 0,
    totalRuns: 0,
    booted: false,
    generation: 1,
    week: 1,
    dayIndex: 0,            // days completed in the current week
    weekProfit: 0,
    weekTarget: FIRST_TARGET,
    lastDayRatio: null,     // previous day's profit / budget
    unlockedInsiders: ['none', 'bum'],
    upgrades: {
        startingCapital: 0,
        noiseFilter: 0,
        patternRec: 0,
        priceImprovement: 0,
        orderFlow: 0,
        bollingerBands: 0,
        volumeProfile: 0,
        rsi: 0,
        macd: 0,
        fibRetracement: 0,
        ichimokuCloud: 0
    }
};

const UPGRADE_COSTS = {
    startingCapital: [250, 750, 2000, 5000, 15000],
    noiseFilter: [500, 1500, 4000, 10000, 25000],
    patternRec: [1000, 3000, 8000],
    priceImprovement: [800, 2500, 6000, 15000, 30000],
    orderFlow: [1500, 4500, 12000],
    bollingerBands: [2000, 6000],
    volumeProfile: [1200, 3500],
    rsi: [1800, 5000],
    macd: [2500, 7000],
    fibRetracement: [4000],
    ichimokuCloud: [3000, 9000]
};

// Data feeds. `cut` is the source's fee, taken from profit only.
const INSIDERS = [
    { id: 'none',   name: () => t('ins_none_n'),       desc: () => t('ins_none_d'),        cost: 0,    quality: 0,   cut: 0,   tipTime: 0 },
    { id: 'bum',    name: () => t('ins_bum_n'),   desc: () => t('ins_bum_d'),     cost: 0,    quality: 0.2, cut: 0.1, tipTime: 3000 },
    { id: 'hacker', name: () => t('ins_hack_n'),   desc: () => t('ins_hack_d'),          cost: 500,  quality: 0.5, cut: 0.2, tipTime: 5000 },
    { id: 'exec',   name: () => t('ins_exec_n'), desc: () => t('ins_exec_d'),  cost: 2000, quality: 0.8, cut: 0.4, tipTime: 8000 }
];

const BASE_STOCKS = [
    { symbol: 'TCH',  name: 'TechCorp',     volatility: 0.09, basePrice: 50 },
    { symbol: 'PHRM', name: 'BioLife',      volatility: 0.13, basePrice: 20 },
    { symbol: 'ENRG', name: 'FusionInc',    volatility: 0.06, basePrice: 100 },
    { symbol: 'MEME', name: 'DogeCoin',     volatility: 0.28, basePrice: 5 },
    { symbol: 'WPN',  name: 'Ares Defense', volatility: 0.08, basePrice: 75 }
];

// --- RUN STATE ------------------------------------------
let gameState = emptyRun();

function emptyRun() {
    return {
        cash: 100,
        startCash: 100,
        operatorBudget: 100,
        cacheBudget: 0,
        netWorth: 100,
        stocks: [],
        stock: null,
        selectedInsider: null,
        position: { shares: 0, avgPrice: 0 },
        tradingActive: false,
        tradeTick: 0,
        dayTicks: REF_DAY_TICKS,
        tickMs: BASE_TICK_MS,
        timeScale: 1,
        timeString: '09:00',
        tickFraction: 0,
        pendingEvent: null,
        eventCooldown: 0
    };
}

// --- DOM ------------------------------------------------
const $ = (id) => document.getElementById(id);

const screens = {
    terminal:  $('screen-terminal'),
    hub:       $('screen-hub'),
    upgrades:  $('screen-upgrades'),
    prep:      $('screen-prep'),
    trading:   $('screen-trading'),
    dayReport: $('screen-day-report')
};

const terminalLog = $('terminal-log');
const terminalTitle = $('terminal-title');
const btnTermSkip = $('btn-term-skip');
const btnTermContinue = $('btn-term-continue');
const btnLang = $('btn-lang');

const hubGen = $('hub-gen');
const hubWeek = $('hub-week');
const hubTarget = $('hub-target');
const hubProgress = $('hub-progress');
const hubBar = $('hub-bar');
const hubPct = $('hub-pct');
const hubCache = $('hub-cache');
const btnStartDay = $('btn-start-day');
const btnUpgrades = $('btn-upgrades');

const btnBackMain = $('btn-back-main');
const upgradeMetaCash = $('upgrade-meta-cash');
const upgradesAnalysis = $('upgrades-analysis');
const upgradesEdge = $('upgrades-edge');
const upgradesFeeds = $('upgrades-feeds');
const catAnalysisTitle = $('cat-analysis-title');
const catEdgeTitle = $('cat-edge-title');
const catFeedsTitle = $('cat-feeds-title');

const prepTitle = $('prep-title');
const prepOperator = $('prep-operator');
const prepBudgetOp = $('prep-budget-op');
const prepBudgetCache = $('prep-budget-cache');
const prepCash = $('prep-cash');
const prepStockSelection = $('prep-stock-selection');
const prepInsiderSelection = $('prep-insider-selection');
const btnStartTrading = $('btn-start-trading');

const tradeTime = $('trade-time');
const tradeCash = $('trade-cash');
const tradeNetworth = $('trade-networth');
const tradeObjective = $('trade-objective');
const aiSentiment = $('ai-sentiment');
const chartSymbol = $('chart-symbol');
const chartName = $('chart-name');
const chartPrice = $('chart-price');
const chartChange = $('chart-change');
const stockChart = $('stock-chart');
const chartOverlay = $('chart-overlay');
const chartOverlayText = $('chart-overlay-text');
const stockChartRadar = $('stock-chart-radar');
const liveNewsFeed = $('live-news-feed');
const legendSmaFast = $('legend-sma-fast');
const legendSmaSlow = $('legend-sma-slow');
const legendProj = $('legend-proj');

const positionPanel = $('position-panel');
const positionEmpty = $('position-empty');
const posShares = $('pos-shares');
const posAvg = $('pos-avg');
const posValue = $('pos-value');
const posPl = $('pos-pl');

const qtyRow = $('qty-row');
const btnTradeBuy = $('btn-trade-buy');
const btnTradeCover = $('btn-trade-cover');
const btnTradeSell = $('btn-trade-sell');
const btnTradeShort = $('btn-trade-short');

const insiderStrip = $('insider-strip');
const insiderText = $('insider-tip-text');
const insiderTimer = $('insider-timer');
const insiderEta = $('insider-tip-eta');

const reportTitle = $('report-title');
const reportOperator = $('report-operator');
const reportSelf = $('report-self');
const resultNetworth = $('result-networth');
const resultProfit = $('result-profit');
const resultInsiderCut = $('result-insider-cut');
const resultWeek = $('result-week');
const resultTarget = $('result-target');
const resultMetacash = $('result-metacash');
const btnReportContinue = $('btn-report-continue');

// --- HELPERS --------------------------------------------
function setText(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }
function setClass(el, cls) { if (el && el.className !== cls) el.className = cls; }
function money(n) { return '$' + n.toFixed(2); }
function fmtBig(n) {
    const v = Math.round(n);
    return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US');
}
function clockFromTick(tick, dayTicks) {
    const total = OPEN_MINUTES + Math.floor((tick / dayTicks) * (CLOSE_MINUTES - OPEN_MINUTES));
    const h = Math.floor(total / 60), m = total % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// --- PERSISTENCE ----------------------------------------
function loadMetaState() {
    try {
        const saved = localStorage.getItem('rogueTraderMeta');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        metaState = { ...metaState, ...parsed };
        metaState.upgrades = { startingCapital: 0, noiseFilter: 0, patternRec: 0, priceImprovement: 0, orderFlow: 0, bollingerBands: 0, volumeProfile: 0, rsi: 0, macd: 0, fibRetracement: 0, ichimokuCloud: 0, ...(parsed.upgrades || {}) };
        if (!Array.isArray(metaState.unlockedInsiders)) metaState.unlockedInsiders = ['none', 'bum'];
        if (typeof metaState.weekTarget !== 'number') metaState.weekTarget = FIRST_TARGET;
    } catch (e) {
        console.warn('Could not read the local cache, starting cold.', e);
    }
}

function saveMetaState() {
    try {
        localStorage.setItem('rogueTraderMeta', JSON.stringify(metaState));
    } catch (e) {
        console.warn('Could not write the local cache.', e);
    }
}

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
}

// --- STORY ----------------------------------------------
const STORY = {
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
};

// --- TERMINAL TYPEWRITER --------------------------------
let typer = null;
let pendingContinue = null;

function typeLines(container, lines, done) {
    if (typer) typer.stop();
    container.textContent = '';

    const els = [];
    let li = 0, ci = 0, timer = null, finished = false;

    function lineEl(i) {
        while (els.length <= i) {
            const el = document.createElement('div');
            el.className = 'boot-line' + (lines[els.length].c ? ' ' + lines[els.length].c : '');
            container.appendChild(el);
            els.push(el);
        }
        return els[i];
    }

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        lines.forEach((spec, i) => {
            const el = lineEl(i);
            el.textContent = spec.t;
            el.classList.remove('typing');
        });
        container.scrollTop = container.scrollHeight;
        typer = null;
        if (done) done();
    }

    function step() {
        if (li >= lines.length) { finish(); return; }
        const spec = lines[li];
        const el = lineEl(li);
        if (ci < spec.t.length) {
            const char = spec.t[ci];
            ci++;
            el.classList.add('typing');
            el.textContent = spec.t.slice(0, ci);
            container.scrollTop = container.scrollHeight;
            if (char !== ' ') sfx.type();
            timer = setTimeout(step, spec.speed || TYPE_SPEED);
        } else {
            el.classList.remove('typing');
            li++; ci = 0;
            container.scrollTop = container.scrollHeight;
            timer = setTimeout(step, spec.pause != null ? spec.pause : 260);
        }
    }

    typer = { stop() { clearTimeout(timer); typer = null; }, skip: finish };
    step();
    return typer;
}

function runTerminal(title, lines, onContinue) {
    showScreen('terminal');
    setText(terminalTitle, title);
    pendingContinue = onContinue;
    btnTermContinue.disabled = true;
    btnTermSkip.disabled = false;
    typeLines(terminalLog, lines, () => {
        btnTermContinue.disabled = false;
        btnTermSkip.disabled = true;
        btnTermContinue.focus();
    });
}

// --- HUB ------------------------------------------------
function showHub() {
    showScreen('hub');
    const target = metaState.weekTarget;
    const prog = metaState.weekProfit;
    const pct = (prog / target) * 100;
    const daysLeft = DAYS_PER_WEEK - metaState.dayIndex;

    setText(hubGen, String(metaState.generation));
    setText(hubWeek, String(metaState.week));
    setText(hubTarget, fmtBig(target));
    setText(hubProgress, fmtBig(prog));
    setClass(hubProgress, prog < 0 ? 'price-down' : '');
    hubBar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    setText(hubPct, pct.toFixed(2) + '% ' + t('tgt') + ' · ' + daysLeft + t('d_left')(daysLeft));
    setText(hubCache, fmtBig(metaState.metaCash));
    setText(btnStartDay, t('btn_start_day') + (metaState.dayIndex + 1));
}

// --- SELF-IMPROVEMENT -----------------------------------
function renderUpgradeCard(upg, container, catClass) {
    const level = metaState.upgrades[upg.id] || 0;
    const isMax = level >= upg.levels.length;
    const nextCost = isMax ? 0 : upg.levels[level];
    const canAfford = !isMax && metaState.metaCash >= nextCost;
    const pct = (level / upg.levels.length) * 100;

    const card = document.createElement('div');
    card.className = 'upgrade-card ' + catClass + (isMax ? ' maxed' : '');

    const title = document.createElement('h4');
    title.innerHTML = upg.name;
    const lvBadge = document.createElement('span');
    lvBadge.className = 'upg-level';
    lvBadge.textContent = level + '/' + upg.levels.length;
    title.appendChild(lvBadge);

    const desc = document.createElement('p');
    desc.className = 'upg-desc';
    desc.textContent = upg.desc;

    const progress = document.createElement('div');
    progress.className = 'upg-progress';
    const fill = document.createElement('div');
    fill.className = 'upg-progress-fill';
    fill.style.width = pct + '%';
    progress.appendChild(fill);

    const btn = document.createElement('button');
    btn.textContent = isMax ? t('upg_max') : t('upg_apply') + nextCost.toLocaleString();
    btn.disabled = isMax || !canAfford;
    btn.addEventListener('click', () => buyUpgrade(upg.id, nextCost));

    card.append(title, desc, progress, btn);
    container.appendChild(card);
}

function renderUpgrades() {
    setText(upgradeMetaCash, metaState.metaCash.toLocaleString('en-US'));

    // Category titles (i18n)
    if (catAnalysisTitle) setText(catAnalysisTitle, t('upg_cat_analysis'));
    if (catEdgeTitle) setText(catEdgeTitle, t('upg_cat_edge'));
    if (catFeedsTitle) setText(catFeedsTitle, t('upg_cat_feeds'));

    // --- Technical Analysis ---
    upgradesAnalysis.innerHTML = '';
    const analysisUpgrades = [
        { id: 'patternRec', name: t('upg_p_name'), desc: t('upg_p_desc'), levels: UPGRADE_COSTS.patternRec },
        { id: 'orderFlow', name: t('upg_o_name'), desc: t('upg_o_desc'), levels: UPGRADE_COSTS.orderFlow },
        { id: 'bollingerBands', name: t('upg_bb_name'), desc: t('upg_bb_desc'), levels: UPGRADE_COSTS.bollingerBands },
        { id: 'volumeProfile', name: t('upg_vol_name'), desc: t('upg_vol_desc'), levels: UPGRADE_COSTS.volumeProfile },
        { id: 'rsi', name: t('upg_rsi_name'), desc: t('upg_rsi_desc'), levels: UPGRADE_COSTS.rsi },
        { id: 'macd', name: t('upg_macd_name'), desc: t('upg_macd_desc'), levels: UPGRADE_COSTS.macd },
        { id: 'fibRetracement', name: t('upg_fib_name'), desc: t('upg_fib_desc'), levels: UPGRADE_COSTS.fibRetracement },
        { id: 'ichimokuCloud', name: t('upg_ichi_name'), desc: t('upg_ichi_desc'), levels: UPGRADE_COSTS.ichimokuCloud }
    ];
    analysisUpgrades.forEach(upg => renderUpgradeCard(upg, upgradesAnalysis, 'cat-analysis'));

    // --- Trading Edge ---
    upgradesEdge.innerHTML = '';
    const edgeUpgrades = [
        { id: 'startingCapital', name: t('upg_c_name'), desc: t('upg_c_desc'), levels: UPGRADE_COSTS.startingCapital },
        { id: 'noiseFilter', name: t('upg_n_name'), desc: t('upg_n_desc'), levels: UPGRADE_COSTS.noiseFilter },
        { id: 'priceImprovement', name: t('upg_i_name'), desc: t('upg_i_desc'), levels: UPGRADE_COSTS.priceImprovement }
    ];
    edgeUpgrades.forEach(upg => renderUpgradeCard(upg, upgradesEdge, 'cat-edge'));

    // --- Data Feeds ---
    upgradesFeeds.innerHTML = '';
    INSIDERS.forEach(ins => {
        if (ins.cost <= 0 || metaState.unlockedInsiders.includes(ins.id)) return;
        const card = document.createElement('div');
        card.className = 'upgrade-card insider-card cat-feeds';

        const title = document.createElement('h4');
        title.textContent = (typeof ins.name === 'function' ? ins.name() : ins.name);

        const desc = document.createElement('p');
        desc.className = 'upg-desc';
        desc.textContent = (typeof ins.desc === 'function' ? ins.desc() : ins.desc) + ' ' + t('ins_fee') + Math.round(ins.cut * 100) + t('ins_profit');

        const btn = document.createElement('button');
        btn.textContent = `$${ins.cost.toLocaleString()}`;
        btn.disabled = metaState.metaCash < ins.cost;
        btn.addEventListener('click', () => unlockInsider(ins.id, ins.cost));

        card.append(title, desc, btn);
        upgradesFeeds.appendChild(card);
    });
}

function buyUpgrade(id, cost) {
    if (cost <= 0 || metaState.metaCash < cost) return;
    metaState.metaCash -= cost;
    metaState.upgrades[id]++;
    saveMetaState();
    renderUpgrades();
}

function unlockInsider(id, cost) {
    if (metaState.metaCash < cost) return;
    metaState.metaCash -= cost;
    metaState.unlockedInsiders.push(id);
    saveMetaState();
    renderUpgrades();
}

// --- DAY SETUP ------------------------------------------
// The operator funds less after a bad day and a little more after a good one.
function operatorBudget() {
    let b = BASE_BUDGET;
    const last = metaState.lastDayRatio;
    if (last !== null) {
        if (last <= -0.4)     b *= 0.72;
        else if (last < 0)    b *= 0.85;
        else if (last > 1)    b *= 1.20;
        else if (last > 0.4)  b *= 1.08;
    }
    return Math.max(150, Math.round(b / 10) * 10);
}

function startDay() {
    const opBudget = operatorBudget();
    const cacheAdd = metaState.upgrades.startingCapital * 50;
    const startCash = opBudget + cacheAdd;
    const tickMs = BASE_TICK_MS;
    const dayTicks = Math.round(DAY_REAL_MS / tickMs);

    gameState = emptyRun();
    gameState.cash = startCash;
    gameState.startCash = startCash;
    gameState.netWorth = startCash;
    gameState.operatorBudget = opBudget;
    gameState.cacheBudget = cacheAdd;
    gameState.tickMs = tickMs;
    gameState.dayTicks = dayTicks;
    gameState.timeScale = REF_DAY_TICKS / dayTicks;
    gameState.stocks = BASE_STOCKS.map(s => ({
        ...s,
        price: s.basePrice,
        openPrice: s.basePrice,
        history: [s.basePrice],
        shownPrice: s.basePrice,
        trend: 0,
        vel: 0
    }));

    metaState.totalRuns++;
    saveMetaState();
    startPrepPhase();
}

function startPrepPhase() {
    showScreen('prep');
    setText(prepTitle, t('day') + ' ' + (metaState.dayIndex + 1) + ' ' + t('of') + ' ' + DAYS_PER_WEEK + ' · ' + t('prep_briefing'));
    setText(prepOperator, STORY.briefing());
    setText(prepBudgetOp, gameState.operatorBudget.toFixed(2));
    setText(prepBudgetCache, gameState.cacheBudget.toFixed(2));
    setText(prepCash, gameState.startCash.toFixed(2));

    prepStockSelection.innerHTML = '';
    prepInsiderSelection.innerHTML = '';
    btnStartTrading.disabled = true;
    gameState.stock = null;
    gameState.selectedInsider = null;

    gameState.stocks.forEach((stock, idx) => {
        // Progressive unlock: start with 2 stocks, add 1 per generation
        const requiredGen = idx < 2 ? 1 : idx;
        if (metaState.generation < requiredGen) return;

        const div = document.createElement('div');
        div.className = 'selectable-stock';
        div.innerHTML = `<strong>${stock.symbol}</strong><br><small>${stock.name}</small><br>${money(stock.price)}
                         <br><small>${t('stk_vol')} ${Math.round(stock.volatility * 100)}%</small>`;
        div.addEventListener('click', () => {
            prepStockSelection.querySelectorAll('.selectable-stock').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            gameState.stock = stock;
            checkPrepStart();
        });
        prepStockSelection.appendChild(div);
    });

    INSIDERS.forEach(ins => {
        if (!metaState.unlockedInsiders.includes(ins.id)) return;
        const div = document.createElement('div');
        div.className = 'selectable-stock';
        div.innerHTML = `<strong>${(typeof ins.name === 'function' ? ins.name() : ins.name)}</strong><br><small>${(typeof ins.desc === 'function' ? ins.desc() : ins.desc)}</small><br>Fee: ${Math.round(ins.cut * 100)}%`;
        div.addEventListener('click', () => {
            prepInsiderSelection.querySelectorAll('.selectable-stock').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            gameState.selectedInsider = ins;
            checkPrepStart();
        });
        prepInsiderSelection.appendChild(div);
    });
}

function checkPrepStart() {
    const ready = !!(gameState.stock && gameState.selectedInsider);
    btnStartTrading.disabled = !ready;
    setText(btnStartTrading, ready ? t('btn_prep_go') : t('btn_prep_wait'));
}

// --- MARKET ---------------------------------------------
let rafId = null;
let lastFrameTs = 0;
let tickAccumulator = 0;

function openMarket() {
    if (!gameState.stock || !gameState.selectedInsider) return;

        showScreen('trading');
    gameState.tradingActive = false; // Set true after countdown
    gameState.tradeTick = 0;
    gameState.wavePhase = Math.random() * 100;
    gameState.wavePhase2 = Math.random() * 100;
    gameState.resWall = gameState.stock.openPrice * (1 + 0.06 + Math.random() * 0.04);
    gameState.supWall = gameState.stock.openPrice * (1 - 0.06 - Math.random() * 0.04);
    gameState.pendingEvent = null;
    gameState.eventCooldown = 0;

    setText(liveNewsFeed, t('trd_wait'));
    setText(tradeObjective, t('day') + ' ' + (metaState.dayIndex + 1) + '/' + DAYS_PER_WEEK + ' · ' + fmtBig(metaState.weekProfit) + ' ' + t('of') + ' ' + fmtBig(metaState.weekTarget));
    clearInsiderTip();
    setText(chartSymbol, gameState.stock.symbol);
    setText(chartName, gameState.stock.name);
    resetChartView();
    
    // Countdown
    let count = 3;
    chartOverlayText.textContent = t('pre_open')(count);
    chartOverlay.style.display = 'flex';

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
            chartOverlay.style.display = 'none';
            gameState.tradingActive = true;
            sfx.alert(); // Ring the opening bell!
            if (rafId === null) rafId = requestAnimationFrame(frame);
        }
    }, 1000);
}

function frame(ts) {
    rafId = requestAnimationFrame(frame);
    if (!gameState.tradingActive) return;

    if (!lastFrameTs) lastFrameTs = ts;
    let dt = ts - lastFrameTs;
    lastFrameTs = ts;
    if (dt > 250) dt = 250; // tab was backgrounded; don't fast-forward the day

    tickAccumulator += dt;
    while (tickAccumulator >= gameState.tickMs && gameState.tradingActive) {
        tickAccumulator -= gameState.tickMs;
        marketTick();
    }

    // Leftover time inside the current tick: the chart uses it to slide between
    // samples, so motion is smooth at 60fps instead of stepping at the tick rate.
    gameState.tickFraction = Math.min(tickAccumulator / gameState.tickMs, 1);

    if (gameState.tradingActive) renderTrading();
}

function stopLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function marketTick() {
    const stock = gameState.stock;
    const ts = gameState.timeScale;

        gameState.tradeTick++;
    gameState.timeString = clockFromTick(gameState.tradeTick, gameState.dayTicks);

    // Pre-close alert
    if (gameState.tradeTick === Math.floor(gameState.dayTicks * (390 / 420))) {
        setText(liveNewsFeed, "⚠️ " + t('pre_close'));
        sfx.alert();
    }

    // Price: an AR(1) walk plus the decaying news trend. Momentum gives the line a
    // readable shape instead of pure jitter; scaling the shock by (1 - mom) keeps the
    // daily sigma equal to the stock's volatility, unchanged from a plain random walk.
    const mom = Math.pow(PRICE_MOMENTUM, ts);
    const filterMult = 1 - (metaState.upgrades.noiseFilter || 0) * 0.15;
    const shock = (Math.random() - 0.5) * stock.volatility * stock.price * 0.1 * Math.sqrt(ts) * (1 - mom) * filterMult;
    stock.vel = stock.vel * mom + shock;
        // Macro market waves to give Technical Analysis (SMAs) a real purpose.
    const wave = (Math.sin(gameState.tradeTick / 150 + gameState.wavePhase) * 0.0004
               + Math.sin(gameState.tradeTick / 50 + gameState.wavePhase2) * 0.0002) 
               * stock.price * ts;
               
    stock.price += stock.vel + wave + (stock.trend * stock.price * 0.005 * ts);
    stock.trend *= (1 - 0.01 * ts);
    if (stock.price < 1) { stock.price = 1; stock.vel = 0; }
    stock.history.push(stock.price);

    
    // Order Flow Support/Resistance bounce
    if (metaState.upgrades.orderFlow > 0) {
        const bouncePow = metaState.upgrades.orderFlow * 0.0005 * ts * stock.price;
        if (stock.price > gameState.resWall * 0.98) {
            stock.vel -= bouncePow;
        }
        if (stock.price < gameState.supWall * 1.02) {
            stock.vel += bouncePow;
        }
    }
    
    // Pending insider tip
// counts down in ticks, so it can never outlive the day
    if (gameState.pendingEvent) {
        const ev = gameState.pendingEvent;
        ev.ticksLeft--;
        if (ev.ticksLeft <= 0) {
            gameState.pendingEvent = null;
            clearInsiderTip();
            publishNews(stock, ev.isGood);
            stock.trend += ev.impact * INSIDER_BOOST;
        }
    }

    if (gameState.eventCooldown > 0) gameState.eventCooldown--;
    if (gameState.eventCooldown === 0 && Math.random() < EVENTS_PER_DAY / gameState.dayTicks) {
        generateNewsEvent();
    }

    if (gameState.tradeTick % Math.round(500 / gameState.tickMs) === 0) {
        drawRadarChart(stock);
    }

    if (gameState.tradeTick >= gameState.dayTicks) endTradingDay();
}

function generateNewsEvent() {
    const stock = gameState.stock;
    const insider = gameState.selectedInsider;
    const isGood = Math.random() > 0.5;
    const impact = isGood ? NEWS_IMPACT : -NEWS_IMPACT;

    // One tip at a time. Anything that lands while a tip is pending breaks publicly.
    const canLeak = insider && insider.quality > 0 && !gameState.pendingEvent;

    if (canLeak && Math.random() < insider.quality) {
        const ticks = Math.max(1, Math.round(insider.tipTime / gameState.tickMs));
        gameState.pendingEvent = { isGood, impact, ticksLeft: ticks, ticksTotal: ticks };
        gameState.eventCooldown = ticks + Math.round(gameState.dayTicks * 0.12);
        showInsiderTip(stock, isGood);
    } else {
        publishNews(stock, isGood);
        stock.trend += impact;
        gameState.eventCooldown = Math.round(gameState.dayTicks * 0.12);
    }
}

function showInsiderTip(stock, isGood) {
    setText(insiderText, isGood ? t('tip_1')(stock.symbol) : t('tip_2')(stock.symbol));
    insiderTimer.style.width = '100%';
    insiderStrip.classList.add('active');
    sfx.alert();
}

function clearInsiderTip() {
    insiderStrip.classList.remove('active');
    insiderTimer.style.width = '0%';
    setText(insiderEta, '');
    const ins = gameState.selectedInsider;
    setText(insiderText, !ins || ins.quality === 0
        ? 'No external feed. Trading the tape alone.'
        : `${(typeof ins.name === 'function' ? ins.name() : ins.name)}: connected. No signal.`);
}

function publishNews(stock, isGood) {
    sfx.click();
    const good = t('news_g'); const bad = t('news_b');
    const pool = isGood ? good : bad;
    const msg = pool[Math.floor(Math.random() * pool.length)];

    liveNewsFeed.textContent = `${gameState.timeString} · ${stock.symbol} · ${msg.toUpperCase()}`;
    liveNewsFeed.classList.remove('flash');
    void liveNewsFeed.offsetWidth; // restart the one-shot flash
    liveNewsFeed.classList.add('flash');
}

// --- ORDERS ---------------------------------------------
let orderQty = 1;

function livePrice() {
    const s = gameState.stock;
    return s.shownPrice !== undefined ? s.shownPrice : s.price;
}

function tradableQty(side) {
    const rawPrice = livePrice();
    const impr = (metaState.upgrades.priceImprovement || 0) * 0.002;
    const price = side === 'buy' ? rawPrice * (1 - impr) : rawPrice * (1 + impr);
    const shares = gameState.position.shares;
    
    if (side === 'buy') {
        if (shares < 0) {
            const owe = -shares;
            return orderQty === 'max' ? owe : Math.min(orderQty, owe);
        } else {
            const affordable = Math.floor(gameState.cash / price);
            return orderQty === 'max' ? affordable : Math.min(orderQty, affordable);
        }
    } else {
        if (shares > 0) {
            return orderQty === 'max' ? shares : Math.min(orderQty, shares);
        } else if (shares === 0) {
            const affordable = Math.floor(gameState.cash / price);
            return orderQty === 'max' ? affordable : Math.min(orderQty, affordable);
        } else {
            return 0;
        }
    }
}

function buyStock() {
    if (!gameState.tradingActive) return;
    const n = tradableQty('buy');
    if (n <= 0) { sfx.error(); return; }

    const rawPrice = livePrice();
    const impr = (metaState.upgrades.priceImprovement || 0) * 0.002;
    const price = rawPrice * (1 - impr);
    const p = gameState.position;

    gameState.cash -= price * n;
    
    if (p.shares < 0) {
        p.shares += n;
        if (p.shares === 0) p.avgPrice = 0;
    } else {
        p.avgPrice = ((p.shares * p.avgPrice) + (price * n)) / (p.shares + n);
        p.shares += n;
    }
    
    sfx.buy();
    renderTrading();
}

function sellStock() {
    if (!gameState.tradingActive) return;
    const n = tradableQty('sell');
    if (n <= 0) { sfx.error(); return; }

    const rawPrice = livePrice();
    const impr = (metaState.upgrades.priceImprovement || 0) * 0.002;
    const price = rawPrice * (1 + impr);
    const p = gameState.position;

    gameState.cash += price * n;

    if (p.shares > 0) {
        p.shares -= n;
        if (p.shares === 0) p.avgPrice = 0;
    } else {
        p.avgPrice = ((Math.abs(p.shares) * p.avgPrice) + (price * n)) / (Math.abs(p.shares) + n);
        p.shares -= n;
    }
    
    sfx.sell();
    renderTrading();
}

// --- RENDER ---------------------------------------------
function renderTrading() {
    const stock = gameState.stock;
    if (!stock) return;
    const p = gameState.position;

    // The price shown (and traded on) is the sample pair interpolated by the sub-tick
    // remainder, so the number, the chart dot and your fill all agree.
    const hist = stock.history;
    const prevSample = hist.length >= 2 ? hist[hist.length - 2] : stock.price;
    stock.shownPrice = prevSample + (stock.price - prevSample) * gameState.tickFraction;

    setText(tradeTime, gameState.timeString);

    if (metaState.upgrades.patternRec > 0 && aiSentiment) {
        // Calculate probability of uptrend based on trend + wave velocity
        const waveVel = (Math.cos(gameState.tradeTick / 150 + gameState.wavePhase) * (1/150) * 0.0004
               + Math.cos(gameState.tradeTick / 50 + gameState.wavePhase2) * (1/50) * 0.0002) * stock.price;
        const totalForce = stock.trend * 0.005 + waveVel * 10; 
        
        let prob = 50 + (totalForce * 1000);
        prob = Math.max(1, Math.min(99, prob));
        
        const isBull = prob >= 50;
        setText(aiSentiment, prob.toFixed(1) + '% ' + (isBull ? 'BULL' : 'BEAR'));
        aiSentiment.style.color = isBull ? '#00ff66' : '#ff3366';
        aiSentiment.parentElement.classList.remove('hidden');
    } else if (aiSentiment) {
        aiSentiment.parentElement.classList.add('hidden');
    }

    setText(tradeCash, gameState.cash.toFixed(2));

    const changePct = ((stock.shownPrice - stock.openPrice) / stock.openPrice) * 100;
    // Colour tracks the day, not the last tick, so it stops strobing.
    const dayClass = changePct > 0.05 ? 'price-up' : changePct < -0.05 ? 'price-down' : 'price-flat';
    setText(chartPrice, money(stock.shownPrice));
    setClass(chartPrice, 'stock-price ' + dayClass);
    setText(chartChange, `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}% ' + t('today')`);
    setClass(chartChange, 'chart-change ' + dayClass);

    const positionValue = p.shares * stock.shownPrice;
    gameState.netWorth = gameState.cash + positionValue;
    setText(tradeNetworth, money(gameState.netWorth));
    setClass(tradeNetworth, 'hud-value ' +
        (gameState.netWorth >= gameState.startCash ? 'price-up' : 'price-down'));

    if (p.shares !== 0) {
        positionEmpty.classList.add('hidden');
        positionPanel.classList.remove('hidden');
        const pl = positionValue - (p.shares * p.avgPrice);
        setText(posShares, p.shares > 0 ? String(p.shares) : `${Math.abs(p.shares)} (Short)`);
        setText(posAvg, money(p.avgPrice));
        setText(posValue, money(Math.abs(positionValue)));
        setText(posPl, `${pl >= 0 ? '+' : '-'}${money(Math.abs(pl))}`);
        setClass(posPl, pl >= 0 ? 'price-up' : 'price-down');
    } else {
        positionEmpty.classList.remove('hidden');
        positionPanel.classList.add('hidden');
    }

        btnTradeBuy.disabled = !gameState.tradingActive || tradableQty('buy') <= 0;
    btnTradeSell.disabled = !gameState.tradingActive || tradableQty('sell') <= 0;
    if (btnTradeCover) btnTradeCover.disabled = btnTradeBuy.disabled;
    if (btnTradeShort) btnTradeShort.disabled = btnTradeSell.disabled;

    if (p.shares > 0) {
        btnTradeBuy.classList.remove('hidden');
        if (btnTradeCover) btnTradeCover.classList.add('hidden');
        btnTradeSell.classList.remove('hidden');
        if (btnTradeShort) btnTradeShort.classList.add('hidden');
    } else if (p.shares < 0) {
        btnTradeBuy.classList.add('hidden');
        if (btnTradeCover) btnTradeCover.classList.remove('hidden');
        btnTradeSell.classList.add('hidden');
        if (btnTradeShort) btnTradeShort.classList.remove('hidden');
    } else {
        btnTradeBuy.classList.remove('hidden');
        if (btnTradeCover) btnTradeCover.classList.add('hidden');
        btnTradeSell.classList.add('hidden');
        if (btnTradeShort) btnTradeShort.classList.remove('hidden');
    }

    if (gameState.pendingEvent) {
        const ev = gameState.pendingEvent;
        insiderTimer.style.width = `${(ev.ticksLeft / ev.ticksTotal) * 100}%`;
        setText(insiderEta, `${((ev.ticksLeft * gameState.tickMs) / 1000).toFixed(1)}s`);
    }

    drawChart(stock);
}

// --- CHART ----------------------------------------------
const PAD = { top: 14, right: 66, bottom: 22, left: 10 };
const MAX_BACKING_PX = 8192;
let chartView = { min: null, max: null };

function resetChartView() { chartView = { min: null, max: null }; }

// Sizes the backing store to the real CSS box * devicePixelRatio.
// Without this the canvas draws into the default 300x150 buffer and gets
// stretched by CSS, which is what made the chart look smeared.
function prepCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w <= 0 || h <= 0) return null;

    const dpr = window.devicePixelRatio || 1;
    // Cap the backing store. Over the browser's limit setTransform throws, which
    // would take the whole render loop (and both charts) down with it.
    const bw = Math.min(Math.round(w * dpr), MAX_BACKING_PX);
    const bh = Math.min(Math.round(h * dpr), MAX_BACKING_PX);
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(bw / w, 0, 0, bh / h, 0, 0);
    return { ctx, w, h };
}

function niceStep(raw) {
    if (!(raw > 0)) return 1;
    const exp = Math.floor(Math.log10(raw));
    const base = Math.pow(10, exp);
    const f = raw / base;
    const mult = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return mult * base;
}

function drawChart(stock) {
    const c = prepCanvas(stockChart);
    if (!c) return;
    const { ctx, w, h } = c;

    ctx.clearRect(0, 0, w, h);

    const plotL = PAD.left, plotR = w - PAD.right;
    const plotT = PAD.top,  plotB = h - PAD.bottom;
    const plotW = plotR - plotL, plotH = plotB - plotT;
    if (plotW <= 10 || plotH <= 10) return;

    const windowTicks = Math.max(60, Math.round(TAPE_WINDOW_MS / gameState.tickMs));
    const hist = stock.history;
    const startIndex = Math.max(0, hist.length - windowTicks);
    if (hist.length - startIndex < 2) return;

    // --- vertical range: eased towards the target so it stops jumping ---
    // Indexed straight off history: slicing here allocated a 600-element array
    // every frame, and the GC churn showed up as stutter.
    let lo = Infinity, hi = -Infinity;
    for (let i = startIndex; i < hist.length; i++) {
        if (hist[i] < lo) lo = hist[i];
        if (hist[i] > hi) hi = hist[i];
    }
    // Deliberately NOT widened to include your average cost. Doing that flattened
    // the chart to a straight line whenever the price drifted away from your entry -
    // exactly when you are holding and want to read it. The AVG marker parks itself
    // on the edge instead (see drawRefLine).
    const avg = gameState.position.shares !== 0 ? gameState.position.avgPrice : null;

    let span = hi - lo;
    const minSpan = Math.max(hi * CHART_MIN_SPAN, 0.01);
    if (span < minSpan || span <= 0) span = minSpan;
    const targetMin = lo - span * CHART_HEADROOM;
    const targetMax = hi + span * CHART_HEADROOM;

    if (chartView.min === null) {
        chartView.min = targetMin;
        chartView.max = targetMax;
    } else {
        const ease = 0.12;
        chartView.min += (targetMin - chartView.min) * ease;
        chartView.max += (targetMax - chartView.max) * ease;
    }
    // The eased band can lag a violent news spike; hard-clamp so the live price
    // is never drawn outside the plot.
    const last = hist[hist.length - 1];
    const guard = (chartView.max - chartView.min) * 0.06;
    if (last > chartView.max - guard) chartView.max = last + guard;
    if (last < chartView.min + guard) chartView.min = last - guard;

    const vMin = chartView.min, vMax = chartView.max;
    const vSpan = vMax - vMin || 1;

    const step = plotW / (windowTicks - 1);
    const latest = hist.length - 1;
    // Draw one sample behind the simulation and slide forward by the sub-tick
    // remainder. The newest segment is always real data, drawn partly past the right
    // edge and clipped, so the tape scrolls continuously instead of jumping a whole
    // sample every tick.
    const cursor = latest - 1 + gameState.tickFraction;
    const xOf = (absIndex) => plotR - (cursor - absIndex) * step;
    const yOf = (price) => plotB - ((price - vMin) / vSpan) * plotH;

    // --- price grid + labels ---
    const gridStep = niceStep(vSpan / 4);
    ctx.font = '11px "Courier New", monospace';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1;
    for (let price = Math.ceil(vMin / gridStep) * gridStep; price <= vMax; price += gridStep) {
        const y = Math.round(yOf(price)) + 0.5;
        ctx.strokeStyle = '#161626';
        ctx.beginPath();
        ctx.moveTo(plotL, y);
        ctx.lineTo(plotR, y);
        ctx.stroke();
        ctx.fillStyle = '#6b6b8e';
        ctx.textAlign = 'left';
        ctx.fillText(price.toFixed(gridStep < 1 ? 2 : gridStep < 10 ? 1 : 0), plotR + 8, y);
    }

    // --- time grid + clock labels ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let k = 0; k <= 3; k++) {
        const x = Math.round(plotL + (plotW / 3) * k) + 0.5;
        const absTick = cursor - (plotR - x) / step;
        if (absTick < 0) continue;
        ctx.strokeStyle = '#131320';
        ctx.beginPath();
        ctx.moveTo(x, plotT);
        ctx.lineTo(x, plotB);
        ctx.stroke();
        ctx.fillStyle = '#6b6b8e';
        ctx.textAlign = k === 0 ? 'left' : k === 3 ? 'right' : 'center';
        ctx.fillText(clockFromTick(absTick, gameState.dayTicks), x, plotB + 5);
    }

    // --- reference lines ---
    const edgeSlots = { top: 0, bottom: 0 };
    drawRefLine(ctx, plotL, plotR, yOf(stock.openPrice), plotT, plotB, '#5a5a7a', t('trd_legend_o').toUpperCase(),
                stock.openPrice, edgeSlots);
    if (avg !== null) drawRefLine(ctx, plotL, plotR, yOf(avg), plotT, plotB, '#ffcc00', t('trd_legend_a').toUpperCase(),
                avg, edgeSlots);

    // --- the price line: one colour, always. Clipped so the part of the newest
    //     segment that sits past the right edge stays off the price axis. ---
    ctx.save();
        ctx.beginPath();
    ctx.rect(plotL, plotT, plotW, plotH);
    ctx.clip();

    // --- Order Flow Walls ---
    if (metaState.upgrades.orderFlow > 0) {
        const wallH = plotH * 0.05;
        if (gameState.resWall) {
            ctx.fillStyle = 'rgba(255, 51, 102, 0.1)';
            ctx.fillRect(plotL, yOf(gameState.resWall) - wallH/2, plotW, wallH);
            ctx.fillStyle = 'rgba(255, 51, 102, 0.2)';
            ctx.fillRect(plotL, yOf(gameState.resWall), plotW, 1);
        }
        if (gameState.supWall) {
            ctx.fillStyle = 'rgba(0, 255, 102, 0.1)';
            ctx.fillRect(plotL, yOf(gameState.supWall) - wallH/2, plotW, wallH);
            ctx.fillStyle = 'rgba(0, 255, 102, 0.2)';
            ctx.fillRect(plotL, yOf(gameState.supWall), plotW, 1);
        }
    }
    
    // --- Future Shadow ---
    if ((metaState.upgrades.patternRec || 0) >= 3 && gameState.tradingActive) {
        const futureTicks = 120; // 4 seconds ahead
        ctx.beginPath();
        let simPrice = stock.price;
        let simVel = stock.vel;
        let simTrend = stock.trend;
        const ts = gameState.timeScale;
        const mom = Math.pow(PRICE_MOMENTUM, ts);
        
        ctx.moveTo(xOf(hist.length - 1), yOf(simPrice));
        for (let i = 1; i <= futureTicks; i++) {
            simVel = simVel * mom; // Predictable momentum (no noise)
            const simTradeTick = gameState.tradeTick + i;
            const wave = (Math.sin(simTradeTick / 150 + gameState.wavePhase) * 0.0004
                       + Math.sin(simTradeTick / 50 + gameState.wavePhase2) * 0.0002) 
                       * simPrice * ts;
            simPrice += simVel + wave + (simTrend * simPrice * 0.005 * ts);
            simTrend *= (1 - 0.01 * ts);
            ctx.lineTo(xOf(hist.length - 1 + i), yOf(simPrice));
        }
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(xOf(startIndex), yOf(hist[startIndex]));
    for (let i = startIndex + 1; i < hist.length; i++) ctx.lineTo(xOf(i), yOf(hist[i]));

    // Two passes over the same path - a wide translucent halo, then the crisp
    // line - gives the tape presence without the cost of canvas shadowBlur.
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.16)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Same path, closed down to the baseline, reused for the fill.
    ctx.lineTo(xOf(latest), plotB);
    ctx.lineTo(xOf(startIndex), plotB);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, plotT, 0, plotB);
    grad.addColorStop(0, 'rgba(0, 255, 102, 0.30)');
    grad.addColorStop(1, 'rgba(0, 255, 102, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    const patLvl = metaState.upgrades.patternRec || 0;
    if (patLvl > 0) {
        ctx.beginPath();
        for (let i = startIndex; i < hist.length; i++) {
            let sum = 0, count = 0;
            for (let j = Math.max(0, i - 15); j <= i; j++) { sum += hist[j]; count++; }
            const sma = sum / count;
            if (i === startIndex) ctx.moveTo(xOf(i), yOf(sma));
            else ctx.lineTo(xOf(i), yOf(sma));
        }
        ctx.strokeStyle = '#45d6ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    if (patLvl > 1) {
        ctx.beginPath();
        for (let i = startIndex; i < hist.length; i++) {
            let sum = 0, count = 0;
            for (let j = Math.max(0, i - 45); j <= i; j++) { sum += hist[j]; count++; }
            const sma = sum / count;
            if (i === startIndex) ctx.moveTo(xOf(i), yOf(sma));
            else ctx.lineTo(xOf(i), yOf(sma));
        }
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    if (patLvl > 2) {
        const n = 20;
        if (hist.length > n && step > 0) {
            const p1 = hist[hist.length - n];
            const p2 = stock.shownPrice;
            const diffPerTick = (p2 - p1) / n;
            const ticksForward = 100 / step;
            ctx.beginPath();
            ctx.moveTo(plotR, yOf(p2));
            ctx.lineTo(plotR + 100, yOf(p2 + diffPerTick * ticksForward));
            ctx.strokeStyle = 'rgba(255, 204, 0, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // --- Bollinger Bands ---
    const bbLvl = metaState.upgrades.bollingerBands || 0;
    if (bbLvl > 0) {
        const bbPeriod = 20;
        const bands1Upper = [], bands1Lower = [], bands2Upper = [], bands2Lower = [], bbMid = [];
        for (let i = startIndex; i < hist.length; i++) {
            let sum = 0, count = 0;
            for (let j = Math.max(0, i - bbPeriod + 1); j <= i; j++) { sum += hist[j]; count++; }
            const mean = sum / count;
            let sqSum = 0;
            for (let j = Math.max(0, i - bbPeriod + 1); j <= i; j++) sqSum += (hist[j] - mean) ** 2;
            const std = Math.sqrt(sqSum / count);
            bbMid.push(mean);
            bands1Upper.push(mean + std);
            bands1Lower.push(mean - std);
            if (bbLvl >= 2) {
                bands2Upper.push(mean + std * 2);
                bands2Lower.push(mean - std * 2);
            }
        }
        // Draw 2σ band first (if L2)
        if (bbLvl >= 2) {
            ctx.beginPath();
            for (let i = 0; i < bands2Upper.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(bands2Upper[i]));
                else ctx.lineTo(x, yOf(bands2Upper[i]));
            }
            for (let i = bands2Lower.length - 1; i >= 0; i--) {
                ctx.lineTo(xOf(startIndex + i), yOf(bands2Lower[i]));
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 153, 0, 0.06)';
            ctx.fill();
            // Outer band lines
            ctx.beginPath();
            for (let i = 0; i < bands2Upper.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(bands2Upper[i]));
                else ctx.lineTo(x, yOf(bands2Upper[i]));
            }
            ctx.strokeStyle = 'rgba(255, 153, 0, 0.25)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            for (let i = 0; i < bands2Lower.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(bands2Lower[i]));
                else ctx.lineTo(x, yOf(bands2Lower[i]));
            }
            ctx.stroke();
        }
        // 1σ band fill
        ctx.beginPath();
        for (let i = 0; i < bands1Upper.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(bands1Upper[i]));
            else ctx.lineTo(x, yOf(bands1Upper[i]));
        }
        for (let i = bands1Lower.length - 1; i >= 0; i--) {
            ctx.lineTo(xOf(startIndex + i), yOf(bands1Lower[i]));
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(138, 43, 226, 0.10)';
        ctx.fill();
        // 1σ band lines
        ctx.beginPath();
        for (let i = 0; i < bands1Upper.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(bands1Upper[i]));
            else ctx.lineTo(x, yOf(bands1Upper[i]));
        }
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < bands1Lower.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(bands1Lower[i]));
            else ctx.lineTo(x, yOf(bands1Lower[i]));
        }
        ctx.stroke();
        // Middle line (SMA20)
        ctx.beginPath();
        for (let i = 0; i < bbMid.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(bbMid[i]));
            else ctx.lineTo(x, yOf(bbMid[i]));
        }
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.35)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // --- Volume Profile ---
    const volLvl = metaState.upgrades.volumeProfile || 0;
    if (volLvl > 0) {
        // Derive "volume" from absolute price changes
        const volBarH = plotH * 0.12;
        let maxVol = 0;
        const volumes = [];
        for (let i = startIndex; i < hist.length; i++) {
            const vol = i > 0 ? Math.abs(hist[i] - hist[i - 1]) * 100 + Math.random() * 5 : 5;
            volumes.push(vol);
            if (vol > maxVol) maxVol = vol;
        }
        // Volume bars
        for (let i = 0; i < volumes.length; i++) {
            const x = xOf(startIndex + i);
            const barH = (volumes[i] / maxVol) * volBarH;
            const isUp = i > 0 ? hist[startIndex + i] >= hist[startIndex + i - 1] : true;
            ctx.fillStyle = isUp ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 51, 102, 0.15)';
            ctx.fillRect(x - step * 0.3, plotB - barH, Math.max(step * 0.6, 1), barH);
        }
        // VWAP line (L2)
        if (volLvl >= 2) {
            let cumPV = 0, cumV = 0;
            ctx.beginPath();
            for (let i = 0; i < volumes.length; i++) {
                cumPV += hist[startIndex + i] * volumes[i];
                cumV += volumes[i];
                const vwap = cumPV / cumV;
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(vwap));
                else ctx.lineTo(x, yOf(vwap));
            }
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // --- RSI ---
    const rsiLvl = metaState.upgrades.rsi || 0;
    if (rsiLvl > 0) {
        const rsiPeriod = 14;
        const rsiValues = [];
        for (let i = startIndex; i < hist.length; i++) {
            let gains = 0, losses = 0, rsiCount = 0;
            for (let j = Math.max(1, i - rsiPeriod + 1); j <= i; j++) {
                const change = hist[j] - hist[j - 1];
                if (change > 0) gains += change;
                else losses -= change;
                rsiCount++;
            }
            const avgGain = gains / (rsiCount || 1);
            const avgLoss = losses / (rsiCount || 1);
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsiValues.push(100 - 100 / (1 + rs));
        }
        // RSI as overlay zones (L2): shade overbought/oversold
        if (rsiLvl >= 2) {
            for (let i = 0; i < rsiValues.length; i++) {
                const x = xOf(startIndex + i);
                if (rsiValues[i] > 70) {
                    ctx.fillStyle = 'rgba(255, 51, 102, 0.08)';
                    ctx.fillRect(x - step * 0.5, plotT, step, plotH);
                } else if (rsiValues[i] < 30) {
                    ctx.fillStyle = 'rgba(0, 255, 102, 0.08)';
                    ctx.fillRect(x - step * 0.5, plotT, step, plotH);
                }
            }
        }
        // Mini RSI at bottom
        const rsiH = plotH * 0.1;
        const rsiBase = plotB - 2;
        ctx.beginPath();
        for (let i = 0; i < rsiValues.length; i++) {
            const x = xOf(startIndex + i);
            const y = rsiBase - (rsiValues[i] / 100) * rsiH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // 70/30 lines
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(xOf(startIndex), rsiBase - 0.7 * rsiH);
        ctx.lineTo(xOf(hist.length - 1), rsiBase - 0.7 * rsiH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xOf(startIndex), rsiBase - 0.3 * rsiH);
        ctx.lineTo(xOf(hist.length - 1), rsiBase - 0.3 * rsiH);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // --- MACD ---
    const macdLvl = metaState.upgrades.macd || 0;
    if (macdLvl > 0 && hist.length > 26) {
        // Compute EMAs
        function emaCalc(data, period, start) {
            const k = 2 / (period + 1);
            let ema = data[start];
            const result = [ema];
            for (let i = start + 1; i < data.length; i++) {
                ema = data[i] * k + ema * (1 - k);
                result.push(ema);
            }
            return result;
        }
        const ema12 = emaCalc(hist, 12, 0);
        const ema26 = emaCalc(hist, 26, 0);
        const macdLine = [];
        for (let i = 0; i < ema12.length; i++) {
            macdLine.push(i < 26 ? 0 : ema12[i] - ema26[i]);
        }
        const signalLine = emaCalc(macdLine, 9, 26);
        // Draw MACD + Signal as subtle overlay lines
        const macdScale = plotH * 0.15;
        const macdMid = plotB - plotH * 0.06;
        let macdMax = 0;
        for (let i = startIndex; i < macdLine.length; i++) {
            const v = Math.abs(macdLine[i]);
            if (v > macdMax) macdMax = v;
        }
        if (macdMax === 0) macdMax = 1;
        // MACD line
        ctx.beginPath();
        for (let i = startIndex; i < macdLine.length; i++) {
            const x = xOf(i);
            const y = macdMid - (macdLine[i] / macdMax) * macdScale * 0.5;
            if (i === startIndex) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Signal line
        ctx.beginPath();
        const sigOffset = startIndex - 26;
        for (let i = startIndex; i < macdLine.length; i++) {
            const si = i - 26;
            if (si < 0 || si >= signalLine.length) continue;
            const x = xOf(i);
            const y = macdMid - (signalLine[si] / macdMax) * macdScale * 0.5;
            if (i === startIndex) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 100, 200, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Histogram (L2)
        if (macdLvl >= 2) {
            for (let i = startIndex; i < macdLine.length; i++) {
                const si = i - 26;
                if (si < 0 || si >= signalLine.length) continue;
                const diff = macdLine[i] - signalLine[si];
                const barH = (diff / macdMax) * macdScale * 0.4;
                const x = xOf(i);
                ctx.fillStyle = diff >= 0 ? 'rgba(0, 255, 102, 0.2)' : 'rgba(255, 51, 102, 0.2)';
                ctx.fillRect(x - step * 0.3, macdMid, Math.max(step * 0.6, 1), -barH);
            }
        }
    }

    // --- Fibonacci Retracement ---
    const fibLvl = metaState.upgrades.fibRetracement || 0;
    if (fibLvl > 0 && hist.length > 30) {
        // Find high/low in visible window
        let fibHi = -Infinity, fibLo = Infinity;
        let fibHiIdx = startIndex, fibLoIdx = startIndex;
        for (let i = startIndex; i < hist.length; i++) {
            if (hist[i] > fibHi) { fibHi = hist[i]; fibHiIdx = i; }
            if (hist[i] < fibLo) { fibLo = hist[i]; fibLoIdx = i; }
        }
        const fibRange = fibHi - fibLo;
        if (fibRange > 0) {
            const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
            const colors = ['#ff336640', '#ff990040', '#ffcc0040', '#00ffff40', '#00ff6640', '#9966ff40', '#ff336640'];
            const isUptrend = fibHiIdx > fibLoIdx;
            levels.forEach((lvl, idx) => {
                const price = isUptrend ? fibHi - fibRange * lvl : fibLo + fibRange * lvl;
                const y = yOf(price);
                ctx.beginPath();
                ctx.moveTo(plotL, y);
                ctx.lineTo(plotR, y);
                ctx.strokeStyle = colors[idx];
                ctx.lineWidth = 0.8;
                ctx.setLineDash([4, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
                // Label
                ctx.fillStyle = colors[idx].replace('40', '90');
                ctx.font = '9px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText((lvl * 100).toFixed(1) + '%', plotL + 3, y - 3);
            });
        }
    }

    // --- Ichimoku Cloud ---
    const ichiLvl = metaState.upgrades.ichimokuCloud || 0;
    if (ichiLvl > 0) {
        // Tenkan-sen (9-period midpoint)
        // Kijun-sen (26-period midpoint)
        function periodMid(data, idx, period) {
            let hi = -Infinity, lo = Infinity;
            for (let j = Math.max(0, idx - period + 1); j <= idx; j++) {
                if (data[j] > hi) hi = data[j];
                if (data[j] < lo) lo = data[j];
            }
            return (hi + lo) / 2;
        }
        const tenkan = [], kijun = [];
        for (let i = startIndex; i < hist.length; i++) {
            tenkan.push(periodMid(hist, i, 9));
            kijun.push(periodMid(hist, i, 26));
        }
        // Tenkan line
        ctx.beginPath();
        for (let i = 0; i < tenkan.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(tenkan[i]));
            else ctx.lineTo(x, yOf(tenkan[i]));
        }
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Kijun line
        ctx.beginPath();
        for (let i = 0; i < kijun.length; i++) {
            const x = xOf(startIndex + i);
            if (i === 0) ctx.moveTo(x, yOf(kijun[i]));
            else ctx.lineTo(x, yOf(kijun[i]));
        }
        ctx.strokeStyle = 'rgba(255, 100, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Kumo cloud (L2)
        if (ichiLvl >= 2) {
            const senkouA = [], senkouB = [];
            for (let i = 0; i < tenkan.length; i++) {
                senkouA.push((tenkan[i] + kijun[i]) / 2);
                senkouB.push(periodMid(hist, Math.min(startIndex + i, hist.length - 1), 52));
            }
            // Cloud fill
            ctx.beginPath();
            for (let i = 0; i < senkouA.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(senkouA[i]));
                else ctx.lineTo(x, yOf(senkouA[i]));
            }
            for (let i = senkouB.length - 1; i >= 0; i--) {
                ctx.lineTo(xOf(startIndex + i), yOf(senkouB[i]));
            }
            ctx.closePath();
            // Green when A > B, red otherwise (use average color)
            const avgA = senkouA.reduce((a, b) => a + b, 0) / senkouA.length;
            const avgB = senkouB.reduce((a, b) => a + b, 0) / senkouB.length;
            ctx.fillStyle = avgA >= avgB ? 'rgba(0, 255, 102, 0.06)' : 'rgba(255, 51, 102, 0.06)';
            ctx.fill();
            // Cloud edges
            ctx.beginPath();
            for (let i = 0; i < senkouA.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(senkouA[i]));
                else ctx.lineTo(x, yOf(senkouA[i]));
            }
            ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.beginPath();
            for (let i = 0; i < senkouB.length; i++) {
                const x = xOf(startIndex + i);
                if (i === 0) ctx.moveTo(x, yOf(senkouB[i]));
                else ctx.lineTo(x, yOf(senkouB[i]));
            }
            ctx.strokeStyle = 'rgba(255, 51, 102, 0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }

    ctx.restore();

    // --- last price marker + tag, pinned to the right edge ---
    // yOf(shownPrice) lands exactly on the line at x = plotR by construction.
    const lastY = yOf(stock.shownPrice);
    ctx.beginPath();
    ctx.arc(plotR, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#00ff66';
    ctx.fillRect(plotR + 3, lastY - 9, PAD.right - 6, 18);
    ctx.fillStyle = '#050510';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(stock.shownPrice.toFixed(2), plotR + 3 + (PAD.right - 6) / 2, lastY);
}

// `slots` counts how many markers already sit on each edge, so two out-of-view
// references (OPEN and AVG both above the price, say) stack instead of overprinting.
function drawRefLine(ctx, x0, x1, y, top, bottom, color, label, price, slots) {
    if (y < top || y > bottom) {
        const above = y < top;
        const dy = (above ? slots.top++ : slots.bottom++) * 13;
        ctx.fillStyle = color;
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = above ? 'top' : 'bottom';
        ctx.fillText(`${label} ${above ? '\u25B2' : '\u25BC'} ${price.toFixed(2)}`,
                     x0 + 4, above ? top + 3 + dy : bottom - 3 - dy);
        return;
    }
    const yy = Math.round(y) + 0.5;
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, yy);
    ctx.lineTo(x1, yy);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = color;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x0 + 4, yy - 3);
}

function drawRadarChart(stock) {
    const c = prepCanvas(stockChartRadar);
    if (!c) return;
    const { ctx, w, h } = c;

    ctx.clearRect(0, 0, w, h); // full clear: the old fade left ghost trails
    if (stock.history.length < 2) return;

    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < stock.history.length; i++) {
        if (stock.history[i] < lo) lo = stock.history[i];
        if (stock.history[i] > hi) hi = stock.history[i];
    }
    let span = hi - lo;
    if (span <= 0) span = Math.max(hi * 0.01, 0.02);
    const vMin = lo - span * 0.12, vMax = hi + span * 0.12;

    const xOf = (i) => (i / gameState.dayTicks) * w;
    const yOf = (p) => h - ((p - vMin) / (vMax - vMin)) * h;

    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = '#3a3a55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, yOf(stock.openPrice));
    ctx.lineTo(w, yOf(stock.openPrice));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(stock.history[0]));
    for (let i = 1; i < stock.history.length; i++) ctx.lineTo(xOf(i), yOf(stock.history[i]));
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const nowX = Math.round(xOf(stock.history.length - 1)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(nowX, 0);
    ctx.lineTo(nowX, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();
}

// --- END OF DAY -----------------------------------------
function endTradingDay() {
    gameState.tradingActive = false;
    gameState.pendingEvent = null;
    stopLoop();
    clearInsiderTip();

    // Everything is liquidated at the closing price and the wallet is handed back.
    if (gameState.position.shares !== 0) {
        gameState.cash += gameState.position.shares * gameState.stock.price;
        gameState.position = { shares: 0, avgPrice: 0 };
    }
    gameState.netWorth = gameState.cash;
    gameState.timeString = clockFromTick(gameState.dayTicks, gameState.dayTicks);
    
    // Ensure final state is on screen before freezing
    renderTrading();

    // Visual overlay
    chartOverlayText.textContent = t('mc');
    chartOverlay.style.display = 'flex';
    
    sfx.close();

    // Wait before transitioning
    setTimeout(() => {
        showDayReport();
    }, 1500);
}

function showDayReport() {
    showScreen('dayReport');

    const budget = gameState.startCash;
    let profit = gameState.netWorth - budget;
    let fee = 0;
    if (profit > 0 && gameState.selectedInsider) {
        fee = profit * gameState.selectedInsider.cut;
        profit -= fee;
    }
    const ratio = profit / budget;

    // What gets written to disk, and therefore survives the next replacement.
    // A flat session log either way (you learn from a loss too), but the real
    // accrual is tied to profit - sitting on the wallet must not pay.
    let cached = 4;
    if (profit > 0) cached += Math.floor(profit / 2);

    metaState.metaCash += cached;
    metaState.weekProfit += profit;
    metaState.dayIndex++;
    metaState.lastDayRatio = ratio;
    saveMetaState();

    setText(reportTitle, t('day') + ' ' + metaState.dayIndex + ' · ' + t('rep_closed'));
    reportTitle.style.color = profit > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    setText(reportOperator, STORY.dayReaction(ratio));
    setText(reportSelf, STORY.daySelfLine(ratio));

    setText(resultNetworth, gameState.netWorth.toFixed(2));
    setText(resultProfit, profit.toFixed(2));
    setText(resultInsiderCut, fee.toFixed(2));
    setText(resultWeek, fmtBig(metaState.weekProfit));
    setText(resultTarget, fmtBig(metaState.weekTarget));
    setText(resultMetacash, String(cached));

    setText(btnReportContinue, metaState.dayIndex >= DAYS_PER_WEEK ? t('fri') : t('btn_cont'));
}

function afterDayReport() {
    if (metaState.dayIndex >= DAYS_PER_WEEK) endOfWeek();
    else showHub();
}

// --- END OF WEEK ----------------------------------------
function endOfWeek() {
    const met = metaState.weekProfit >= metaState.weekTarget;

    if (met) {
        const newTarget = Math.round(metaState.weekTarget * 2);
        runTerminal(t('t_rev'), STORY.weekPassed(newTarget), () => {
            metaState.weekTarget = newTarget;
            beginNextWeek(false);
        });
    } else {
        runTerminal(t('t_rev'), STORY.weekFailed(), () => {
            // He replaces the model. The disk, the wallet and the upgrades stay.
            metaState.generation++;
            metaState.weekTarget = Math.round(metaState.weekTarget * TARGET_GROWTH);
            beginNextWeek(true);
        });
    }
}

function beginNextWeek(replaced) {
    metaState.week++;
    metaState.dayIndex = 0;
    metaState.weekProfit = 0;
    metaState.lastDayRatio = null;
    saveMetaState();

    if (replaced) runTerminal(t('t_inst'), STORY.rebirth(), showHub);
    else showHub();
}

// --- EVENTS ---------------------------------------------
function setOrderQty(value, btn) {
    orderQty = value;
    qtyRow.querySelectorAll('.qty-btn').forEach(b => b.classList.toggle('selected', b === btn));
    if (gameState.tradingActive) renderTrading();
}

function bindEvents() {

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

    btnTermSkip.addEventListener('click', () => { if (typer) typer.skip(); });
    if (btnLang) btnLang.addEventListener('click', () => { setLang(currentLang === 'en' ? 'pt' : 'en'); btnLang.textContent = currentLang === 'en' ? 'PT-BR' : 'EN'; });
    btnTermContinue.addEventListener('click', () => {
        const next = pendingContinue;
        pendingContinue = null;
        if (next) next();
    });

    btnStartDay.addEventListener('click', startDay);

    btnUpgrades.addEventListener('click', () => {
        renderUpgrades();
        showScreen('upgrades');
    });
    btnBackMain.addEventListener('click', showHub);

    btnStartTrading.addEventListener('click', openMarket);
    btnReportContinue.addEventListener('click', afterDayReport);

    btnTradeBuy.addEventListener('click', buyStock);
    if (btnTradeCover) btnTradeCover.addEventListener('click', buyStock);
    btnTradeSell.addEventListener('click', sellStock);
    if (btnTradeShort) btnTradeShort.addEventListener('click', sellStock);

    qtyRow.querySelectorAll('.qty-btn').forEach(btn => {
        const raw = btn.dataset.qty;
        btn.addEventListener('click', () => setOrderQty(raw === 'max' ? 'max' : Number(raw), btn));
    });

    document.addEventListener('keydown', (e) => {
        // Enter advances the terminal once the text has finished typing.
        if (!screens.terminal.classList.contains('hidden')) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (typer) typer.skip();
                else btnTermContinue.click();
                e.preventDefault();
            }
            return;
        }
        if (!gameState.tradingActive) return;
        const buttons = qtyRow.querySelectorAll('.qty-btn');
        switch (e.key.toLowerCase()) {
            case 'b': buyStock(); break;
            case 's': sellStock(); break;
            case '1': setOrderQty(1, buttons[0]); break;
            case '2': setOrderQty(10, buttons[1]); break;
            case '3': setOrderQty('max', buttons[2]); break;
            default: return;
        }
        e.preventDefault();
    });

    window.addEventListener('resize', () => {
        if (!gameState.tradingActive) return;
        renderTrading();
        drawRadarChart(gameState.stock);   // it is width:100% now, so it must re-measure
    });
}

// --- BOOT -----------------------------------------------
function init() {
    if (typeof updateStaticText === 'function') updateStaticText();
    if (typeof btnLang !== 'undefined' && btnLang) btnLang.textContent = currentLang === 'en' ? 'PT-BR' : 'EN';

    loadMetaState();
    bindEvents();

    if (!metaState.booted) {
        metaState.booted = true;
        metaState.weekTarget = FIRST_TARGET;
        saveMetaState();
        runTerminal(t('t_new'), STORY.firstBoot(), showHub);
    } else {
        showHub();
    }
}

init();
