// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
// user.js
let sessionStart = Date.now();
let currentPage = window.location.pathname;
let pageStartTime = Date.now();
let userIP = "Detecting...";
let userLocation = "";
let totalScroll = 0;

// Get IP + Location
async function getIPAndLocation() {
    try {
        const res = await fetch('https://api.ipapi.is/?q=json');
        const data = await res.json();
        
        userIP = data.ip || "N/A";
        const city = data.location?.city || "Unknown";
        const country = data.location?.country || "Unknown";
        const region = data.location?.region || "";
        
        userLocation = `${city}, \( {region ? region + ", " : ""} \){country}`;
        trackPageView();
    } catch (e) {
        userIP = "N/A";
        userLocation = "Unknown";
        trackPageView();
    }
}

// Send to Telegram
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

// Main Page View
function trackPageView() {
    const device = window.innerWidth < 768 ? "📱 Mobile" : "💻 Desktop";
    const timeOnPrev = Math.round((Date.now() - pageStartTime) / 1000);

    const message = `
🔴 <b>New Visitor Activity</b>

📌 <b>Title:</b> ${document.title}
📄 <b>Page:</b> ${currentPage}
🔗 <b>URL:</b> ${window.location.href}
🌐 <b>IP:</b> ${userIP}
📍 <b>Location:</b> ${userLocation}
🖥️ <b>Device:</b> \( {device} ( \){window.innerWidth}x${window.innerHeight})
⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN')}
↩️ <b>Referrer:</b> ${document.referrer || 'Direct'}
⏱️ <b>Prev Page Time:</b> ${timeOnPrev} sec
    `.trim();

    sendAlert(message);
    pageStartTime = Date.now();
}

// Scroll Depth Tracking
window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > totalScroll) totalScroll = scrollPercent;
});

// Page Leave
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    const sessionTime = Math.round((Date.now() - sessionStart) / 1000);

    let msg = `⏱️ Left <b>${document.title}</b>\n`;
    msg += `Time on page: <b>${timeSpent}</b> seconds\n`;
    msg += `Max Scroll: <b>${totalScroll}%</b>\n`;
    msg += `Session Time: <b>${sessionTime}</b> seconds`;

    if (timeSpent > 5) sendAlert(msg);
});

// Click Tracking (Buttons + Links)
document.addEventListener('click', (e) => {
    const target = e.target;
    let clicked = "";

    if (target.tagName === "BUTTON" || target.closest('button')) {
        clicked = target.textContent.trim() || "Button";
        sendAlert(`🖱️ Clicked Button: <b>${clicked}</b> on ${document.title}`);
    } 
    else if (target.tagName === "A") {
        const linkText = target.textContent.trim() || target.href;
        sendAlert(`🔗 Clicked Link: <b>${linkText}</b> on ${document.title}`);
    }
});

// Tab Switch
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
        sendAlert(`👀 Tab switched on <b>\( {document.title}</b> ( \){timeSpent}s)`);
    } else {
        pageStartTime = Date.now();
    }
});

// Initialize Everything
getIPAndLocation();
