// test-tracker.js  ← Yeh file banao

const BOT_TOKEN = "8597216892:AAH4S636lc68JIPzuZV67N3ENfVCjxY-Ans"; 
const CHAT_ID = "5727689002"; 

let sessionStart = Date.now();
let currentPage = window.location.pathname;
let pageStartTime = Date.now();

function sendToTelegram(data) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: data,
            parse_mode: 'HTML'
        })
    }).catch(() => {});
}

// Page Load
function trackPageView() {
    const data = `
🟢 <b>New Page View</b>

📄 Page: ${currentPage}
⏰ Time: ${new Date().toLocaleString('en-IN')}
🔗 Full URL: ${window.location.href}
↩️ Referrer: ${document.referrer || 'Direct'}
📱 Device: ${navigator.userAgent}
⏱️ Session Time: ${Math.round((Date.now() - sessionStart)/1000)}s
    `;
    sendToTelegram(data);
}

// Page Exit / Time Spent
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - pageStartTime)/1000);
    if (timeSpent > 3) {  // ignore very short visits
        sendToTelegram(`⏱️ Left ${currentPage} after ${timeSpent} seconds`);
    }
});

// Track navigation between pages (SPA jaisa feel for static)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hostname === window.location.hostname) {
        const timeSpent = Math.round((Date.now() - pageStartTime)/1000);
        sendToTelegram(`➡️ Moving from ${currentPage} → \( {link.pathname} ( \){timeSpent}s)`);
    }
});

// Initialize
trackPageView();

// Page visibility change (tab switch)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const timeSpent = Math.round((Date.now() - pageStartTime)/1000);
        sendToTelegram(`👀 User switched tab on \( {currentPage} ( \){timeSpent}s)`);
    } else {
        pageStartTime = Date.now();
    }
});
