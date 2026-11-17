const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Screen ka size set karna
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Hacker wale characters (Numbers, Alphabets, Symbols)
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

// Har column ke liye ek drop set karna
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

// Draw function jo bar-bar chalega
function draw() {
    // Pichla frame thoda black karna jisse fading effect aaye
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff41'; // Neon Green color
    ctx.font = fontSize + 'px Courier New';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Screen ke bahar jane par wapas upar bhejna
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Speed set karna (33 milliseconds = ~30 frames per second)
setInterval(draw, 33);

// Window resize hone par canvas ka size update karna
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
