const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const debugMenu = `
        <!-- Debug Menu -->
        <div id="debug-menu" class="hidden" style="position: absolute; top: 10px; left: 10px; background: rgba(20,20,30,0.95); border: 1px solid #ff3366; padding: 15px; z-index: 999; display: flex; flex-direction: column; gap: 10px;">
            <h3 style="margin: 0; color: #ff3366;">Debug Tools</h3>
            <button id="btn-dbg-cash" style="font-size: 0.8rem; padding: 5px;">+ $10,000 Meta Cash</button>
            <button id="btn-dbg-cash-big" style="font-size: 0.8rem; padding: 5px;">+ $1M Meta Cash</button>
            <button id="btn-dbg-win" style="font-size: 0.8rem; padding: 5px;">Auto-Win Week</button>
            <button id="btn-dbg-insiders" style="font-size: 0.8rem; padding: 5px;">Unlock All Insiders</button>
            <button id="btn-dbg-reset" style="font-size: 0.8rem; padding: 5px; color: red;">Nuke Save</button>
            <button id="btn-dbg-close" style="font-size: 0.8rem; padding: 5px; margin-top: 10px;">Close</button>
        </div>
`;

// Insert after game-container
html = html.replace(/<div id="game-container">/, '<div id="game-container">\n' + debugMenu);

// Add a discrete toggle button in the Hub
html = html.replace(/<button id="btn-upgrades">Self-improvement<\/button>/, '<button id="btn-upgrades">Self-improvement</button>\n            <button id="btn-debug-toggle" style="margin-top: 20px; font-size: 0.7rem; border: none; background: transparent; color: #444;">[debug]</button>');

fs.writeFileSync('index.html', html);
