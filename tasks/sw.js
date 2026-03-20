// Service Worker - カレンダー通知
const DB_NAME  = 'bt-cal-db';
const DB_STORE = 'settings';

// --- IndexedDB helpers ---
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(DB_STORE);
    req.onsuccess  = e => resolve(e.target.result);
    req.onerror    = reject;
  });
}
async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = reject;
  });
}
async function dbPut(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(val, key);
    tx.oncomplete = resolve;
    tx.onerror    = reject;
  });
}

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));

// メインページからのメッセージ受信
self.addEventListener('message', async e => {
  if (e.data?.type === 'SET_GAS_URL') {
    await dbPut('gasUrl', e.data.url);
  }
  if (e.data?.type === 'CHECK_NOW') {
    await checkAndNotify();
  }
});

// Periodic Background Sync（Chrome 80+ / Android Chrome）
self.addEventListener('periodicsync', e => {
  if (e.tag === 'cal-check') e.waitUntil(checkAndNotify());
});

// --- メイン処理 ---
async function checkAndNotify() {
  try {
    const gasUrl = await dbGet('gasUrl');
    if (!gasUrl) return;

    const res  = await fetch(gasUrl);
    const data = await res.json();
    if (data.status !== 'ok') return;

    const today    = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // 終日イベントのみ・今日と明日
    const todayItems    = data.items.filter(i => i.allDay && i.date === today);
    const tomorrowItems = data.items.filter(i => i.allDay && i.date === tomorrow);

    if (todayItems.length > 0) {
      await self.registration.showNotification('📅 今日の予定', {
        body:    todayItems.map(i => i.title).join('\n'),
        tag:     'cal-today',
        renotify: true,
      });
    }
    if (tomorrowItems.length > 0) {
      await self.registration.showNotification('📅 明日の予定', {
        body:    tomorrowItems.map(i => i.title).join('\n'),
        tag:     'cal-tomorrow',
        renotify: true,
      });
    }
  } catch (err) {
    console.warn('SW cal check failed:', err);
  }
}

// 通知クリックでタスク画面を開く
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    const found = cs.find(c => c.url.includes('/tasks/'));
    if (found) return found.focus();
    return clients.openWindow('./');
  }));
});
