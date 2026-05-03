(function () {
    const WHEEL_SIZE = 200;
    const RADIUS = WHEEL_SIZE / 2 - 4;
    const CX = WHEEL_SIZE / 2;
    const CY = WHEEL_SIZE / 2;

    let eyeHue = 0.55;
    let eyeSat = 0.80;
    let dragging = false;

    function hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function renderWheel(ctx) {
        const img = ctx.createImageData(WHEEL_SIZE, WHEEL_SIZE);
        const d = img.data;
        for (let y = 0; y < WHEEL_SIZE; y++) {
            for (let x = 0; x < WHEEL_SIZE; x++) {
                const dx = x - CX, dy = y - CY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= RADIUS) {
                    let angle = Math.atan2(dy, dx);
                    if (angle < 0) angle += 2 * Math.PI;
                    const hue = angle / (2 * Math.PI);
                    const sat = dist / RADIUS;
                    const [r, g, b] = hslToRgb(hue, sat, 0.5);
                    const i = (y * WHEEL_SIZE + x) * 4;
                    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
                }
            }
        }
        ctx.putImageData(img, 0, 0);
    }

    function renderCursor(ctx) {
        const angle = eyeHue * 2 * Math.PI;
        const dist = eyeSat * RADIUS;
        const px = CX + Math.cos(angle) * dist;
        const py = CY + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(px, py, 9, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        const [r, g, b] = hslToRgb(eyeHue, eyeSat, 0.5);
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, 2 * Math.PI);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 9, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function redraw(ctx) {
        renderWheel(ctx);
        renderCursor(ctx);
        updatePreviewSwatch();
    }

    function updatePreviewSwatch() {
        const swatch = document.getElementById('eyeColorSwatch');
        if (!swatch) return;
        const [r, g, b] = hslToRgb(eyeHue, eyeSat, 0.5);
        swatch.style.backgroundColor = `rgb(${r},${g},${b})`;

        const hDisp = document.getElementById('eyeHueDisplay');
        const sDisp = document.getElementById('eyeSatDisplay');
        if (hDisp) hDisp.textContent = eyeHue.toFixed(3);
        if (sDisp) sDisp.textContent = eyeSat.toFixed(3);
    }

    function pickFromEvent(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = WHEEL_SIZE / rect.width;
        const scaleY = WHEEL_SIZE / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) * scaleX - CX;
        const y = (clientY - rect.top) * scaleY - CY;
        const dist = Math.sqrt(x * x + y * y);
        if (dist > RADIUS) return false;

        let angle = Math.atan2(y, x);
        if (angle < 0) angle += 2 * Math.PI;
        eyeHue = angle / (2 * Math.PI);
        eyeSat = dist / RADIUS;
        return true;
    }

    function setEyeStatus(msg, isError) {
        const el = document.getElementById('eyeColorStatus');
        if (!el) return;
        el.textContent = msg;
        el.style.color = isError ? '#ff6b6b' : '#a0f0a0';
    }

    async function loadEyeColorFromRobo(ctx) {
        try {
            const res = await fetch('/api/mods/EyeColor/get');
            if (!res.ok) return;
            const data = await res.json();
            if (data.iscustom) {
                eyeHue = data.hue;
                eyeSat = data.saturation;
                setEyeStatus('Loaded current color from robot.', false);
            }
        } catch (e) {
            console.log('eye color load error:', e);
        }
        redraw(ctx);
    }

    window.applyEyeColor = async function () {
        setEyeStatus('Applying…', false);
        try {
            const res = await fetch(
                `/api/mods/EyeColor/set?hue=${eyeHue.toFixed(5)}&saturation=${eyeSat.toFixed(5)}`
            );
            if (!res.ok) {
                const e = await res.json();
                setEyeStatus(`Error: ${e.message}`, true);
            } else {
                setEyeStatus('Color applied!', false);
            }
        } catch (e) {
            setEyeStatus(`Network error: ${e.message}`, true);
        }
    };

    window.disableEyeColor = async function () {
        setEyeStatus('Disabling custom color…', false);
        try {
            const res = await fetch('/api/mods/EyeColor/disable');
            if (!res.ok) {
                const e = await res.json();
                setEyeStatus(`Error: ${e.message}`, true);
            } else {
                setEyeStatus('Reverted to default eye color.', false);
            }
        } catch (e) {
            setEyeStatus(`Network error: ${e.message}`, true);
        }
    };

    function init() {
        const canvas = document.getElementById('eyeColorWheel');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        redraw(ctx);

        loadEyeColorFromRobo(ctx);

        canvas.addEventListener('mousedown', e => {
            if (pickFromEvent(canvas, e)) { dragging = true; redraw(ctx); }
        });
        canvas.addEventListener('mousemove', e => {
            if (dragging && pickFromEvent(canvas, e)) redraw(ctx);
        });
        window.addEventListener('mouseup', () => { dragging = false; });
    }

    init();
})();