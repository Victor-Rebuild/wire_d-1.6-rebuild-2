async function setBackpackLightsStatus(status) {
    const el = document.getElementById('BackpackLightsStatus');
    el.innerHTML = `<p>${status}</p>`;
    show('BackpackLightsStatus');
}

async function checkBackpackLightsStatus() {
    ['BackpackLightsStatus', 'BackpackLightsInhibit', 'BackpackLightsAllow'].forEach(hide);
    let res = await fetch('/api/mods/BackpackLights/isAnkiLights');
    let txt = await res.text();
    if (txt.includes('true')) {
        setBackpackLightsStatus('Auto-updates: not enabled');
        show('BackpackLightsAllow');
    } else {
        setBackpackLightsStatus('Auto-updates: enabled');
        show('BackpackLightsInhibit');
    }
}

async function BackpackLightsInhibit() {
    ['BackpackLightsStatus', 'BackpackLightsInhibit', 'BackpackLightsAllow'].forEach(hide);
    await fetch('/api/mods/BackpackLights/setAnki');
    await RestartVic();
    checkBackpackLightsStatus();
    setBackpackLightsStatus('Anki lights enabled!');
}
async function BackpackLightsAllow() {
    ['BackpackLightsStatus', 'BackpackLightsInhibit', 'BackpackLightsAllow'].forEach(hide);
    await fetch('/api/mods/BackpackLights/setCustom');
    await RestartVic();
    checkBackpackLightsStatus();
    setBackpackLightsStatus('CFW lights enabled!');
}

async function RestartVic() {
    const tabsEl = document.querySelector('.tabs');
    const activePanel = document.querySelector('.tab-content.active');
    tabsEl.style.display = 'none';
    if (activePanel) activePanel.classList.remove('active');
    show('showDuringVicRestart');
    await fetch('/api/extra/restartvic', { method: 'POST' });
    hide('showDuringVicRestart');
    tabsEl.style.display = 'flex';
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = '');
    if (activePanel) activePanel.classList.add('active');
}