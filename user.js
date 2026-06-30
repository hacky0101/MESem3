// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
// tracker.js - Fixed Version

let sessionStart = Date.now();
let currentPage = window.location.pathname;
let pageStartTime = Date.now();
let userIP = "N/A";
let userLocation = "N/A";

// IP + Location try karo (multiple services)
async function getIPAndLocation() {
    const services = [
        'https://api.ipapi.is/?q=json',
        'https://ipapi.co/json/',
        'https://api.myip.com/'
    ];

    for (let url of services) {
        try {
            const res = await fetch(url, { method: 'GET', mode: 'cors' });
            const data = await res.json();

            if (data.ip) {
                userIP = data.ip;
            }
            if (data.country_name || data.country) {
                const city = data.city || data.region || '';
                const country = data.country_name || data.country;
                userLocation = city ? `${city}, ${country}` : country;
            }
            break; // Agar ek service se mil gaya toh ruk jao
        } catch (e) {
            continue;
        }
    }
    trackPageView(); // Chaahe IP mile ya na mile, tracking toh chalni chahiye
}

// Send Alert
function sendAlert(message) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
    }).catch(() => {});
}

// Page View
function trackPageView() {
    const device = window.innerWidth < 768 ? "📱 Mobile" : "💻 Desktop";

    const message = `
🔴 <b>New Visitor</b>

📌 <b>Title:</b> ${document.title}
📄 <b>Page:</b> ${currentPage}
🔗 <b>URL:</b> ${window.location.href}
🌐 <b>IP:</b> ${userIP}
📍 <b>Location:</b> ${userLocation}
🖥️ <b>Device:</b> \( {device} ( \){window.innerWidth}x${window.innerHeight})
⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN')}
↩️ <b>Referrer:</b> ${document.referrer || 'Direct'}
    `.trim();

    sendAlert(message);
    pageStartTime = Date.now();
}

// Rest of the code (scroll, click, beforeunload etc.)
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    if (timeSpent > 5) sendAlert(`⏱️ Left <b>\( {document.title}</b> after <b> \){timeSpent}</b> sec`);
});

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) sendAlert(`🖱️ Button Click: <b>${btn.textContent.trim() || 'Button'}</b>`);
});

document.addEventListener('scroll', () => {}); // scroll depth optional

// Start
getIPAndLocation();
