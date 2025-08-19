document.addEventListener('DOMContentLoaded', init);

function init() {
  document.getElementById('add-time').addEventListener('click', addTimeRange);
  document.getElementById('save').addEventListener('click', saveOptions);
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  modeRadios.forEach(r => r.addEventListener('change', toggleSchedule));
  loadOptions();
}

function addTimeRange(range) {
  const container = document.getElementById('times');
  const div = document.createElement('div');
  const start = document.createElement('input');
  start.type = 'time';
  start.step = 300; // 5 minutes
  const end = document.createElement('input');
  end.type = 'time';
  end.step = 300;
  if (range) {
    start.value = range.start;
    end.value = range.end;
  }
  div.appendChild(start);
  div.appendChild(document.createTextNode(' - '));
  div.appendChild(end);
  container.appendChild(div);
}

function toggleSchedule() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  document.getElementById('schedule-section').style.display = mode === 'schedule' ? 'block' : 'none';
}

function loadOptions() {
  chrome.storage.local.get('config', (data) => {
    const cfg = data.config || {};
    document.querySelector(`input[name="mode"][value="${cfg.mode || 'allow_all'}"]`).checked = true;
    document.getElementById('blacklist').value = (cfg.blacklist || []).join('\n');
    document.getElementById('whitelist').value = (cfg.whitelist || []).join('\n');
    const days = cfg.schedule ? cfg.schedule.days : [0,1,2,3,4,5,6];
    document.querySelectorAll('.day').forEach(cb => {
      cb.checked = days.includes(parseInt(cb.value));
    });
    const times = cfg.schedule ? cfg.schedule.times : [];
    times.forEach(addTimeRange);
    toggleSchedule();
  });
}

function saveOptions() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const blacklist = document.getElementById('blacklist').value.split(/\n+/).filter(Boolean);
  const whitelist = document.getElementById('whitelist').value.split(/\n+/).filter(Boolean);
  const days = Array.from(document.querySelectorAll('.day:checked')).map(cb => parseInt(cb.value));
  const times = Array.from(document.getElementById('times').children).map(div => {
    const inputs = div.querySelectorAll('input');
    return { start: inputs[0].value, end: inputs[1].value };
  }).filter(r => r.start && r.end);
  const config = {
    mode,
    blacklist,
    whitelist,
    schedule: { days, times },
    tempUnlock: { expire: 0 }
  };
  chrome.storage.local.set({ config });
  alert('Options saved');
}
