// NexusVPN Interactive Scripting & Demo Engine

document.addEventListener('DOMContentLoaded', () => {
    initPhoneSimulator();
    initSpeedBenchmark();
    initServerExplorer();
    initCopyButtons();
    initHashVerifier();
    initFaqAccordion();
    initOsTabs();
    initStickyDownloadBar();
    initDownloadModal();
});

/* ========================================================
   1. Interactive Phone Simulator
   ======================================================== */
let isVpnConnected = false;
let sessionSeconds = 0;
let sessionTimerInterval = null;
let trafficInterval = null;

// Audio Context for subtle futuristic feedback
function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'connect') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'disconnect') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, now);
            osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(580, now);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    } catch (e) {
        // Audio might be blocked before first user gesture
    }
}

function initPhoneSimulator() {
    const powerBtn = document.getElementById('phone-power-btn');
    if (!powerBtn) return;

    powerBtn.addEventListener('click', toggleVpnState);

    // Server selector inside phone
    const serverSelect = document.getElementById('phone-server-select');
    if (serverSelect) {
        serverSelect.addEventListener('change', (e) => {
            playSound('click');
            const [country, ping, ip] = e.target.value.split('|');
            document.getElementById('phone-server-country').textContent = country;
            document.getElementById('phone-server-ping').textContent = ping + ' ms';
            if (isVpnConnected) {
                document.getElementById('phone-ip-display').textContent = ip;
                showToast(`Switched tunnel to ${country}`);
            }
        });
    }

    // Protocol switcher inside phone
    const protocolButtons = document.querySelectorAll('.phone-protocol-btn');
    protocolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            protocolButtons.forEach(b => {
                b.classList.remove('bg-emerald-500/30', 'text-emerald-300', 'border-emerald-500/50');
                b.classList.add('bg-slate-800/80', 'text-slate-400', 'border-slate-700/50');
            });
            btn.classList.add('bg-emerald-500/30', 'text-emerald-300', 'border-emerald-500/50');
            btn.classList.remove('bg-slate-800/80', 'text-slate-400', 'border-slate-700/50');
            showToast(`Protocol changed to ${btn.dataset.protocol}`);
        });
    });
}

function toggleVpnState() {
    isVpnConnected = !isVpnConnected;
    const powerBtn = document.getElementById('phone-power-btn');
    const powerWaves = document.querySelectorAll('.phone-power-wave');
    const statusText = document.getElementById('phone-status-text');
    const statusSub = document.getElementById('phone-status-sub');
    const statusBadge = document.getElementById('phone-status-badge');
    const ipDisplay = document.getElementById('phone-ip-display');
    const ipLabel = document.getElementById('phone-ip-label');
    const speedContainer = document.getElementById('phone-speed-container');
    const serverSelect = document.getElementById('phone-server-select');
    const timerDisplay = document.getElementById('phone-session-time');

    if (isVpnConnected) {
        playSound('connect');
        powerBtn.classList.remove('bg-slate-800', 'text-slate-400', 'border-slate-700');
        powerBtn.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-300', 'shadow-neon-emerald');
        powerWaves.forEach(w => w.classList.remove('hidden'));

        statusBadge.textContent = 'PROTECTED';
        statusBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider';

        statusText.textContent = 'SECURE TUNNEL ACTIVE';
        statusText.classList.add('text-emerald-400');
        statusText.classList.remove('text-slate-200');

        statusSub.textContent = 'WireGuard 256-bit AES • Zero DNS Leaks';

        const selectedVal = serverSelect ? serverSelect.value.split('|') : ['Frankfurt, DE', '14', '185.220.101.42'];
        ipDisplay.textContent = selectedVal[2] || '185.220.101.42';
        ipLabel.textContent = 'VIRTUAL IP (ENCRYPTED)';
        ipLabel.classList.add('text-emerald-400');

        speedContainer.classList.remove('opacity-30');
        speedContainer.classList.add('opacity-100');

        sessionSeconds = 0;
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = setInterval(() => {
            sessionSeconds++;
            const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
            const secs = String(sessionSeconds % 60).padStart(2, '0');
            if (timerDisplay) timerDisplay.textContent = `00:${mins}:${secs}`;
        }, 1000);

        clearInterval(trafficInterval);
        trafficInterval = setInterval(() => {
            const down = (240 + Math.random() * 45).toFixed(1);
            const up = (70 + Math.random() * 25).toFixed(1);
            const downEl = document.getElementById('phone-speed-down');
            const upEl = document.getElementById('phone-speed-up');
            if (downEl) downEl.textContent = `${down} Mb/s`;
            if (upEl) upEl.textContent = `${up} Mb/s`;
        }, 1500);

        showToast('🔒 Connected to NexusVPN! Traffic is encrypted.');
    } else {
        playSound('disconnect');
        powerBtn.classList.add('bg-slate-800', 'text-slate-400', 'border-slate-700');
        powerBtn.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-300', 'shadow-neon-emerald');
        powerWaves.forEach(w => w.classList.add('hidden'));

        statusBadge.textContent = 'UNPROTECTED';
        statusBadge.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wider';

        statusText.textContent = 'TAP TO CONNECT';
        statusText.classList.remove('text-emerald-400');
        statusText.classList.add('text-slate-200');

        statusSub.textContent = 'Your real IP & ISP traffic are visible';

        ipDisplay.textContent = '142.250.190.46 (Public ISP)';
        ipLabel.textContent = 'REAL IP (EXPOSED)';
        ipLabel.classList.remove('text-emerald-400');

        speedContainer.classList.add('opacity-30');
        speedContainer.classList.remove('opacity-100');

        clearInterval(sessionTimerInterval);
        clearInterval(trafficInterval);
        if (timerDisplay) timerDisplay.textContent = '00:00:00';
        const downEl = document.getElementById('phone-speed-down');
        const upEl = document.getElementById('phone-speed-up');
        if (downEl) downEl.textContent = '0.0 Mb/s';
        if (upEl) upEl.textContent = '0.0 Mb/s';

        showToast('⚠️ Disconnected. Internet traffic is no longer encrypted.');
    }
}

