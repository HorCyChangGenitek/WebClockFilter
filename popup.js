document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('unlock').addEventListener('click', unlock);
  refreshStatus();
});

function unlock() {
  const minutes = parseInt(document.getElementById('duration').value, 10);
  chrome.storage.local.get('config', data => {
    const cfg = data.config || {};
    const expire = Date.now() + minutes * 60 * 1000;
    cfg.tempUnlock = { expire };
    chrome.storage.local.set({ config: cfg }, refreshStatus);
  });
}

function refreshStatus() {
  chrome.storage.local.get('config', data => {
    const cfg = data.config || {};
    const now = Date.now();
    if (cfg.tempUnlock && cfg.tempUnlock.expire > now) {
      const remaining = Math.ceil((cfg.tempUnlock.expire - now) / (60 * 1000));
      document.getElementById('status').textContent = `Unlocked for ${remaining} minutes`;
      document.getElementById('status').style.display = 'block';
      document.getElementById('unlock-form').style.display = 'none';
    } else {
      document.getElementById('status').style.display = 'none';
      document.getElementById('unlock-form').style.display = 'block';
    }
  });
}
