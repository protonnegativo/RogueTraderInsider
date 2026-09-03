const fs = require('fs');
let code = fs.readFileSync('i18n.js', 'utf8');

code = code.replace(/upg_p_desc: "Adds Moving Averages to the chart\. L1: Fast SMA\. L2: Slow SMA\. L3: Both \+ Projection\.",/, 
    'upg_p_desc: "Adds SMAs and AI Forecasting. L1: Fast SMA. L2: Slow SMA. L3: AI Future Shadow.",\n        upg_o_name: "Order Flow Heatmap",\n        upg_o_desc: "Visualizes major limit order walls (Support/Resistance). Price naturally repels off these bounds.",');

code = code.replace(/upg_p_desc: "Adiciona Médias Móveis\. N1: SMA Rápida\. N2: SMA Lenta\. N3: Ambas \+ Projeção\.",/, 
    'upg_p_desc: "Adiciona SMAs e Previsão IA. N1: SMA Rápida. N2: SMA Lenta. N3: Sombra de Previsão.",\n        upg_o_name: "Heatmap de Order Flow",\n        upg_o_desc: "Visualiza muros de ordens (Suporte/Resistência). O preço sofre repulsão natural nessas barreiras.",');

code = code.replace(/trd_legend_pj: "PROJ"/g, 'trd_legend_pj: "PREDICT"');

fs.writeFileSync('i18n.js', code);
