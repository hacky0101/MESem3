// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
// tracker.js - Fixed Version
// tracker.js - Final Fixed Version


let sessionStart = Date.now();
let currentPage = window.location.pathname;
let pageStartTime = Date.now();
let userIP = "N/A";
let userLocation = "N/A";

// IP + Location
async function getIPAndLocation() {
    try {
        const res = await fetch('https://api.ipapi.is/?q=json');
        const data = await res.json();
        
        if (data.ip) userIP = data.ip;
        if (data.location) {
            const city = data.location.city || '';
            const country = data.location.country || '';
            userLocation = city && country ? `${city}, ${country}` : (country || city || "Unknown");
        }
    } catch (e) {
        try {
            const res2 = await fetch('https://ipapi.co/json/');
            const data2 = await res2.json();
            userIP = data2.ip || "N/A";
            userLocation = `${data2.city || ''}, ${data2.country_name || ''}`.replace(/^,\s*/, '');
        } catch {}
    }
    trackPageView();
}

// Send Message
function sendAlert(message) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
        })
    }).catch(() => {});
}

// Fixed Page View
function trackPageView() {
    const isMobile = window.innerWidth < 768;
    const device = isMobile ? "📱 Mobile" : "💻 Desktop";

    const message = `
🔴 <b>New Visitor</b>

📌 <b>Title:</b> ${document.title}
📄 <b>Page:</b> ${currentPage}
🔗 <b>URL:</b> ${window.location.href}
🌐 <b>IP:</b> ${userIP}
📍 <b>Location:</b> ${userLocation}
🖥️ <b>Device:</b> \( {device} ( \){window.innerWidth} × ${window.innerHeight})
⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN')}
↩️ <b>Referrer:</b> ${document.referrer || 'Direct'}
    `.trim();

    sendAlert(message);
    pageStartTime = Date.now();
}

// Click Tracking
document.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
        const text = e.target.textContent.trim() || "Button";
        sendAlert(`🖱️ Button Clicked: <b>${text}</b>`);
    }
});

// Page Leave
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    if (timeSpent > 5) {
        sendAlert(`⏱️ Left <b>\( {document.title}</b> after <b> \){timeSpent}</b> seconds`);
    }
});

// Start
getIPAndLocation();
