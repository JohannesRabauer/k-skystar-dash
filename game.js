const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

const GRAVITY = 0.6, JUMP = -12, MAX_FALL = 15, BASE_SPEED = 3, SPEED_INC = 0.15, MAX_SPEED = 12;
const LS_KEY = 'skystar-dash-highscore';

let state, player, buildings, stars, bgStars, speed, score, highscore, newRecord, frame;

function init() {
    highscore = parseInt(localStorage.getItem(LS_KEY)) || 0;
    bgStars = Array.from({length: 60}, () => ({x: Math.random()*800, y: Math.random()*350, r: Math.random()*1.5+0.5}));
    frame = 0;
    resetGame();
    state = 'START';
    loop();
}

function resetGame() {
    score = 0; speed = BASE_SPEED; newRecord = false; frame = 0;
    player = {x: 150, y: 0, vy: 0, w: 30, h: 40, grounded: true};
    buildings = [{x: 50, w: 200, h: 200}];
    stars = [];
    player.y = canvas.height - buildings[0].h - player.h;
    generate();
}

function generate() {
    while (true) {
        const last = buildings[buildings.length - 1];
        const gap = 60 + Math.random()*90 + (speed - BASE_SPEED)*8;
        const nextX = last.x + last.w + gap;
        if (nextX > canvas.width + 200) break;
        const b = {x: nextX, w: 80 + Math.random()*120, h: 200 + Math.random()*150};
        buildings.push(b);
        if (Math.random() < 0.7) {
            stars.push({x: b.x + 20 + Math.random()*(b.w-40), y: canvas.height - b.h - 25, r: 12, collected: false});
        }
    }
}

function jump() {
    if (state === 'START') { resetGame(); state = 'RUNNING'; return; }
    if (state === 'GAME_OVER') { state = 'START'; resetGame(); return; }
    if (state === 'RUNNING' && player.grounded) { player.vy = JUMP; player.grounded = false; }
}

// Input - both touch and mouse
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, {passive: false});
canvas.addEventListener('mousedown', e => { jump(); });
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); }});

function update() {
    frame++;
    player.vy = Math.min(player.vy + GRAVITY, MAX_FALL);
    player.y += player.vy;
    player.grounded = false;

    for (const b of buildings) b.x -= speed;
    for (const s of stars) s.x -= speed;
    for (const s of bgStars) { s.x -= speed * 0.2; if (s.x < 0) s.x += 800; }

    buildings = buildings.filter(b => b.x + b.w > -50);
    stars = stars.filter(s => !s.collected && s.x > -50);
    generate();

    for (const b of buildings) {
        const onX = player.x + player.w > b.x && player.x < b.x + b.w;
        const top = canvas.height - b.h;
        if (onX && player.vy >= 0 && player.y + player.h >= top && player.y + player.h <= top + player.vy + 10) {
            player.y = top - player.h;
            player.vy = 0;
            player.grounded = true;
        }
    }

    for (const s of stars) {
        if (!s.collected && player.x + player.w > s.x - s.r && player.x < s.x + s.r && player.y + player.h > s.y - s.r && player.y < s.y + s.r) {
            s.collected = true;
            score++;
            speed = Math.min(speed + SPEED_INC, MAX_SPEED);
        }
    }

    if (player.y > canvas.height) {
        state = 'GAME_OVER';
        if (score > highscore) { highscore = score; newRecord = true; localStorage.setItem(LS_KEY, highscore); }
    }
}

function drawStar(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
}

function render() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 800, 500);

    ctx.fillStyle = '#ffffff88';
    for (const s of bgStars) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill(); }

    for (const b of buildings) {
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h);
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(b.x, canvas.height - b.h, b.w, 4);
    }

    ctx.fillStyle = '#ffd700';
    for (const s of stars) {
        if (s.collected) continue;
        const pulse = 1 + Math.sin(frame * 0.08) * 0.15;
        drawStar(s.x, s.y, s.r * pulse);
    }

    // player
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    if (state === 'RUNNING') {
        ctx.font = 'bold 24px sans-serif'; ctx.fillStyle = '#fff';
        ctx.textAlign = 'left'; ctx.fillText(`⭐ ${score}`, 15, 35);
        ctx.textAlign = 'right'; ctx.fillText(`🏆 ${highscore}`, 785, 35);
    }

    if (state === 'START') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, 800, 500);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = 'bold 52px sans-serif'; ctx.fillText('SkyStar Dash', 400, 170);
        ctx.font = '24px sans-serif';
        if (highscore > 0) ctx.fillText(`Rekord: ${highscore} ⭐`, 400, 230);
        ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#00d4ff';
        ctx.fillText('▶ TAP TO PLAY', 400, 330);
    }

    if (state === 'GAME_OVER') {
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, 800, 500);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = 'bold 44px sans-serif'; ctx.fillText('Game Over', 400, 160);
        ctx.font = '28px sans-serif'; ctx.fillText(`⭐ ${score}`, 400, 220);
        ctx.fillText(`🏆 ${highscore}`, 400, 260);
        if (newRecord) { ctx.fillStyle = '#ffd700'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('🎉 Neuer Rekord!', 400, 310); }
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 26px sans-serif'; ctx.fillText('▶ TAP TO RETRY', 400, 380);
    }
}

function loop() {
    if (state === 'RUNNING') update();
    render();
    requestAnimationFrame(loop);
}

init();
