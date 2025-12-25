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

    getTimezone()
    getLocation()
    getTempUnits()
}

function setJdocStatus(status) {
    const el = document.getElementById('jdocStatus');
    el.innerHTML = `<p>${status}</p>`;
}

async function setLocation() {
    const v = document.getElementById('location').value;
    setJdocStatus("Setting location...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setLocation?location=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setJdocStatus(`${e.status}: ${e.message}`);
        } else {
            getLocation()
            setJdocStatus('Successfully set location.');
        }
    } catch (e) {
        setJdocStatus(`network error: ${e.message}`);
    }
}

async function setTimezone() {
    const v = document.getElementById('timezone').value;
    setJdocStatus("Setting time zone...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setTimezone?timezone=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setJdocStatus(`${e.status}: ${e.message}`);
        } else {
            getTimezone()
            setJdocStatus('Successfully set time zone.');
        }
    } catch (e) {
        setJdocStatus(`network error: ${e.message}`);
    }
}

async function setTempUnits() {
    const v = document.getElementById('tUnits').value;
    setJdocStatus("Setting time zone...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setFahrenheit?t=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setJdocStatus(`${e.status}: ${e.message}`);
        } else {
            getTimezone()
            setJdocStatus('Successfully set temp units.');
        }
    } catch (e) {
        setJdocStatus(`network error: ${e.message}`);
    }
}

async function getLocation() {
    try {
        const res = await fetch(`/api/mods/JdocSettings/getLocation`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        } else {
            const e = await res.text();
            document.getElementById('location').value = e;
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}

async function getTimezone() {
    try {
        const res = await fetch(`/api/mods/JdocSettings/getTimezone`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        } else {
            const e = await res.text();
            document.getElementById('timezone').value = e;
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}

async function getTempUnits() {
    try {
        const res = await fetch(`/api/mods/JdocSettings/getFahrenheit`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        } else {
            const e = await res.text();
            document.getElementById('tUnits').value = e;
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}


UpdateAllMods();