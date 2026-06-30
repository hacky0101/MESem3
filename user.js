// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
// tracker.js - Fixed Version
// tracker.js - Final Fixed Version
// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 
// user.js



let currentPage = window.location.pathname;
let pageStartTime = Date.now();
let userIP = "Detecting...";
let userLocation = "Detecting...";

// Get IP & Location
async function getIPAndLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    
    userIP = data.ip || "N/A";
    
    userLocation = [
      data.city,
      data.region,
      data.country_name
    ].filter(Boolean).join(", ");
    
    trackPageView();
  } catch (err) {
    console.error(err);
    userIP = "Unknown";
    userLocation = "Unknown";
    trackPageView();
  }
}

// Send Telegram Message
function sendAlert(message) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML"
    })
  }).catch(console.error);
}

// Page Visit
function trackPageView() {
  const message = `
🔴 <b>New Visitor</b>

📌 <b>Title:</b> ${document.title}
📄 <b>Page:</b> ${currentPage}
🔗 <b>URL:</b> ${window.location.href}
📱 Device: ${navigator.userAgent}
🌐 <b>IP:</b> ${userIP}
📍 <b>Location:</b> ${userLocation}
⏰ <b>Time:</b> ${new Date().toLocaleString("en-IN")}
↩️ <b>Referrer:</b> ${document.referrer || "Direct"}
  `.trim();
  
  sendAlert(message);
}

// Leave Page
window.addEventListener("beforeunload", () => {
  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
  
  if (timeSpent > 5) {
    sendAlert(
      `⏱️ Left <b>${document.title}</b> after <b>${timeSpent}</b> seconds`
    );
  }
});

// Internal Navigation
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  
  if (link && link.hostname === location.hostname) {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    
    sendAlert(
      `➡️ <b>${document.title}</b> → ${link.textContent.trim() || link.pathname} (${timeSpent}s)`
    );
  }
});

// Tab Switch
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    
    sendAlert(
      `👀 Tab switched on <b>${document.title}</b> (${timeSpent}s)`
    );
  } else {
    pageStartTime = Date.now();
  }
});

// Start
getIPAndLocation();