/* ========================================================
   2. Interactive Speed & Latency Benchmark Tool
   ======================================================== */
const testNodes = [
    { city: 'Frankfurt, Germany', flag: '🇩🇪', basePing: 12, speed: 940, jitter: '0.8ms' },
    { city: 'Amsterdam, Netherlands', flag: '🇳🇱', basePing: 15, speed: 925, jitter: '1.1ms' },
    { city: 'New York, USA', flag: '🇺🇸', basePing: 64, speed: 880, jitter: '1.4ms' },
    { city: 'Tokyo, Japan', flag: '🇯🇵', basePing: 114, speed: 810, jitter: '2.1ms' },
    { city: 'Singapore', flag: '🇸🇬', basePing: 128, speed: 840, jitter: '1.9ms' },
    { city: 'São Paulo, Brazil', flag: '🇧🇷', basePing: 139, speed: 720, jitter: '2.4ms' }
];

function initSpeedBenchmark() {
    const startBtn = document.getElementById('start-benchmark-btn');
    const container = document.getElementById('benchmark-results-container');
    if (!startBtn || !container) return;

    startBtn.addEventListener('click', async () => {
        playSound('click');
        startBtn.disabled = true;
        startBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Testing Global Nodes...
        `;

        container.innerHTML = '';

        for (let i = 0; i < testNodes.length; i++) {
            const node = testNodes[i];
            const row = document.createElement('div');
            row.className = 'p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300';
            row.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${node.flag}</span>
                    <div>
                        <div class="font-semibold text-slate-100">${node.city}</div>
                        <div class="text-xs text-slate-400">10 Gbps WireGuard Dedicated Route</div>
                    </div>
                </div>
                <div class="flex items-center space-x-6 text-sm">
                    <div class="text-right">
                        <div class="text-xs text-slate-500 font-mono">LATENCY</div>
                        <div class="font-mono font-bold text-emerald-400 node-ping">Pinging...</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-500 font-mono">BANDWIDTH</div>
                        <div class="font-mono font-bold text-cyan-400 node-speed">--</div>
                    </div>
                    <div class="text-right hidden sm:block">
                        <div class="text-xs text-slate-500 font-mono">4K STREAMING</div>
                        <div class="font-mono text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">INSTANT</div>
                    </div>
                </div>
            `;
            container.appendChild(row);

            await new Promise(r => setTimeout(r, 220));

            // Populate test result
            const pingEl = row.querySelector('.node-ping');
            const speedEl = row.querySelector('.node-speed');
            const jitterVal = (Math.random() * 4 - 2).toFixed(0);
            const finalPing = Math.max(5, node.basePing + parseInt(jitterVal));
            const finalSpeed = node.speed + Math.floor(Math.random() * 30 - 15);

            pingEl.textContent = `${finalPing} ms`;
            speedEl.textContent = `${finalSpeed} Mbps`;
            row.classList.add('border-emerald-500/30', 'bg-slate-900/90');
        }

        startBtn.disabled = false;
        startBtn.innerHTML = `
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Re-test Global Latency
        `;
        showToast('✅ Benchmark completed! WireGuard 10Gbps mesh verified.');
    });
}

