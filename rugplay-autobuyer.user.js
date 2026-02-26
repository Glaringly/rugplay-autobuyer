// ==UserScript==
// @name         RugPlay Universal AutoBuyer
// @namespace    https://github.com/Glaringly/rugplay-autobuyer
// @version      1.0.0
// @description  Automatically buys any coin on RugPlay at max speed. Configure your coin & amount via the built-in panel.
// @author       Glaringly
// @match        https://rugplay.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(async function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    //  CONFIG  (saved to Tampermonkey storage — persists across tabs)
    // ═══════════════════════════════════════════════════════════════
    const CONFIG = {
        coin:       GM_getValue('rp_coin',    ''),       // coin symbol e.g. "GOFUNDME"
        amount:     GM_getValue('rp_amount',  1),        // $ amount per buy
        running:    GM_getValue('rp_running', false),    // auto-start off by default
        totalBuys:  GM_getValue('rp_total',   0),
        totalSpent: GM_getValue('rp_spent',   0),
    };

    function save() {
        GM_setValue('rp_coin',    CONFIG.coin);
        GM_setValue('rp_amount',  CONFIG.amount);
        GM_setValue('rp_running', CONFIG.running);
        GM_setValue('rp_total',   CONFIG.totalBuys);
        GM_setValue('rp_spent',   CONFIG.totalSpent);
    }

    // ═══════════════════════════════════════════════════════════════
    //  STYLES
    // ═══════════════════════════════════════════════════════════════
    const CSS = `
        #rp-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483647;
            width: 290px;
            background: #0d0d0d;
            border: 1.5px solid #00ff88;
            border-radius: 16px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #e0e0e0;
            box-shadow: 0 0 40px rgba(0,255,136,0.15), 0 8px 32px rgba(0,0,0,0.6);
            overflow: hidden;
            user-select: none;
            transition: box-shadow 0.3s;
        }
        #rp-panel.active {
            box-shadow: 0 0 60px rgba(0,255,136,0.35), 0 8px 32px rgba(0,0,0,0.6);
        }
        #rp-header {
            background: linear-gradient(135deg, #003322, #001a0f);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: move;
            border-bottom: 1px solid #00ff8833;
        }
        #rp-header .logo {
            font-size: 14px;
            font-weight: bold;
            color: #00ff88;
            letter-spacing: 1px;
        }
        #rp-header .version {
            font-size: 10px;
            color: #555;
        }
        #rp-body {
            padding: 14px 16px;
        }
        .rp-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            gap: 8px;
        }
        .rp-label {
            color: #888;
            font-size: 11px;
            white-space: nowrap;
            min-width: 70px;
        }
        .rp-input {
            flex: 1;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 6px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            padding: 5px 8px;
            outline: none;
            transition: border-color 0.2s;
            text-transform: uppercase;
        }
        .rp-input:focus { border-color: #00ff88; }
        .rp-input.amount { text-transform: none; }
        .rp-divider {
            border: none;
            border-top: 1px solid #1e1e1e;
            margin: 10px 0;
        }
        .rp-stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 12px;
        }
        .rp-stat-label { color: #555; }
        .rp-stat-val { color: #fff; font-weight: bold; }
        .rp-stat-val.green { color: #00ff88; }
        #rp-status-line {
            font-size: 11px;
            min-height: 16px;
            margin-bottom: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            background: #111;
            color: #69f0ae;
            word-break: break-word;
        }
        #rp-status-line.error { color: #ff5252; }
        #rp-status-line.warn  { color: #ffb300; }
        .rp-btn {
            width: 100%;
            padding: 9px;
            border: none;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.15s;
            letter-spacing: 0.5px;
        }
        #rp-btn-start {
            background: linear-gradient(135deg, #00c853, #00ff88);
            color: #000;
        }
        #rp-btn-start:hover { filter: brightness(1.15); transform: translateY(-1px); }
        #rp-btn-stop {
            background: linear-gradient(135deg, #b71c1c, #f44336);
            color: #fff;
            display: none;
        }
        #rp-btn-stop:hover { filter: brightness(1.1); transform: translateY(-1px); }
        #rp-btn-reset {
            width: 100%;
            margin-top: 6px;
            padding: 5px;
            background: transparent;
            border: 1px solid #333;
            border-radius: 6px;
            color: #555;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.15s;
        }
        #rp-btn-reset:hover { border-color: #666; color: #999; }
        @keyframes rp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes rp-bump  { 0%{transform:scale(1.25);color:#00ff88} 100%{transform:scale(1);color:#fff} }
        .rp-dot {
            display: inline-block;
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #555;
            margin-right: 6px;
            vertical-align: middle;
        }
        .rp-dot.on  { background: #00ff88; animation: rp-pulse 0.7s infinite; }
        .rp-dot.off { background: #f44336; animation: none; }
        .rp-bump { animation: rp-bump 0.25s ease forwards; }
        #rp-panel-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483646;
            width: 44px; height: 44px;
            background: #003322;
            border: 1.5px solid #00ff88;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(0,255,136,0.3);
            transition: transform 0.2s;
        }
        #rp-panel-toggle:hover { transform: scale(1.1); }
        #rp-minimize {
            background: none;
            border: none;
            color: #555;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            padding: 0 0 0 8px;
            transition: color 0.2s;
        }
        #rp-minimize:hover { color: #fff; }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // ═══════════════════════════════════════════════════════════════
    //  PANEL HTML
    // ═══════════════════════════════════════════════════════════════
    const panel = document.createElement('div');
    panel.id = 'rp-panel';
    panel.innerHTML = `
        <div id="rp-header">
            <span class="logo">⚡ RugPlay AutoBuyer</span>
            <div style="display:flex;align-items:center;gap:6px">
                <span class="version">v1.0.0</span>
                <button id="rp-minimize" title="Minimize">−</button>
            </div>
        </div>
        <div id="rp-body">

            <div class="rp-row">
                <span class="rp-label">🪙 Coin</span>
                <input id="rp-coin-input" class="rp-input" type="text"
                    placeholder="e.g. GOFUNDME"
                    value="${CONFIG.coin}"
                    maxlength="20" />
            </div>

            <div class="rp-row">
                <span class="rp-label">💵 Amount</span>
                <input id="rp-amount-input" class="rp-input amount" type="number"
                    placeholder="$ per buy"
                    value="${CONFIG.amount}"
                    min="0.01" step="0.01" />
            </div>

            <hr class="rp-divider">

            <div class="rp-stat-row">
                <span class="rp-stat-label">Status</span>
                <span class="rp-stat-val">
                    <span class="rp-dot" id="rp-dot"></span>
                    <span id="rp-status-text">${CONFIG.running ? 'RUNNING' : 'STOPPED'}</span>
                </span>
            </div>
            <div class="rp-stat-row">
                <span class="rp-stat-label">Total Buys</span>
                <span class="rp-stat-val green" id="rp-count">${CONFIG.totalBuys}</span>
            </div>
            <div class="rp-stat-row">
                <span class="rp-stat-label">Total Spent</span>
                <span class="rp-stat-val" id="rp-spent">$${CONFIG.totalSpent.toFixed(2)}</span>
            </div>

            <div id="rp-status-line">Ready. Enter a coin and press Start.</div>

            <button id="rp-btn-start" class="rp-btn">▶ START BUYING</button>
            <button id="rp-btn-stop"  class="rp-btn">⏹ STOP</button>
            <button id="rp-btn-reset">↺ Reset Stats</button>
        </div>
    `;
    document.body.appendChild(panel);

    // Minimize toggle button (shown when panel is hidden)
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'rp-panel-toggle';
    toggleBtn.innerHTML = '⚡';
    toggleBtn.title = 'Open AutoBuyer';
    document.body.appendChild(toggleBtn);

    // ═══════════════════════════════════════════════════════════════
    //  ELEMENT REFS
    // ═══════════════════════════════════════════════════════════════
    const $ = id => document.getElementById(id);
    const coinInput   = $('rp-coin-input');
    const amountInput = $('rp-amount-input');
    const btnStart    = $('rp-btn-start');
    const btnStop     = $('rp-btn-stop');
    const btnReset    = $('rp-btn-reset');
    const statusLine  = $('rp-status-line');
    const countEl     = $('rp-count');
    const spentEl     = $('rp-spent');
    const dotEl       = $('rp-dot');
    const statusText  = $('rp-status-text');

    // ═══════════════════════════════════════════════════════════════
    //  UI HELPERS
    // ═══════════════════════════════════════════════════════════════
    function setStatus(msg, type = 'ok') {
        statusLine.textContent = msg;
        statusLine.className = type === 'error' ? 'error' : type === 'warn' ? 'warn' : '';
    }

    function updateStats() {
        countEl.textContent = CONFIG.totalBuys;
        spentEl.textContent = `$${CONFIG.totalSpent.toFixed(2)}`;
        // bump animation on buy count
        countEl.classList.remove('rp-bump');
        void countEl.offsetWidth;
        countEl.classList.add('rp-bump');
    }

    function setRunningUI(on) {
        dotEl.className    = `rp-dot ${on ? 'on' : 'off'}`;
        statusText.textContent = on ? 'RUNNING' : 'STOPPED';
        btnStart.style.display = on ? 'none'  : 'block';
        btnStop.style.display  = on ? 'block' : 'none';
        panel.classList.toggle('active', on);
        coinInput.disabled   = on;
        amountInput.disabled = on;
    }

    // ═══════════════════════════════════════════════════════════════
    //  DRAGGABLE PANEL
    // ═══════════════════════════════════════════════════════════════
    let dragging = false, ox = 0, oy = 0;
    $('rp-header').addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return;
        dragging = true;
        const r = panel.getBoundingClientRect();
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
    });
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        panel.style.left = (e.clientX - ox) + 'px';
        panel.style.top  = (e.clientY - oy) + 'px';
    });
    document.addEventListener('mouseup', () => dragging = false);

    // ═══════════════════════════════════════════════════════════════
    //  MINIMIZE / RESTORE
    // ═══════════════════════════════════════════════════════════════
    $('rp-minimize').addEventListener('click', () => {
        panel.style.display = 'none';
        toggleBtn.style.display = 'flex';
    });
    toggleBtn.addEventListener('click', () => {
        panel.style.display = 'block';
        toggleBtn.style.display = 'none';
    });

    // ═══════════════════════════════════════════════════════════════
    //  CORE BUY FUNCTION
    // ═══════════════════════════════════════════════════════════════
    async function buyOnce() {
        const coin   = CONFIG.coin.toUpperCase().trim();
        const amount = parseFloat(CONFIG.amount);

        if (!coin)        { setStatus('⚠ No coin set!', 'warn');   return 'skip'; }
        if (isNaN(amount) || amount <= 0) { setStatus('⚠ Invalid amount!', 'warn'); return 'skip'; }

        try {
            const res = await fetch(`/api/coin/${coin}/trade`, {
                method:      'POST',
                credentials: 'include',
                headers:     { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body:        JSON.stringify({ type: 'BUY', amount }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                CONFIG.totalBuys++;
                CONFIG.totalSpent += amount;
                save();
                updateStats();
                setStatus(`✅ Buy #${CONFIG.totalBuys} — $${amount} of ${coin} @ ${new Date().toLocaleTimeString()}`);
                return 'ok';
            }

            const errMsg = data?.message || data?.error || `HTTP ${res.status}`;
            setStatus(`❌ ${errMsg}`, 'error');

            // specific error handling
            if (res.status === 401 || res.status === 403) {
                setStatus('🔒 Not logged in — please sign in to RugPlay!', 'error');
                return 'auth';
            }
            if (res.status === 400) return 'funds'; // likely out of funds
            return 'error';

        } catch (e) {
            setStatus(`❌ Network error: ${e.message}`, 'error');
            return 'network';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INFINITE BUY LOOP
    // ═══════════════════════════════════════════════════════════════
    async function loop() {
        while (CONFIG.running) {
            const result = await buyOnce();

            // Back off on auth / network errors so we don't spam
            if (result === 'auth')    await sleep(5000);
            if (result === 'network') await sleep(2000);
            if (result === 'funds')   await sleep(1000);
            // 'ok' and 'skip' → 0ms, fire again instantly

            await sleep(0); // yield to event loop so browser stays responsive
        }
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ═══════════════════════════════════════════════════════════════
    //  SERVICE WORKER (buy even when tab is in background / off-site)
    // ═══════════════════════════════════════════════════════════════
    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return false;

        const swSource = `
const state = { running: false, coin: '', amount: 1, buys: 0, spent: 0 };

async function buyOnce() {
    if (!state.coin || !state.running) return;
    try {
        const res = await fetch('https://rugplay.com/api/coin/' + state.coin + '/trade', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'BUY', amount: state.amount })
        });
        const data = await res.json().catch(() => ({}));
        const delay = res.ok ? 0 : (res.status === 401 ? 5000 : res.status === 400 ? 1000 : 2000);
        if (res.ok) { state.buys++; state.spent += state.amount; }
        broadcast({ type: res.ok ? 'OK' : 'ERR', msg: data?.message || data?.error || ('HTTP ' + res.status), buys: state.buys, spent: state.spent });
        await new Promise(r => setTimeout(r, delay));
    } catch(e) {
        broadcast({ type: 'ERR', msg: e.message, buys: state.buys, spent: state.spent });
        await new Promise(r => setTimeout(r, 2000));
    }
}

function broadcast(msg) {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
        clients.forEach(c => c.postMessage(msg))
    );
}

async function runLoop() {
    while (state.running) {
        await buyOnce();
        await new Promise(r => setTimeout(r, 0));
    }
}

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
    const { cmd, coin, amount } = e.data || {};
    if (cmd === 'START') {
        state.coin = (coin || '').toUpperCase().trim();
        state.amount = parseFloat(amount) || 1;
        if (!state.running) { state.running = true; runLoop(); }
        broadcast({ type: 'STARTED', coin: state.coin, amount: state.amount });
    }
    if (cmd === 'STOP') {
        state.running = false;
        broadcast({ type: 'STOPPED' });
    }
    if (cmd === 'SYNC') {
        e.source?.postMessage({ type: 'STATUS', buys: state.buys, spent: state.spent, running: state.running });
    }
});
        `;

        try {
            const blob   = new Blob([swSource], { type: 'application/javascript' });
            const blobURL = URL.createObjectURL(blob);
            const reg    = await navigator.serviceWorker.register(blobURL, { scope: '/' });
            await navigator.serviceWorker.ready;

            // Relay SW messages back to panel UI
            navigator.serviceWorker.addEventListener('message', e => {
                const { type, msg, buys, spent } = e.data || {};
                if (type === 'OK') {
                    CONFIG.totalBuys  = buys;
                    CONFIG.totalSpent = spent;
                    save();
                    updateStats();
                    setStatus(`✅ Buy #${buys} — $${CONFIG.amount} of ${CONFIG.coin} @ ${new Date().toLocaleTimeString()}`);
                } else if (type === 'ERR') {
                    setStatus(`❌ ${msg}`, 'error');
                } else if (type === 'STOPPED') {
                    CONFIG.running = false; save();
                    setRunningUI(false);
                    setStatus('⏹ Stopped.');
                }
            });

            console.log('%c[AutoBuyer] ✅ Service Worker active — runs in background!', 'color:#00ff88;font-weight:bold');
            return reg;
        } catch (err) {
            console.warn('[AutoBuyer] Service Worker failed, using tab loop:', err.message);
            return null;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  AUTO-DETECT COIN FROM URL
    // ═══════════════════════════════════════════════════════════════
    function detectCoinFromURL() {
        const match = location.pathname.match(/\/coin\/([A-Z0-9]+)/i);
        if (match && !CONFIG.coin) {
            CONFIG.coin = match[1].toUpperCase();
            coinInput.value = CONFIG.coin;
            save();
            setStatus(`🔍 Detected coin: ${CONFIG.coin}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  BUTTON EVENTS
    // ═══════════════════════════════════════════════════════════════
    btnStart.addEventListener('click', async () => {
        CONFIG.coin   = coinInput.value.trim().toUpperCase();
        CONFIG.amount = parseFloat(amountInput.value) || 1;

        if (!CONFIG.coin) {
            setStatus('⚠ Please enter a coin symbol first!', 'warn');
            coinInput.focus();
            return;
        }
        if (CONFIG.amount <= 0) {
            setStatus('⚠ Amount must be greater than 0!', 'warn');
            amountInput.focus();
            return;
        }

        CONFIG.running = true;
        save();
        setRunningUI(true);
        setStatus(`🚀 Started buying $${CONFIG.amount} of ${CONFIG.coin}...`);

        // Tell service worker to start (works off-tab)
        const sw = navigator.serviceWorker?.controller;
        if (sw) {
            sw.postMessage({ cmd: 'START', coin: CONFIG.coin, amount: CONFIG.amount });
        } else {
            // Fallback: in-tab loop
            loop();
        }
    });

    btnStop.addEventListener('click', () => {
        CONFIG.running = false;
        save();
        setRunningUI(false);
        setStatus('⏹ Stopped.');
        // Tell SW to stop too
        navigator.serviceWorker?.controller?.postMessage({ cmd: 'STOP' });
    });

    btnReset.addEventListener('click', () => {
        if (CONFIG.running) { setStatus('⚠ Stop the buyer before resetting.', 'warn'); return; }
        CONFIG.totalBuys  = 0;
        CONFIG.totalSpent = 0;
        save();
        countEl.textContent = '0';
        spentEl.textContent = '$0.00';
        setStatus('↺ Stats reset.');
    });

    coinInput.addEventListener('input', () => {
        coinInput.value = coinInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // Sync input fields when user edits them (not while running)
    coinInput.addEventListener('change',   () => { CONFIG.coin   = coinInput.value.trim().toUpperCase(); save(); });
    amountInput.addEventListener('change', () => { CONFIG.amount = parseFloat(amountInput.value) || 1;  save(); });

    // ═══════════════════════════════════════════════════════════════
    //  BOOT
    // ═══════════════════════════════════════════════════════════════
    console.log('%c[RugPlay AutoBuyer] ⚡ Loaded!', 'color:#00ff88;font-weight:bold;font-size:14px');

    // 1. Detect coin from URL automatically
    detectCoinFromURL();

    // 2. Register service worker for background buying
    await sleep(1500); // let page session initialize
    const sw = await registerServiceWorker();

    // 3. If was running before page reload, resume
    if (CONFIG.running && CONFIG.coin) {
        setRunningUI(true);
        setStatus(`▶ Resuming — buying $${CONFIG.amount} of ${CONFIG.coin}...`);
        const controller = navigator.serviceWorker?.controller;
        if (controller) {
            controller.postMessage({ cmd: 'START', coin: CONFIG.coin, amount: CONFIG.amount });
        } else {
            loop();
        }
    } else {
        setRunningUI(false);
        if (!CONFIG.coin) {
            setStatus('👋 Enter a coin symbol above and press Start!');
        }
    }

    // 4. Sync SW stats to panel every second
    setInterval(() => {
        navigator.serviceWorker?.controller?.postMessage({ cmd: 'SYNC' });
    }, 1000);

})();
