const tabs = document.querySelectorAll('.tabs button');
tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(btn.dataset.target).classList.add('active');
}));

function hide(id) { document.getElementById(id).style.display = 'none'; }
function show(id) { document.getElementById(id).style.display = 'block'; }

async function GetCurrent(mod) {
    let res = await fetch(`/api/mods/${mod}/get`);
    return res.text();
}

function SetModStatus(msg) {
    const div = document.getElementById('modStatus');
    div.innerHTML = `<h3>${msg}</h3>`;
    div.style.display = msg ? 'block' : 'none';
}

function HideModStatus() { hide('modStatus'); }

async function UpdateAllMods() {
    checkAutoUpdateStatus();
}

async function setAutoUpdateStatus(status) {
    const el = document.getElementById('autoUpdateStatus');
    el.innerHTML = `<p>${status}</p>`;
    show('autoUpdateStatus');
}

async function checkAutoUpdateStatus() {
    ['autoUpdateStatus', 'autoUpdateInhibit', 'autoUpdateAllow'].forEach(hide);
    let res = await fetch('/api/mods/AutoUpdate/isSelfMadeBuild');
    let txt = await res.text();
    if (txt.includes('true')) {
        setAutoUpdateStatus('This is a self-made build. This build cannot auto-update.');
    } else {
        res = await fetch('/api/mods/AutoUpdate/isInhibitedByUser');
        txt = await res.text();
        if (txt.includes('true')) {
            setAutoUpdateStatus('Auto-updates: not enabled');
            show('autoUpdateAllow');
        } else {
            setAutoUpdateStatus('Auto-updates: enabled');
            show('autoUpdateInhibit');
        }
    }
}

async function autoUpdateInhibit() {
    ['autoUpdateStatus', 'autoUpdateInhibit', 'autoUpdateAllow'].forEach(hide);
    await fetch('/api/mods/AutoUpdate/setInhibited');
    checkAutoUpdateStatus();
}
async function autoUpdateAllow() {
    ['autoUpdateStatus', 'autoUpdateInhibit', 'autoUpdateAllow'].forEach(hide);
    await fetch('/api/mods/AutoUpdate/setAllowed');
    checkAutoUpdateStatus();
}

UpdateAllMods();