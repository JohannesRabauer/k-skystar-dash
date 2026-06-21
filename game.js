const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

const GRAVITY = 0.6, JUMP = -12, MAX_FALL = 15, BASE_SPEED = 3, SPEED_INC = 0.15, MAX_SPEED = 12;
const LS_KEY = 'skystar-dash-highscore';

let state, player, buildings, stars, bgStars, speed, score, highscore, newRecord, frame;

function init() {
    highscore = parseInt(localStorage.getItem(LS_KEY)) || 0;
    state = 'START';
    bgStars = Array.from({length: 60}, () => ({x: Math.random()*800, y: Math.random()*350, r: Math.random()*1.5+0.5}));
    frame = 0;
    requestAnimationFrame(loop);
}

function startGame() {
    score = 0; speed = BASE_SPEED; newRecord = false; frame = 0;
    player = {x: 150, y: 0, vy: 0, w: 30, h: 40, grounded: false};
    buildings = [{x: 50, w: 200, h: 200}];
    stars = [];
    player.y = canvas.height - buildings[0].h - player.h;
    generate();
    state = 'RUNNING';
}

function generate() {
    while (true) {
        const last = buildings[buildings.length - 1];
        const nextX = last.x + last.w + 60 + Math.random()*90 + (speed - BASE_SPEED)*8;
        if (nextX > canvas.width + 200) break;
        const b = {x: nextX, w: 80 + Math.random()*120, h: 200 + Math.random()*150};
        buildings.push(b);
        if (Math.random() < 0.7) {
            stars.push({x: b.x + 20 + Math.random()*(b.w-40), y: canvas.height - b.h - 25, r: 12, collected: false});
        }
    }
}

function jump() {
    if (state === 'START') { startGame(); return; }
    if (state === 'GAME_OVER') { state = 'START'; return; }
    if (state === 'RUNNING' && player.grounded) { player.vy = JUMP; player.grounded = false; }
}

canvas.addEventListener('pointerdown', jump);
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); }});

function update() {
    frame++;
    // physics
    player.vy = Math.min(player.vy + GRAVITY, MAX_FALL);
    player.y += player.vy;
    player.grounded = false;

    // scroll
    for (const b of buildings) b.x -= speed;
    for (const s of stars) s.x -= speed;
    for (const s of bgStars) { s.x -= speed * 0.2; if (s.x < 0) s.x += 800; }

    // cleanup
    buildings = buildings.filter(b => b.x + b.w > -50);
    stars = stars.filter(s => !s.collected && s.x > -50);

    // generate
    generate();

    // landing
    for (const b of buildings) {
        const onX = player.x + player.w > b.x && player.x < b.x + b.w;
        const top = canvas.height - b.h;
        if (onX && player.vy >= 0 && player.y + player.h >= top && player.y + player.h <= top + player.vy + 10) {
            player.y = top - player.h;
            player.vy = 0;
            player.grounded = true;
        }
    }

    // collect stars
    for (const s of stars) {
        if (!s.collected && player.x + player.w > s.x - s.r && player.x < s.x + s.r && player.y + player.h > s.y - s.r && player.y < s.y + s.r) {
            s.collected = true;
            score++;
            speed = Math.min(speed + SPEED_INC, MAX_SPEED);
        }
    }

    // fall death
    if (player.y > canvas.height) {
        state = 'GAME_OVER';
        if (score > highscore) { highscore = score; newRecord = true; localStorage.setItem(LS_KEY, highscore); }
    }
}

function drawStar(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
}

function render() {
    // sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // bg stars
    ctx.fillStyle = '#ffffff88';
    for (const s of bgStars) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill(); }

    // buildings
    for (const b of buildings) {
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h);
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(b.x, canvas.height - b.h, b.w, 4);
    }

    // stars
    ctx.fillStyle = '#ffd700';
    for (const s of stars) {
        if (s.collected) continue;
        const pulse = 1 + Math.sin(frame * 0.08) * 0.15;
        drawStar(s.x, s.y, s.r * pulse);
    }

    if (state === 'RUNNING' || state === 'GAME_OVER') {
        // player
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // HUD
        ctx.font = '20px sans-serif'; ctx.fillStyle = '#fff';
        ctx.textAlign = 'left'; ctx.fillText(`⭐ ${score}`, 15, 30);
        ctx.textAlign = 'right'; ctx.fillText(`🏆 ${highscore}`, 785, 30);
    }

    if (state === 'START') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 800, 500);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px sans-serif'; ctx.fillText('SkyStar Dash', 400, 180);
        ctx.font = '22px sans-serif';
        if (highscore > 0) ctx.fillText(`Rekord: ${highscore} ⭐`, 400, 240);
        ctx.font = '18px sans-serif'; ctx.fillStyle = '#aaa';
        ctx.fillText('Klicke oder drücke Leertaste zum Starten', 400, 320);
    }

    if (state === 'GAME_OVER') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 800, 500);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.font = 'bold 42px sans-serif'; ctx.fillText('Game Over', 400, 170);
        ctx.font = '26px sans-serif'; ctx.fillText(`Sterne: ${score}`, 400, 230);
        ctx.fillText(`Rekord: ${highscore}`, 400, 270);
        if (newRecord) { ctx.fillStyle = '#ffd700'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('🎉 Neuer Rekord!', 400, 320); }
        ctx.fillStyle = '#aaa'; ctx.font = '18px sans-serif'; ctx.fillText('Klicke zum Neustarten', 400, 380);
    }
}

function loop() {
    if (state === 'RUNNING') update();
    render();
    requestAnimationFrame(loop);
}

init();
