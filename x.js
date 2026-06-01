

const content = document.getElementById('content');

// ?? Video cards ??
function getVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const videoLines = document.getElementById('DATA').value.trim().split('\n');
videoLines.forEach(line => {
  line = line.trim();
  if (!line) return;
  const urlMatch = line.match(/https?:\/\/[^\s]+/);
  if (!urlMatch) return;
  const url = urlMatch[0];
  const videoId = getVideoId(url);
  if (!videoId) return;
  const title = line.replace(url, '').replace(/-\s*$/, '').trim();
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const encoded = encodeURIComponent(url);
  
  content.innerHTML += `
      <div class="item" data-type="video" data-url="${url}">
        <div class="main-content">
          <div class="item-header">
            <img src="${thumb}" alt="Thumbnail">
            <div class="item-title">${title}</div>
          </div>
          <div class="actions">
            <button class="btn watch" onclick="window.location.href='dkplayer.html?url=${encoded}'">Watch</button>
            <button class="btn listen">Listen</button>
            <button class="btn share">Share</button>
          </div>
        </div>
        <div class="side-actions">
          <button class="btn download">Download</button>
          <button class="btn bookmark">Bookmark</button>
        </div>
      </div>`;
});

// ?? PDF cards ??
const pdfLines = document.getElementById('PDF_DATA').value.trim().split('\n');
pdfLines.forEach(line => {
  line = line.trim();
  if (!line) return;
  const urlMatch = line.match(/https?:\/\/[^\s]+/);
  if (!urlMatch) return;
  const url = urlMatch[0];
  const title = line.replace(url, '').replace(/-\s*$/, '').trim();
  
  content.innerHTML += `
      <div class="item" data-type="pdf" data-url="${url}">
        <div class="main-content">
          <div class="item-header">
            <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" alt="PDF Icon">
            <div class="item-title">${title}</div>
          </div>
          <div class="actions">
            <button class="btn read" onclick="window.open('${url}', '_blank')">Read</button>
            <button class="btn share">Share</button>
          </div>
        </div>
      </div>`;
});

// ?? Tab filtering ??
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const type = tab.getAttribute('data-type');
    document.querySelectorAll('.item').forEach(item => {
      item.style.display = type === 'all' ? 'flex' : item.getAttribute('data-type') === type ? 'flex' : 'none';
    });
  });
});

// ?? Button events (video + pdf dono ke liye) ??
function attachEvents() {
  document.querySelectorAll('.item').forEach(item => {
    const title = item.querySelector('.item-title').textContent;
    const url = item.getAttribute('data-url');
    
    item.querySelector('.download')?.addEventListener('click', () => {
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = title.replace(/[^a-zA-Z0-9]/g, '_') + (item.getAttribute('data-type') === 'video' ? '.mp4' : '.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else { alert('Download URL not available.'); }
    });
    
    item.querySelector('.listen')?.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(title);
        utterance.lang = 'hi-IN';
        speechSynthesis.speak(utterance);
      } else { alert('Text-to-speech not supported.'); }
    });
    
    item.querySelector('.bookmark')?.addEventListener('click', () => {
      const isMac = navigator.userAgent.toLowerCase().includes('mac');
      alert(`Press ${isMac ? 'Cmd' : 'Ctrl'}+D to bookmark this page.`);
    });
    
    item.querySelector('.share')?.addEventListener('click', async () => {
      if (navigator.share && url) {
        try { await navigator.share({ title, url }); }
        catch (e) { console.error(e); }
      } else if (url) {
        navigator.clipboard.writeText(url).then(() => alert('URL copied!')).catch(() => alert('Failed to copy.'));
      } else { alert('Share URL not available.'); }
    });
  });
}

attachEvents(); 

