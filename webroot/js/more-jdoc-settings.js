var colorPicker = new iro.ColorPicker("#picker", {
    width: 250,
    layout: [
        {
            component: iro.ui.Wheel,
        },
    ],
});

function setRobotSettingsStatus(status) {
    const el = document.getElementById('robotSettingsStatus');
    el.innerHTML = `<p>${status}</p>`;
}

async function setVolume() {
    const v = document.querySelector('input[name="volume"]:checked').value;
    setRobotSettingsStatus("Setting volume...")
    try {
        const res = await fetch(`/api/mods/MoreJdocSettings/setVolume?volume=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setRobotSettingsStatus(`${e.status}: ${e.message}`);
        } else {
            getVolume()
            setRobotSettingsStatus('Successfully set volume.');
        }
    } catch (e) {
        setRobotSettingsStatus(`network error: ${e.message}`);
    }
}

async function setEyeColor() {
    const v = document.querySelector('input[name="eyecolor"]:checked').value;
    setRobotSettingsStatus("Setting eye color...")
    try {
        const res = await fetch(`/api/mods/MoreJdocSettings/setEyeColor?color=${v}`);
        if (!res.ok) {
            const e = await res.json();
            setRobotSettingsStatus(`${e.status}: ${e.message}`);
        } else {
            getEyeColor()
            setRobotSettingsStatus('Successfully set eye color.');
        }
    } catch (e) {
        setRobotSettingsStatus(`network error: ${e.message}`);
    }
}

async function setCustomEyeColor() {
    const hue = (colorPicker.color.hue / 360).toFixed(3);
    const sat = (colorPicker.color.saturation / 100).toFixed(3);
    setRobotSettingsStatus("Setting custom eye color...")
    try {
        const res = await fetch(`/api/mods/MoreJdocSettings/setCustomEyeColor?hue=${hue}&sat=${sat}`);
        if (!res.ok) {
            const e = await res.json();
            setRobotSettingsStatus(`${e.status}: ${e.message}`);
        } else {
            getEyeColor()
            setRobotSettingsStatus('Successfully set custom eye color.');
        }
    } catch (e) {
        setRobotSettingsStatus(`network error: ${e.message}`);
    }
}

async function getVolume() {
    try {
        const res = await fetch(`/api/mods/MoreJdocSettings/getVolume`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        } else {
            const e = await res.text();
            document.getElementsByName('volume')
                .forEach(rb => { rb.checked = rb.value == e; });
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}

async function getEyeColor() {
    try {
        const res = await fetch(`/api/mods/MoreJdocSettings/getEyeColor`);
        if (!res.ok) {
            const e = await res.json();
            console.log(`${e.status}: ${e.message}`);
        } else {
            const e = await res.json();
            document.getElementsByName('eyecolor')
                .forEach(rb => { rb.checked = !e.iscustom && rb.value == e.preset; });
            if (e.iscustom) {
                colorPicker.color.hsl = { h: e.hue * 360, s: e.saturation * 100, l: 50 };
            }
        }
    } catch (e) {
        console.log(`network error: ${e.message}`);
    }
}