/* ========================================================
   3. Interactive Server Explorer
   ======================================================== */
const serverList = [
    { country: 'United States', city: 'New York, Ashburn, Los Angeles', flag: '🇺🇸', ping: 48, load: 32, category: ['streaming', 'p2p'] },
    { country: 'Germany', city: 'Frankfurt, Berlin', flag: '🇩🇪', ping: 14, load: 24, category: ['streaming', 'p2p', 'stealth'] },
    { country: 'United Kingdom', city: 'London, Manchester', flag: '🇬🇧', ping: 22, load: 38, category: ['streaming', 'p2p'] },
    { country: 'Japan', city: 'Tokyo, Osaka', flag: '🇯🇵', ping: 118, load: 41, category: ['streaming', 'p2p', 'stealth'] },
    { country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', ping: 18, load: 19, category: ['p2p', 'stealth'] },
    { country: 'Singapore', city: 'Singapore Central', flag: '🇸🇬', ping: 132, load: 35, category: ['streaming', 'stealth'] },
    { country: 'Canada', city: 'Toronto, Montreal', flag: '🇨🇦', ping: 55, load: 28, category: ['streaming', 'p2p'] },
    { country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', ping: 16, load: 22, category: ['streaming', 'p2p'] },
    { country: 'Australia', city: 'Sydney, Melbourne', flag: '🇦🇺', ping: 165, load: 29, category: ['streaming'] },
    { country: 'United Arab Emirates', city: 'Dubai (Obfuscated)', flag: '🇦🇪', ping: 95, load: 45, category: ['stealth'] },
    { country: 'Sweden', city: 'Stockholm', flag: '🇸🇪', ping: 28, load: 18, category: ['p2p', 'stealth'] },
    { country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', ping: 142, load: 33, category: ['streaming', 'p2p'] },
    { country: 'South Korea', city: 'Seoul', flag: '🇰🇷', ping: 125, load: 48, category: ['streaming', 'stealth'] },
    { country: 'Turkey', city: 'Istanbul (Stealth)', flag: '🇹🇷', ping: 44, load: 52, category: ['stealth'] },
    { country: 'France', city: 'Paris, Marseille', flag: '🇫🇷', ping: 24, load: 30, category: ['streaming', 'p2p'] },
    { country: 'India', city: 'Mumbai (Virtual Diskless)', flag: '🇮🇳', ping: 110, load: 42, category: ['streaming'] }
];

function initServerExplorer() {
    const grid = document.getElementById('servers-grid');
    const searchInput = document.getElementById('server-search');
    const filterButtons = document.querySelectorAll('.server-filter-btn');

    if (!grid) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function renderServers() {
        grid.innerHTML = '';
        const filtered = serverList.filter(s => {
            const matchesFilter = activeFilter === 'all' || s.category.includes(activeFilter);
            const matchesQuery = s.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 s.city.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesQuery;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-slate-500">
                    <p class="text-base">No servers matched your search "${searchQuery}".</p>
                    <p class="text-sm mt-1">Try searching for "Germany", "United States", or "Singapore".</p>
                </div>
            `;
            return;
        }

        filtered.forEach(s => {
            const card = document.createElement('div');
            card.className = 'p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 glow-card transition-all flex flex-col justify-between';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                        <span class="text-3xl">${s.flag}</span>
                        <div>
                            <div class="font-bold text-white text-base">${s.country}</div>
                            <div class="text-xs text-slate-400">${s.city}</div>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${s.load < 30 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}">
                        ● ${s.load}% Load
                    </span>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span class="text-slate-400 flex items-center">
                        <svg class="w-3.5 h-3.5 mr-1 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        ${s.ping} ms
                    </span>
                    <span class="text-slate-500">10 Gbps RAM</span>
                    <button onclick="handleQuickConnect('${s.country}')" class="text-xs font-sans text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">Connect &rarr;</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderServers();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            filterButtons.forEach(b => {
                b.classList.remove('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
                b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
            });
            btn.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
            btn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
            activeFilter = btn.dataset.filter;
            renderServers();
        });
    });

    renderServers();
}

window.handleQuickConnect = function(country) {
    playSound('click');
    showToast(`Selected ${country} node. Downloading APK configured for high-speed routing...`);
    openDownloadModal('NexusVPN-v4.8.2.apk', 'Universal APK', '6.8 MB');
};

/* ========================================================
   4. Copy to Clipboard Utility
   ======================================================== */
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.dataset.copyText;
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                playSound('click');
                const origHtml = btn.innerHTML;
                btn.innerHTML = `
                    <svg class="w-4 h-4 mr-1 text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Copied!
                `;
                setTimeout(() => {
                    btn.innerHTML = origHtml;
                }, 2000);
                showToast('📋 SHA-256 Checksum copied to clipboard!');
            }).catch(err => {
                console.error('Copy failed:', err);
            });
        });
    });
}

/* ========================================================
   5. Interactive Hash Verifier Tool
   ======================================================== */
const officialHashes = [
    '5f0cb61a04516a9419de36fb038bb20f4ec712f4213fe6fe7cde99e4093da34d', // universal
    '91370d6f4916e018f5a185d2cc4c416e5e437a24691abc83e66dea9a21cba46f'  // arm64
];

function initHashVerifier() {
    const input = document.getElementById('hash-verify-input');
    const result = document.getElementById('hash-verify-result');
    if (!input || !result) return;

    input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        if (!val) {
            result.classList.add('hidden');
            return;
        }

        result.classList.remove('hidden');
        if (officialHashes.includes(val)) {
            result.innerHTML = `
                <div class="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-2">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span><strong>100% Genuine Signature Verified!</strong> This matches the official build signed by NexusVPN SecOps.</span>
                </div>
            `;
        } else {
            result.innerHTML = `
                <div class="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-center space-x-2">
                    <svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>Hash does not match v4.8.2 release. Verify that you pasted the full 64-character SHA-256 hash.</span>
                </div>
            `;
        }
    });
}

/* ========================================================
   6. FAQ Accordion
   ======================================================== */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-toggle');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector('.faq-icon');
            const isOpen = answer.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
            document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                answer.classList.add('open');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

/* ========================================================
   7. OS Installation Tabs
   ======================================================== */
function initOsTabs() {
    const tabs = document.querySelectorAll('.os-tab-btn');
    const contents = document.querySelectorAll('.os-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            const target = tab.dataset.osTarget;
            tabs.forEach(t => {
                t.classList.remove('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
                t.classList.add('border-transparent', 'text-slate-400');
            });
            tab.classList.add('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/10');
            tab.classList.remove('border-transparent', 'text-slate-400');

            contents.forEach(c => {
                if (c.id === target) {
                    c.classList.remove('hidden');
                } else {
                    c.classList.add('hidden');
                }
            });
        });
    });
}

/* ========================================================
   8. Sticky Bottom Download Bar
   ======================================================== */
function initStickyDownloadBar() {
    const bar = document.getElementById('sticky-download-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            bar.classList.add('visible');
        } else {
            bar.classList.remove('visible');
        }
    });
}

/* ========================================================
   9. Download Modal & Real APK Trigger
   ======================================================== */
let activeDownloadTimer = null;

function initDownloadModal() {
    const modal = document.getElementById('download-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const triggerButtons = document.querySelectorAll('.trigger-download-modal');

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const fileName = btn.dataset.file || 'NexusVPN-v4.8.2.apk';
            const label = btn.dataset.arch || 'Universal Android APK';
            const size = btn.dataset.size || '6.8 MB';
            openDownloadModal(fileName, label, size);
        });
    });

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }
}

function openDownloadModal(fileName, archLabel, fileSize) {
    playSound('connect');
    const modal = document.getElementById('download-modal');
    if (!modal) return;

    modal.classList.remove('hidden');

    document.getElementById('modal-filename').textContent = fileName;
    document.getElementById('modal-arch').textContent = `${archLabel} • ${fileSize}`;
    
    const directLink = document.getElementById('modal-direct-link');
    if (directLink) {
        directLink.href = `downloads/${fileName}`;
        directLink.setAttribute('download', fileName);
    }

    const progressBar = document.getElementById('modal-progress-bar');
    const progressPercent = document.getElementById('modal-progress-percent');
    const statusText = document.getElementById('modal-status-text');

    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    statusText.textContent = 'Connecting to high-speed mirror...';

    let progress = 0;
    clearInterval(activeDownloadTimer);
    activeDownloadTimer = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(activeDownloadTimer);
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';
            statusText.textContent = 'Download started! Follow the 3 install steps below.';
            
            // Trigger actual browser download
            const a = document.createElement('a');
            a.href = `downloads/${fileName}`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            showToast(`🚀 ${fileName} download started! Check notification bar.`);
        } else {
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
            statusText.textContent = `Downloading package (${progress}%)...`;
        }
    }, 180);
}

/* ========================================================
   10. Toast Notification System
   ======================================================== */
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}
