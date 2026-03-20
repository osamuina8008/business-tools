/**
 * Google Apps Script - カレンダーイベント取得（全イベント対応）
 *
 * 【設定手順】
 * ※ onextec.inagaki@gmail.com アカウントで実行すること
 * 1. https://script.google.com にアクセス（対象アカウントでログイン）
 * 2. 「新しいプロジェクト」を作成
 * 3. このコードを貼り付けて保存
 * 4. 「デプロイ」→「新しいデプロイ」
 * 5. 種類: ウェブアプリ
 *    実行ユーザー: 自分
 *    アクセスできるユーザー: 全員
 * 6. デプロイ → 承認 → URLをコピー
 * 7. タスクツールの「⚙ 設定」にURLを貼り付け
 */

function doGet(e) {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30); // 30日先まで取得

    const events = cal.getEvents(now, future);

    // 全イベント（タイトルなしは除外）
    const items = events
      .filter(ev => ev.getTitle().trim() !== '')
      .map(ev => ({
        id:          ev.getId(),
        title:       ev.getTitle(),
        date:        Utilities.formatDate(ev.getStartTime(), 'Asia/Tokyo', 'yyyy-MM-dd'),
        time:        ev.isAllDayEvent() ? '' : Utilities.formatDate(ev.getStartTime(), 'Asia/Tokyo', 'HH:mm'),
        allDay:      ev.isAllDayEvent(),
        description: ev.getDescription() || '',
        location:    ev.getLocation() || '',
      }));

    const json = JSON.stringify({ status: 'ok', items: items, count: items.length });
    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const json = JSON.stringify({ status: 'error', message: err.toString() });
    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  }
}
