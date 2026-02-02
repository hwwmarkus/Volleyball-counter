(function(){
  const els = {
    scoreLeft: document.getElementById('scoreLeft'),
    scoreRight: document.getElementById('scoreRight'),
    teamLeft: document.getElementById('teamLeft'),
    teamRight: document.getElementById('teamRight'),
    incLeft: document.getElementById('incLeft'),
    decLeft: document.getElementById('decLeft'),
    incRight: document.getElementById('incRight'),
    decRight: document.getElementById('decRight'),
    resetBtn: document.getElementById('resetBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    keyboardToggleBtn: undefined,
    setsLeft: document.getElementById('setsLeft'),
    setsRight: document.getElementById('setsRight'),
    currentSet: document.getElementById('currentSet'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    finalScore: document.getElementById('finalScore'),
  };

  const BASE_TARGET = 25; // base points to win a set
  const WIN_BY = 2;       // win-by rule once at or past 24-24
  const DEUCE_AT = 24;    // deuce threshold
  const defaultState = { left: 0, right: 0, teamLeft: 'Home', teamRight: 'Away', setsLeft: 0, setsRight: 0, history: [], keyboardEnabled: false };
  const state = Object.assign({}, defaultState, loadState() || {});

  function clamp(n){ return Math.max(0, n|0); }
  function render(){
    els.scoreLeft.textContent = clamp(state.left);
    els.scoreRight.textContent = clamp(state.right);
    els.teamLeft.value = state.teamLeft;
    els.teamRight.value = state.teamRight;
    els.decLeft.disabled = state.left <= 0;
    els.decRight.disabled = state.right <= 0;
    els.setsLeft.textContent = state.setsLeft|0;
    els.setsRight.textContent = state.setsRight|0;
    els.currentSet.textContent = (state.setsLeft + state.setsRight + 1);
    const isDeuce = (state.left >= DEUCE_AT && state.right >= DEUCE_AT && state.left === state.right);
    const flag = document.getElementById('deuceFlag');
    if (flag) flag.style.display = isDeuce ? 'inline' : 'none';

    // Render history (newest first)
    if (els.historyList){
      const items = (state.history || []).slice().reverse().map(entry => {
        const time = new Date(entry.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const badgeClass = entry.type === 'inc' ? 'plus' : entry.type === 'dec' ? 'minus' : entry.type === 'set' ? 'set' : 'reset';
        const badgeLabel = entry.type === 'inc' ? '+1' : entry.type === 'dec' ? '-1' : entry.type === 'set' ? 'Set' : 'Reset';
        const scoreLine = `${state.teamLeft} ${entry.left}–${entry.right} ${state.teamRight}`;
        return `<li><span class="badge ${badgeClass}">${badgeLabel}</span><span>${entry.msg || ''}</span><span>${scoreLine}</span><span>${time}</span></li>`;
      }).join('');
      els.historyList.innerHTML = items || '<li style="justify-content:center;color:#94a3b8">No history yet</li>';
    }
    // Render final score (sets summary)
    if (els.finalScore){
      els.finalScore.textContent = `${state.teamLeft} ${state.setsLeft|0}–${state.setsRight|0} ${state.teamRight}`;
    }
    // Keyboard disabled by default; no toggle UI
  }
  function saveState(){
    const MAX_HISTORY = 100;
    const data = { left: clamp(state.left), right: clamp(state.right), teamLeft: state.teamLeft, teamRight: state.teamRight, setsLeft: state.setsLeft|0, setsRight: state.setsRight|0, history: (state.history||[]).slice(-(MAX_HISTORY)) };
    try { localStorage.setItem('vb-scoreboard', JSON.stringify(data)); } catch {}
  }
  function loadState(){
    try {
      const raw = localStorage.getItem('vb-scoreboard');
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) return null;
      // Backward compatibility defaults
      parsed.setsLeft = parsed.setsLeft ?? 0;
      parsed.setsRight = parsed.setsRight ?? 0;
      parsed.history = Array.isArray(parsed.history) ? parsed.history : [];
      parsed.keyboardEnabled = false; // always disabled
      return parsed;
    } catch { return null; }
  }

  function awardSet(side){
    const key = side === 'left' ? 'setsLeft' : 'setsRight';
    state[key] = (state[key]|0) + 1;
    logEvent('set', `${side === 'left' ? state.teamLeft : state.teamRight} won set ${state.setsLeft + state.setsRight}`);
    state.left = 0;
    state.right = 0;
  }
  function other(side){ return side === 'left' ? 'right' : 'left'; }
  function maybeAwardSet(side){
    const my = (state[side]|0);
    const opp = (state[other(side)]|0);
    const lead = my - opp;
    if (my >= BASE_TARGET && lead >= WIN_BY){
      awardSet(side);
    }
  }
  function inc(side){
    state[side] = (state[side]|0) + 1;
    logEvent('inc', `${side === 'left' ? state.teamLeft : state.teamRight} +1`);
    maybeAwardSet(side);
    render();
    saveState();
  }
  function dec(side){ state[side] = clamp(state[side] - 1); logEvent('dec', `${side === 'left' ? state.teamLeft : state.teamRight} -1`); render(); saveState(); }
  function reset(){
    state.left = 0;
    state.right = 0;
    state.setsLeft = 0;
    state.setsRight = 0;
    logEvent('reset', 'Match reset to 0–0, Set 1');
    render();
    saveState();
  }

  function logEvent(type, msg){
    const entry = { t: Date.now(), type, msg, left: clamp(state.left), right: clamp(state.right) };
    state.history = (state.history || []).concat(entry);
  }

  // UI events
  els.incLeft.addEventListener('click', () => inc('left'));
  els.decLeft.addEventListener('click', () => dec('left'));
  els.incRight.addEventListener('click', () => inc('right'));
  els.decRight.addEventListener('click', () => dec('right'));
  els.resetBtn.addEventListener('click', reset);

  // Team name editing
  function handleTeamEdit(el, key){
    const update = () => { state[key] = (el.value || '').trim() || (key === 'teamLeft' ? 'Home' : 'Away'); saveState(); render(); };
    el.addEventListener('input', update);
    el.addEventListener('blur', update);
  }
    // Clear history
    els.clearHistoryBtn?.addEventListener('click', () => { state.history = []; saveState(); render(); });
  handleTeamEdit(els.teamLeft, 'teamLeft');
  handleTeamEdit(els.teamRight, 'teamRight');

  // Fullscreen toggle
  els.fullscreenBtn.addEventListener('click', () => toggleFullscreen());
  function toggleFullscreen(){
    const de = document.documentElement;
    if (!document.fullscreenElement){ de.requestFullscreen?.(); }
    else { document.exitFullscreen?.(); }
  }

  // Keyboard shortcuts
  const Key = { A: 'A', Z: 'Z', K: 'K', M: 'M', R: 'R', F: 'F' };
  document.addEventListener('keydown', (e) => {
    // Enter in inputs: blur to dismiss mobile keyboard
    if (document.activeElement === els.teamLeft || document.activeElement === els.teamRight){
      if (e.key === 'Enter'){ document.activeElement.blur(); e.preventDefault(); }
      return;
    }
    // Respect keyboard enabled toggle
    if (!state.keyboardEnabled) return;
    const key = e.key.toUpperCase();
    switch(key){
      case Key.A: inc('left'); break;
      case Key.Z: dec('left'); break;
      case Key.K: inc('right'); break;
      case Key.M: dec('right'); break;
      case Key.R: reset(); break;
      case Key.F: toggleFullscreen(); break;
      default: break;
    }
  });
  // No keyboard toggle UI

  render();
})();
