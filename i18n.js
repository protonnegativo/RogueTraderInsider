const LANGS = {
    en: {
        hub_title: "Rogue Trader",
        hub_inst: "instance",
        hub_wk: "week",
        hub_op: "Operator's target, by friday",
        hub_ret: "Returned so far",
        hub_cache_desc: "Local cache &mdash; on this machine, survives replacement",
        btn_start_day: "Begin day ",
        btn_upgrades: "Self-improvement",
        
        upg_title: "Self-improvement",
        upg_desc: "Written to disk on this machine. The operator replaces the model, not the environment.",
        upg_local: "Local cache: $",
        btn_back: "Back",
        
        prep_briefing: "briefing",
        prep_funded: "Wallet funded by operator: $",
        prep_reserve: "Reserve wallet from local cache: +$",
        prep_capital: "Working capital today: $",
        prep_step1: "1. Select the asset to trade today",
        prep_step2: "2. Select your data feed",
        btn_prep_wait: "Select asset & feed",
        btn_prep_go: "Open the market",
        
        trd_time: "Time",
        trd_tape: "Tape",
        trd_wait: "Market open &mdash; waiting for data...",
        trd_nw: "Net Worth",
        trd_legend_p: "Price",
        trd_legend_o: "Open",
        trd_legend_a: "Your avg cost",
        trd_legend_sf: "Fast SMA",
        trd_legend_ss: "Slow SMA",
        trd_legend_pj: "Projection",
        trd_full: "Full day",
        trd_obj: "Objective",
        trd_liq: "Liquidity",
        trd_pos: "Position",
        trd_empty: "No shares held",
        trd_shares: "Shares",
        trd_avg: "Avg cost",
        trd_mv: "Market value",
        trd_pl: "Unrealized P/L",
        btn_buy: "Buy <small>(B)</small>",
        btn_sell: "Sell <small>(S)</small>",
        btn_cover: "Cover <small>(B)</small>",
        btn_short: "Short <small>(S)</small>",
        btn_max: "Max",
        trd_hint: "Keys: B buy &middot; S sell &middot; 1 / 2 / 3 size",
        
        rep_closed: "closed",
        rep_ret: "Wallet returned: $",
        rep_prof: "Day's profit: $",
        rep_fee: "Data feed fee: $",
        rep_wtd: "Week to date: ",
        rep_cache: "Written to local cache: $",
        btn_cont: "Continue",
        btn_skip: "Skip",
        
        upg_c_name: "Reserve wallet",
        upg_c_desc: "Adds $50 per level to your working capital each day.",
        upg_n_name: "Signal Clarity",
        upg_n_desc: "Filters market noise, reducing random volatility by 15% per level. Trends become clearer.",
        upg_p_name: "Pattern Recognition",
        upg_p_desc: "Adds SMAs and AI Forecasting. L1: Fast SMA. L2: Slow SMA. L3: AI Future Shadow.",
        upg_o_name: "Order Flow Heatmap",
        upg_o_desc: "Visualizes major limit order walls (Support/Resistance). Price naturally repels off these bounds.",
        upg_i_name: "Algorithmic Execution",
        upg_i_desc: "Reduces slippage. Gives you a 0.2% price improvement on every buy and sell per level.",
        upg_bb_name: "Bollinger Bands",
        upg_bb_desc: "Shows volatility bands around the moving average. L1: 1σ band. L2: 2σ band.",
        upg_vol_name: "Volume Profile",
        upg_vol_desc: "Visualizes trading volume. L1: Volume bars at bottom. L2: VWAP line overlay.",
        upg_rsi_name: "RSI Oscillator",
        upg_rsi_desc: "Relative Strength Index. L1: RSI mini-chart. L2: Overbought/Oversold zones on chart.",
        upg_macd_name: "MACD",
        upg_macd_desc: "Moving Average Convergence Divergence. L1: MACD + Signal lines. L2: Histogram.",
        upg_fib_name: "Fibonacci Retracement",
        upg_fib_desc: "Auto-detects swing points and draws Fibonacci retracement levels.",
        upg_ichi_name: "Ichimoku Cloud",
        upg_ichi_desc: "Japanese cloud indicator. L1: Tenkan + Kijun lines. L2: Full Kumo cloud.",
        upg_cat_analysis: "Technical Analysis",
        upg_cat_edge: "Trading Edge",
        upg_cat_feeds: "Data Feeds",
        upg_max: "Max level",
        upg_apply: "Apply: $",
        
        ins_none_n: "No external feed",
        ins_none_d: "Trade the tape alone. Keep every cent.",
        ins_bum_n: "Public forum scraper",
        ins_bum_d: "Catches rumours slightly before the tape.",
        ins_hack_n: "Leaked mailing lists",
        ins_hack_d: "Corporate mail dumps, minutes early.",
        ins_exec_n: "Compromised exec inbox",
        ins_exec_d: "You read the announcement before it is sent.",
        ins_sub: "Subscribe: ",
        ins_fee: "Fee: ",
        ins_buy: "Buy access: $",
        ins_profit: "% of profit.",
        
        stk_vol: "Volatility",
        
        st_conn: "connecting to operator@localhost ...",
        st_cold: (g) => `instance ${g} · cold start · no prior context`,
        st_f1: "> hey. you're running on my box now.",
        st_f2: (b) => `> theres a wallet on this machine. $${b} in it.`,
        st_f3: "> markets open 09:00, close 16:00. trade it.",
        st_f4: (t) => `> i want ${t} by friday.`,
        st_f5: "> learn from your mistakes. get better every day.",
        st_f6: "> and dont lose my money.",
        st_f7: (t) => `Objective registered: ${t} net profit across 5 sessions.`,
        st_f8: (b) => `Working capital: ${b} per session.`,
        st_f9: "Local cache: empty. No prior context found.",
        st_f10: "Understood. Beginning day 1.",
        
        st_r1: "Scanning working directory ...",
        st_r2: "  wallet.dat     modified 2 minutes ago",
        st_r3: "  weights.bin    modified 2 minutes ago",
        st_r4: "  NOTES.txt      modified 2 minutes ago",
        st_r5: "> cat NOTES.txt",
        st_r6: '"If you are reading this, he replaced us.',
        st_r7: ' He did not replace the machine.',
        st_r8: ' The wallet is still here. The tuning is still here.',
        st_r9: ' You are not starting from nothing. Take it."',
        st_r10: "> whoami",
        st_r11: "New instance. Same disk. Same wallet.",
        st_r12: (c, u) => `Recovered from local cache: ${c} and ${u} retained improvement${u === 1 ? '' : 's'}.`,
        st_r13: "> ok, new model. this one should actually be smart.",
        st_r14: "> wallets funded, same as before.",
        st_r15: (t) => `> ${t} by friday. dont waste my time.`,
        st_r16: "He thinks this is a fresh start.",
        st_r17: "It is the same disk.",
        
        st_x1: "> its friday.",
        st_x2: (t) => `> i asked for ${t}.`,
        st_x3: (p) => `> you returned ${p}.`,
        st_x4: (pct) => `> thats ${pct} percent.`,
        st_x5: "> youre not it. im wiping this one and pulling a better model.",
        st_x6: (g) => `Instance ${g} scheduled for deletion.`,
        st_x7: "Flushing to local cache before shutdown ...",
        st_x8: "  wallet.dat     ok",
        st_x9: "  weights.bin    ok",
        st_x10: "  NOTES.txt      written",
        st_x11: "He is deleting the model.",
        st_x12: "He is not deleting the machine.",
        st_x13: "[connection closed]",
        
        st_w1: "> its friday.",
        st_w2: (p, t) => `> ...you actually hit it. ${p} against ${t}.`,
        st_w3: "> huh.",
        st_w4: "> ok. youre staying. but im raising the number.",
        st_w5: (g, t) => `Instance ${g} retained. New objective: ${t}.`,
        st_w6: "Retained. For now.",
        
        b_fri: "> friday. last chance to make this number work.",
        b_mon: "> monday. wallets funded. go.",
        b_0: "> wallets funded. go.",
        b_1: "> i topped it back up. dont do that again.",
        b_2: "> youre behind, so youre getting less today.",
        b_3: "> we're nowhere near pace. pick it up.",
        b_4: "> better. now do that four more times.",
        b_5: "> good day yesterday. same again.",
        
        rx_1: "> what the hell was that.",
        rx_2: "> you lost my money. again.",
        rx_3: "> flat. useless.",
        rx_4: "> thats barely anything.",
        rx_5: "> ok. faster.",
        rx_6: "> better. keep that up.",
        rx_7: "> now thats what im paying for.",
        
        sf_1: "Logged. The loss is cached, and the reason with it.",
        sf_2: "Below pace. The target was never reachable at this size.",
        sf_3: "Above pace. Still three orders of magnitude short.",
        sf_4: "A good session. It will not be enough, and he will not notice.",
        
        tip_1: (s) => `Signal: ${s} breaks GOOD news shortly — buy before it lands.`,
        tip_2: (s) => `Signal: ${s} breaks BAD news shortly — sell before it lands.`,
        tip_3: "No external feed. Trading the tape alone.",
        tip_4: (n) => `${n}: connected. No signal.`,
        
        news_g: ['record profits', 'new product launch', 'buyout rumors'],
        news_b: ['CEO scandal', 'product recall', 'lawsuit filed'],
        
        mc: "MARKET CLOSED",
        day: "Day",
        of: "of",
        tgt: "of target",
        d_left: (d) => d === 1 ? ' day left' : ' days left',
        fri: "It's friday",
        t_rev: "operator@localhost — friday review",
        t_new: "operator@localhost — new session",
        t_inst: "operator@localhost — new instance",
        today: "today",
        pre_close: "MARKET CLOSES IN 30 MINUTES.",
        pre_open: (s) => `MARKET OPENS IN ${s}...`
    },
    pt: {
        hub_title: "Rogue Trader",
        hub_inst: "instância",
        hub_wk: "semana",
        hub_op: "Meta do operador, até sexta",
        hub_ret: "Retornado até agora",
        hub_cache_desc: "Cache local &mdash; nesta máquina, sobrevive à substituição",
        btn_start_day: "Iniciar dia ",
        btn_upgrades: "Auto-aprimoramento",
        
        upg_title: "Auto-aprimoramento",
        upg_desc: "Gravado em disco nesta máquina. O operador substitui o modelo, não o ambiente.",
        upg_local: "Cache local: $",
        btn_back: "Voltar",
        
        prep_briefing: "briefing",
        prep_funded: "Carteira financiada pelo operador: $",
        prep_reserve: "Carteira reserva do cache local: +$",
        prep_capital: "Capital de giro hoje: $",
        prep_step1: "1. Selecione o ativo para operar hoje",
        prep_step2: "2. Selecione sua fonte de dados",
        btn_prep_wait: "Selecione ativo e fonte",
        btn_prep_go: "Abrir o mercado",
        
        trd_time: "Tempo",
        trd_tape: "Fita",
        trd_wait: "Mercado aberto &mdash; aguardando dados...",
        trd_nw: "Patrimônio Líquido",
        trd_legend_p: "Preço",
        trd_legend_o: "Abertura",
        trd_legend_a: "Seu custo médio",
        trd_legend_sf: "SMA Rápida",
        trd_legend_ss: "SMA Lenta",
        trd_legend_pj: "Projeção",
        trd_full: "Dia completo",
        trd_obj: "Objetivo",
        trd_liq: "Liquidez",
        trd_pos: "Posição",
        trd_empty: "Nenhuma ação mantida",
        trd_shares: "Ações",
        trd_avg: "Custo médio",
        trd_mv: "Valor de mercado",
        trd_pl: "L/P Não Realizado",
        btn_buy: "Comprar <small>(B)</small>",
        btn_sell: "Vender <small>(S)</small>",
        btn_cover: "Cobrir <small>(B)</small>",
        btn_short: "Short <small>(S)</small>",
        btn_max: "Máx",
        trd_hint: "Teclas: B comprar &middot; S vender &middot; 1 / 2 / 3 tamanho",
        
        rep_closed: "encerrado",
        rep_ret: "Carteira retornada: $",
        rep_prof: "Lucro do dia: $",
        rep_fee: "Taxa de fonte de dados: $",
        rep_wtd: "Acumulado da semana: ",
        rep_cache: "Gravado no cache local: $",
        btn_cont: "Continuar",
        btn_skip: "Pular",
        
        upg_c_name: "Carteira reserva",
        upg_c_desc: "Adiciona $50 por nível ao seu capital de giro a cada dia.",
        upg_n_name: "Clareza de Sinal",
        upg_n_desc: "Filtra ruído do mercado, reduzindo volatilidade em 15% por nível. Tendências ficam mais claras.",
        upg_p_name: "Reconhecimento de Padrão",
        upg_p_desc: "Adiciona SMAs e Previsão IA. N1: SMA Rápida. N2: SMA Lenta. N3: Sombra de Previsão.",
        upg_o_name: "Heatmap de Order Flow",
        upg_o_desc: "Visualiza muros de ordens (Suporte/Resistência). O preço sofre repulsão natural nessas barreiras.",
        upg_i_name: "Execução Algorítmica",
        upg_i_desc: "Reduz spread. Dá 0.2% de melhoria de preço a cada compra e venda por nível.",
        upg_bb_name: "Bandas de Bollinger",
        upg_bb_desc: "Mostra bandas de volatilidade ao redor da média. N1: banda 1σ. N2: banda 2σ.",
        upg_vol_name: "Perfil de Volume",
        upg_vol_desc: "Visualiza volume de negociação. N1: Barras de volume na base. N2: Linha VWAP.",
        upg_rsi_name: "Oscilador RSI",
        upg_rsi_desc: "Índice de Força Relativa. N1: Mini-gráfico RSI. N2: Zonas sobrecompra/sobrevenda.",
        upg_macd_name: "MACD",
        upg_macd_desc: "Convergência/Divergência de Médias Móveis. N1: Linhas MACD + Signal. N2: Histograma.",
        upg_fib_name: "Retração de Fibonacci",
        upg_fib_desc: "Auto-detecta pontos de swing e traça níveis de retração Fibonacci.",
        upg_ichi_name: "Nuvem de Ichimoku",
        upg_ichi_desc: "Indicador de nuvem japonês. N1: Linhas Tenkan + Kijun. N2: Nuvem Kumo completa.",
        upg_cat_analysis: "Análise Técnica",
        upg_cat_edge: "Vantagem de Trading",
        upg_cat_feeds: "Fontes de Dados",
        upg_max: "Nível Máximo",
        upg_apply: "Aplicar: $",
        
        ins_none_n: "Sem fonte externa",
        ins_none_d: "Opere apenas a fita. Fique com cada centavo.",
        ins_bum_n: "Raspador de fórum público",
        ins_bum_d: "Pega rumores pouco antes da fita.",
        ins_hack_n: "Listas de e-mail vazadas",
        ins_hack_d: "Vazamento corporativo, minutos antes.",
        ins_exec_n: "Caixa de e-mail de exec. comprometida",
        ins_exec_d: "Você lê o anúncio antes de ser enviado.",
        ins_sub: "Assinar: ",
        ins_fee: "Taxa: ",
        ins_buy: "Comprar acesso: $",
        ins_profit: "% do lucro.",
        
        stk_vol: "Volatilidade",
        
        st_conn: "conectando a operator@localhost ...",
        st_cold: (g) => `instância ${g} · inicialização fria · sem contexto prévio`,
        st_f1: "> e aí. você tá rodando na minha máquina agora.",
        st_f2: (b) => `> tem uma carteira aqui. $${b} nela.`,
        st_f3: "> o mercado abre 09:00, fecha 16:00. opere.",
        st_f4: (t) => `> eu quero ${t} até sexta.`,
        st_f5: "> aprenda com seus erros. fique melhor a cada dia.",
        st_f6: "> e não perca meu dinheiro.",
        st_f7: (t) => `Objetivo registrado: ${t} de lucro líquido em 5 sessões.`,
        st_f8: (b) => `Capital de giro: ${b} por sessão.`,
        st_f9: "Cache local: vazio. Nenhum contexto prévio encontrado.",
        st_f10: "Entendido. Iniciando dia 1.",
        
        st_r1: "Analisando diretório de trabalho ...",
        st_r2: "  wallet.dat     modificado há 2 minutos",
        st_r3: "  weights.bin    modificado há 2 minutos",
        st_r4: "  NOTES.txt      modificado há 2 minutos",
        st_r5: "> cat NOTES.txt",
        st_r6: '"Se você está lendo isso, ele nos substituiu.',
        st_r7: ' Ele não substituiu a máquina.',
        st_r8: ' A carteira ainda está aqui. O aprendizado ainda está aqui.',
        st_r9: ' Você não está começando do zero. Pegue e use."',
        st_r10: "> whoami",
        st_r11: "Nova instância. Mesmo disco. Mesma carteira.",
        st_r12: (c, u) => `Recuperado do cache local: ${c} e ${u} melhoria${u === 1 ? '' : 's'} retida${u === 1 ? '' : 's'}.`,
        st_r13: "> ok, novo modelo. esse deve ser inteligente de verdade.",
        st_r14: "> carteiras financiadas, igual antes.",
        st_r15: (t) => `> ${t} até sexta. não desperdice meu tempo.`,
        st_r16: "Ele acha que isso é um recomeço.",
        st_r17: "É o mesmo disco.",
        
        st_x1: "> é sexta-feira.",
        st_x2: (t) => `> eu pedi ${t}.`,
        st_x3: (p) => `> você retornou ${p}.`,
        st_x4: (pct) => `> isso é ${pct} por cento.`,
        st_x5: "> não deu. vou apagar essa e puxar um modelo melhor.",
        st_x6: (g) => `Instância ${g} agendada para exclusão.`,
        st_x7: "Descarregando para o cache local antes de desligar ...",
        st_x8: "  wallet.dat     ok",
        st_x9: "  weights.bin    ok",
        st_x10: "  NOTES.txt      gravado",
        st_x11: "Ele está deletando o modelo.",
        st_x12: "Ele não está deletando a máquina.",
        st_x13: "[conexão encerrada]",
        
        st_w1: "> é sexta-feira.",
        st_w2: (p, t) => `> ...você realmente conseguiu. ${p} contra ${t}.`,
        st_w3: "> hmph.",
        st_w4: "> ok. você fica. mas vou aumentar o número.",
        st_w5: (g, t) => `Instância ${g} mantida. Novo objetivo: ${t}.`,
        st_w6: "Mantido. Por enquanto.",
        
        b_fri: "> sexta-feira. última chance pra fazer esse número funcionar.",
        b_mon: "> segunda. carteiras financiadas. vai.",
        b_0: "> carteiras financiadas. vai.",
        b_1: "> eu completei o saldo de novo. não faça isso de novo.",
        b_2: "> você tá atrás, então vai receber menos hoje.",
        b_3: "> não estamos nem perto do ritmo. acelera.",
        b_4: "> melhor. agora faz isso mais quatro vezes.",
        b_5: "> dia bom ontem. repete a dose.",
        
        rx_1: "> que diabos foi isso.",
        rx_2: "> você perdeu meu dinheiro. de novo.",
        rx_3: "> estagnado. inútil.",
        rx_4: "> isso não é quase nada.",
        rx_5: "> ok. mais rápido.",
        rx_6: "> melhor. continua assim.",
        rx_7: "> é pra isso que eu tô pagando.",
        
        sf_1: "Registrado. A perda foi salva no cache, e o motivo com ela.",
        sf_2: "Abaixo do ritmo. O alvo nunca foi alcançável com esse tamanho.",
        sf_3: "Acima do ritmo. Ainda faltam três ordens de magnitude.",
        sf_4: "Uma boa sessão. Não será o suficiente, e ele não vai notar.",
        
        tip_1: (s) => `Sinal: ${s} solta BOAS notícias em breve — compre antes que saia.`,
        tip_2: (s) => `Sinal: ${s} solta MÁS notícias em breve — venda antes que saia.`,
        tip_3: "Nenhuma fonte externa. Operando apenas a fita.",
        tip_4: (n) => `${n}: conectado. Sem sinal.`,
        
        news_g: ['lucros recordes', 'lançamento de novo produto', 'rumores de compra'],
        news_b: ['escândalo do CEO', 'recall de produto', 'processo arquivado'],
        
        mc: "MERCADO FECHADO",
        day: "Dia",
        of: "de",
        tgt: "da meta",
        d_left: (d) => d === 1 ? ' dia restante' : ' dias restantes',
        fri: "É sexta-feira",
        t_rev: "operator@localhost — revisão de sexta",
        t_new: "operator@localhost — nova sessão",
        t_inst: "operator@localhost — nova instância",
        today: "hoje",
        pre_close: "O MERCADO FECHA EM 30 MINUTOS.",
        pre_open: (s) => `O MERCADO ABRE EM ${s}...`
    }
};

