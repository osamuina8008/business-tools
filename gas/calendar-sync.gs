/**
 * Google Apps Script - カレンダー終日イベント取得
 *
 * 【設定手順】
 * 1. https://script.google.com にアクセス
 * 2. 「新しいプロジェクト」を作成
 * 3. このコードを貼り付けて保存
 * 4. 「デプロイ」→「新しいデプロイ」
 * 5. 種類: ウェブアプリ
 *    実行ユーザー: 自分
 *    アクセスできるユーザー: 全員
 * 6. デプロイ → 承認 → URLをコピー
 * 7. タスクツールの「設定」にURLを貼り付け
 */

function doGet(e) {
  try {
    const cal = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 90); // 90日先まで取得

    const events = cal.getEvents(now, future);

    // 終日イベントのみ（タスク用途）
    const allDay = events.filter(ev => ev.isAllDayEvent());

    const items = allDay.map(ev => ({
      id:          ev.getId(),
      title:       ev.getTitle(),
      date:        Utilities.formatDate(ev.getStartTime(), 'Asia/Tokyo', 'yyyy-MM-dd'),
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
