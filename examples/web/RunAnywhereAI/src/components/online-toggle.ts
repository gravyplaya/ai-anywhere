import { isOnline, setOnline, onOnlineModeChange } from '../services/online-mode';

let toggleEl: HTMLElement | null = null;
let pillEl: HTMLElement | null = null;

export function createOnlineToggle(): HTMLElement {
  toggleEl = document.createElement('div');
  toggleEl.className = 'online-toggle-wrapper';

  const online = isOnline();

  toggleEl.innerHTML = `
    <button class="online-toggle-pill ${online ? 'active' : ''}" id="global-online-toggle" title="Toggle Online Mode">
      <span class="online-toggle-dot ${online ? 'online' : 'offline'}"></span>
      <span class="online-toggle-label">${online ? 'Online' : 'Offline'}</span>
      <span class="online-toggle-switch">
        <span class="online-toggle-knob"></span>
      </span>
    </button>
  `;

  pillEl = toggleEl.querySelector('#global-online-toggle') as HTMLElement;

  pillEl.addEventListener('click', () => {
    setOnline(!isOnline());
  });

  onOnlineModeChange((online) => updateUI(online));

  return toggleEl;
}

function updateUI(online: boolean): void {
  if (!toggleEl || !pillEl) return;

  pillEl.classList.toggle('active', online);
  pillEl.querySelector('.online-toggle-dot')!.className = `online-toggle-dot ${online ? 'online' : 'offline'}`;
  pillEl.querySelector('.online-toggle-label')!.textContent = online ? 'Online' : 'Offline';
}
