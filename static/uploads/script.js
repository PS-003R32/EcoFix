const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let centerX, centerY;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Star {
    constructor() { this.reset(); }
    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 300 + 20;
        this.size = Math.random() * 1.5;
        this.speed = (0.02 / (this.radius * 0.01)) * (Math.random() * 0.5 + 0.5);
        this.color = Math.random() > 0.7 ? '#f72585' : '#4cc9f0';
        this.opacity = Math.random();
    }
    update() {
        this.angle += this.speed;
        this.x = centerX + Math.cos(this.angle) * this.radius;
        this.y = centerY + Math.sin(this.angle) * this.radius * 0.6;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function initStars() { for (let i = 0; i < 300; i++) particles.push(new Star()); }
function animateStars() {
    ctx.fillStyle = 'rgba(11, 13, 23, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateStars);
}
initStars();
animateStars();

let currentFilename = null;

function switchTab(mode) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('scanMode').classList.add('hidden');
    document.getElementById('liveMode').classList.add('hidden');
    document.getElementById('historyMode').classList.add('hidden');
    stopCamera();

    if (mode === 'scan') {
        document.getElementById('scanMode').classList.remove('hidden');
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    } else if (mode === 'live') {
        document.getElementById('liveMode').classList.remove('hidden');
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        startCamera();
    } else if (mode === 'history') {
        document.getElementById('historyMode').classList.remove('hidden');
        document.querySelector('.tab-btn:nth-child(3)').classList.add('active');
        loadHistory();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    if (!currentFilename) return alert("Upload an image first.");

    const log = document.getElementById('chatLog');
    log.innerHTML += `<div class="msg user">${msg}</div>`;
    input.value = "";
    log.scrollTop = log.scrollHeight;

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, filename: currentFilename })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        log.innerHTML += `<div class="msg ai">${data.reply.replace(/\n/g, '<br>')}</div>`;
        log.scrollTop = log.scrollHeight;
    } catch (err) {
        log.innerHTML += `<div class="msg ai" style="color:red">Signal Lost.</div>`;
    }
}

const fileInput = document.getElementById('fileInput');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('previewImg').src = ev.target.result;
                document.getElementById('previewImg').classList.remove('hidden');
                document.getElementById('placeholder').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}
function processUpload() {
    const file = fileInput.files[0];
    if (!file) return alert("Select an image.");
    sendData(file);
}

let currentStream = null;
async function startCamera() {
    const video = document.getElementById('videoFeed');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        currentStream = stream;
        video.onloadedmetadata = () => video.play();
    } catch (err) { console.log(err); }
}
function stopCamera() {
    if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
}
function captureAndAnalyze() {
    const video = document.getElementById('videoFeed');
    const canvas = document.getElementById('captureCanvas');
    if (video.readyState !== 4) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    document.getElementById('snapshotPreview').src = canvas.toDataURL('image/jpeg');
    document.getElementById('snapshotPreview').classList.remove('hidden');
    canvas.toBlob((blob) => sendData(blob), 'image/jpeg', 0.85);
}

async function sendData(file) {
    const problemText = document.getElementById('problemInput').value;
    const loading = document.getElementById('loading');
    const resultsArea = document.getElementById('resultsArea');

    document.getElementById('scanMode').classList.add('hidden');
    document.getElementById('liveMode').classList.add('hidden');
    loading.classList.remove('hidden');
    resultsArea.classList.add('hidden');
    document.getElementById('chatLog').innerHTML = "<div class='msg ai'>Link Established. Awaiting Input.</div>";

    const formData = new FormData();
    formData.append('image', file, "upload.jpg");
    formData.append('problem', problemText);

    try {
        const res = await fetch('/analyze', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentFilename = data.filename;
        let cleanJson = data.result.replace(/```json/g, '').replace(/```/g, '');
        renderResults(JSON.parse(cleanJson));
    } catch (err) {
        alert("Error: " + err.message);
        window.location.reload();
    } finally {
        loading.classList.add('hidden');
    }
}

function renderResults(data) {
    document.getElementById('resultsArea').classList.remove('hidden');
    document.getElementById('moneyVal').innerText = data.impact?.money_saved || "$0";

    document.getElementById('ewasteVal').innerText = data.impact?.ewaste_saved || "0kg";

    document.getElementById('deviceTitle').innerText = data.device_name || "UNKNOWN";
    document.getElementById('diagnosisText').innerText = data.diagnosis;
    document.getElementById('safetyText').innerText = data.safety;

    const list = document.getElementById('stepsList');
    list.innerHTML = "";
    data.steps.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        list.appendChild(li);
    });
}