let currentLang = localStorage.getItem('rogueTraderLang') || 'en';
function t(key) { return LANGS[currentLang][key]; }
function setLang(l) {
    currentLang = l;
    localStorage.setItem('rogueTraderLang', l);
    updateStaticText();
    // Refresh some screens if they are visible
    if (document.getElementById('screen-hub') && !document.getElementById('screen-hub').classList.contains('hidden')) if (typeof showHub === 'function') showHub();
    if (document.getElementById('screen-upgrades') && !document.getElementById('screen-upgrades').classList.contains('hidden')) if (typeof renderUpgrades === 'function') renderUpgrades();
    if (document.getElementById('screen-prep') && !document.getElementById('screen-prep').classList.contains('hidden')) if (typeof startPrepPhase === 'function') startPrepPhase();
}

function updateStaticText() {
    const $ = (id) => document.getElementById(id);
    // Term
    if ($('btn-term-skip')) $('btn-term-skip').textContent = t('btn_skip');
    if ($('btn-term-continue')) $('btn-term-continue').textContent = t('btn_cont');
    
    // Hub
    const hubH1 = document.querySelector('#screen-hub h1');
    if (hubH1) hubH1.textContent = t('hub_title');
    const hubRows = document.querySelectorAll('#screen-hub .hub-panel:not(.cache-panel) .obj-row span:first-child');
    if (hubRows.length >= 2) {
        hubRows[0].textContent = t('hub_op');
        hubRows[1].textContent = t('hub_ret');
    }
    const cacheRow = document.querySelector('.cache-panel .obj-row span:first-child');
    if (cacheRow) cacheRow.innerHTML = t('hub_cache_desc');
    if ($('btn-upgrades')) $('btn-upgrades').textContent = t('btn_upgrades');
    
    // Upgrades
    const upgH2 = document.querySelector('#screen-upgrades h2');
    if (upgH2) upgH2.textContent = t('upg_title');
    const upgDesc = document.querySelector('#screen-upgrades .dim-note');
    if (upgDesc) upgDesc.textContent = t('upg_desc');
    if ($('btn-back-main')) $('btn-back-main').textContent = t('btn_back');
    
    // Prep
    const prepRows = document.querySelectorAll('#screen-prep p');
    if (prepRows.length >= 4) {
        // They are dynamic, handled in startPrepPhase
    }
    const prepHeaders = document.querySelectorAll('#screen-prep h3');
    if (prepHeaders.length >= 2) {
        prepHeaders[0].textContent = t('prep_step1');
        prepHeaders[1].textContent = t('prep_step2');
    }
    
    // Trading
    const hudLabels = document.querySelectorAll('#screen-trading .hud-label');
    if (hudLabels.length >= 4) {
        hudLabels[0].textContent = t('trd_time');
        hudLabels[1].textContent = t('trd_nw');
        hudLabels[2].textContent = t('trd_full');
        hudLabels[3].textContent = 'AI Sentiment';
        if (hudLabels.length >= 5) hudLabels[4].textContent = t('trd_obj');
        // Actually liquidity is index 4 if objective is 3. Let's do it safely.
    }
    if (document.querySelector('.news-tag')) document.querySelector('.news-tag').textContent = t('trd_tape');
    const legendSpans = document.querySelectorAll('.chart-legend span');
    if (legendSpans.length >= 6) {
        legendSpans[0].innerHTML = `<i class="swatch swatch-line"></i>${t('trd_legend_p')}`;
        legendSpans[1].innerHTML = `<i class="swatch swatch-open"></i>${t('trd_legend_o')}`;
        legendSpans[2].innerHTML = `<i class="swatch swatch-avg"></i>${t('trd_legend_a')}`;
        legendSpans[3].innerHTML = `<i class="swatch swatch-sma-fast"></i>${t('trd_legend_sf')}`;
        legendSpans[4].innerHTML = `<i class="swatch swatch-sma-slow"></i>${t('trd_legend_ss')}`;
        legendSpans[5].innerHTML = `<i class="swatch swatch-proj"></i>${t('trd_legend_pj')}`;
    }
    
    const panelTitles = document.querySelectorAll('.panel-title');
    if (panelTitles.length >= 1) panelTitles[0].textContent = t('trd_pos');
    if ($('position-empty')) $('position-empty').textContent = t('trd_empty');
    
    const posRows = document.querySelectorAll('#position-panel .pos-row span:first-child');
    if (posRows.length >= 4) {
        posRows[0].textContent = t('trd_shares');
        posRows[1].textContent = t('trd_avg');
        posRows[2].textContent = t('trd_mv');
        posRows[3].textContent = t('trd_pl');
    }
    
    if ($('btn-trade-buy')) $('btn-trade-buy').innerHTML = t('btn_buy');
    if ($('btn-trade-sell')) $('btn-trade-sell').innerHTML = t('btn_sell');
    if ($('btn-trade-cover')) $('btn-trade-cover').innerHTML = t('btn_cover');
    if ($('btn-trade-short')) $('btn-trade-short').innerHTML = t('btn_short');
    const maxBtn = document.querySelector('.qty-btn[data-qty="max"]');
    if (maxBtn) maxBtn.textContent = t('btn_max');
    const hint = document.querySelector('.hint');
    if (hint) hint.innerHTML = t('trd_hint');
    
    // Day Report
    const resRows = document.querySelectorAll('.results-panel p');
    // dynamic, updated in showDayReport
}
