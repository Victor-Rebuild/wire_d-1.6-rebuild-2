function setIdentityStatus(status) {
    const el = document.getElementById('identificationStatus');
    el.innerHTML = `<p>${status}</p>`;
}

async function getName() {
    try {
        const res = await fetch(`/api/mods/JdocSettings/getName`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}

async function setName() {
    const v = document.getElementById('name').value;
    setIdentityStatus("Setting name...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setName?name=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setIdentityStatus(`${e.status}: ${e.message}`);
        } else {
            getName()
            setIdentityStatus('Successfully set name.');
        }
    } catch (e) {
        setIdentityStatus(`network error: ${e.message}`);
    }
}

async function setPronouns() {
    const v = document.getElementById('pronouns').value;
    setIdentityStatus("Setting pronouns...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setPronouns?pronouns=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setIdentityStatus(`${e.status}: ${e.message}`);
        } else {
            setIdentityStatus('Successfully set pronouns.');
        }
    } catch (e) {
        setIdentityStatus(`network error: ${e.message}`);
    }
}

async function setPronounsDef() {
    const v = document.getElementById('pronouns').value;
    setIdentityStatus("Setting pronouns...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setPronouns?pronouns=He/Him`);
        if (!res.ok) {
            const e = await res.json();
            setIdentityStatus(`${e.status}: ${e.message}`);
        } else {
            setIdentityStatus('Successfully set pronouns to default.');
        }
    } catch (e) {
        setIdentityStatus(`network error: ${e.message}`);
    }
}

async function setPronounsAll() {
    const v = document.getElementById('pronouns').value;
    setIdentityStatus("Setting pronouns...")
    try {
        const res = await fetch(`/api/mods/JdocSettings/setPronouns?pronouns=Any`);
        if (!res.ok) {
            const e = await res.json();
            setIdentityStatus(`${e.status}: ${e.message}`);
        } else {
            setIdentityStatus('Successfully set pronouns.');
        }
    } catch (e) {
        setIdentityStatus(`network error: ${e.message}`);
    }
}

UpdateAllMods();