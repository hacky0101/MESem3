// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
let sessionStart = Date.now();
let currentPage = window.location.pathname;
let pageStartTime = Date.now();
let userIP = "Detecting...";
let userLocation = "";

// IP + Location fetch
async function getIPAndLocation() {
  try {
    const res = await fetch('https://api.ipapi.is/?q=json');
    const data = await res.json();
    
    userIP = data.ip || "N/A";
    const city = data.location?.city || "Unknown";
    const country = data.location?.country || "Unknown";
    const region = data.location?.region || "";
    
    userLocation = `${city}, \( {region ? region + ", " : ""} \){country}`;
    
    // Pehli baar location milte hi tracking start
    trackPageView();
  } catch (e) {
    userIP = "Unable to fetch";
    userLocation = "Unknown";
    trackPageView();
  }
}

// Send Alert
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

// Track Page View
function trackPageView() {
  const timeOnPrevPage = Math.round((Date.now() - pageStartTime) / 1000);
  
  const message = `
🔴 <b>New Visitor</b>

📌 <b>Title:</b> ${document.title}
📄 <b>Page:</b> ${currentPage}
🔗 <b>URL:</b> ${window.location.href}
🌐 <b>IP:</b> ${userIP}
📍 <b>Location:</b> ${userLocation}
⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN')}
↩️ <b>Referrer:</b> ${document.referrer || 'Direct'}
⏱️ <b>Prev Page:</b> ${timeOnPrevPage} sec
    `.trim();
  
  sendAlert(message);
  pageStartTime = Date.now();
}

// Page Leave
window.addEventListener('beforeunload', () => {
  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
  if (timeSpent > 5) {
    sendAlert(`⏱️ Left <b>\( {document.title}</b> after <b> \){timeSpent}</b> seconds`);
  }
});

// Navigation Tracking
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.hostname === window.location.hostname) {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    sendAlert(`➡️ <b>${document.title}</b> → \( {link.textContent.trim() || link.pathname} ( \){timeSpent}s)`);
  }
});

// Initialize
getIPAndLocation();

// Tab Switch
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    sendAlert(`👀 Tab switched on <b>\( {document.title}</b> ( \){timeSpent}s)`);
  } else {
    pageStartTime = Date.now();
  }
});
