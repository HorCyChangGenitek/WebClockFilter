const DEFAULT_CONFIG = {
  mode: 'allow_all', // 'allow_all', 'block_all', 'schedule'
  blacklist: [],
  whitelist: [],
  schedule: {
    days: [0,1,2,3,4,5,6], // 0 Sunday - 6 Saturday
    times: [] // array of {start: 'HH:MM', end: 'HH:MM'}
  },
  tempUnlock: {
    expire: 0
  }
};

let currentConfig = DEFAULT_CONFIG;

function loadConfig() {
  chrome.storage.local.get('config', (data) => {
    currentConfig = Object.assign({}, DEFAULT_CONFIG, data.config || {});
  });
}

function isWithinSchedule() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const schedule = currentConfig.schedule;
  if (!schedule.days.includes(day)) return false;
  for (const range of schedule.times) {
    const [startH, startM] = range.start.split(':').map(Number);
    const [endH, endM] = range.end.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    if (minutes >= start && minutes <= end) {
      return true;
    }
  }
  return false;
}

function shouldBlock(url) {
  const now = Date.now();
  if (currentConfig.tempUnlock.expire > now) {
    return false;
  }
  const host = new URL(url).hostname;
  const { mode, blacklist, whitelist } = currentConfig;
  switch (mode) {
    case 'allow_all':
      return blacklist.some(domain => host.includes(domain));
    case 'block_all':
      return !whitelist.some(domain => host.includes(domain));
    case 'schedule':
      if (!blacklist.some(domain => host.includes(domain))) return false;
      return isWithinSchedule();
    default:
      return false;
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    if (shouldBlock(details.url)) {
      return { cancel: true };
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

loadConfig();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.config) {
    currentConfig = Object.assign({}, DEFAULT_CONFIG, changes.config.newValue);
  }
});
