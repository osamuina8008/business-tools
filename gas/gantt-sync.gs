/**
 * Google Apps Script - 製造ガントチャート管理
 *
 * 【スプレッドシートの構成】
 *   シート1: Customers  → 列: id, name, color
 *   シート2: GanttTasks → 列: id, customer_id, item_name, start_date, end_date, status, memo
 *
 * 【設定手順】
 * 1. https://sheets.new でスプレッドシートを新規作成（名前: 製造ガント）
 * 2. https://script.google.com でスプレッドシートに紐づく Apps Script を開く
 *    （スプレッドシートのメニュー: 拡張機能 → Apps Script）
 * 3. このコードを貼り付けて保存
 * 4. 「デプロイ」→「新しいデプロイ」
 *    種類: ウェブアプリ
 *    実行ユーザー: 自分
 *    アクセスできるユーザー: 全員
 * 5. デプロイ → 承認 → URLをコピー
 * 6. ガントチャートツールの「設定」にURLを貼り付け
 */

// ============================================================
// 初期データセットアップ（初回のみ実行）
// スプレッドシートのメニュー: Apps Script → setupInitialData を実行
// ============================================================
function setupInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Customers シート
  let cSheet = ss.getSheetByName('Customers');
  if (!cSheet) {
    cSheet = ss.insertSheet('Customers');
  }
  cSheet.clearContents();
  cSheet.appendRow(['id', 'name', 'color']);
  const customers = [
    [1, 'ジェイテクト',   '#3B82F6'],
    [2, 'ヤンマー',       '#10B981'],
    [3, '大和歯車',       '#F59E0B'],
    [4, '大島精密',       '#EF4444'],
    [5, '前田鐵工所',     '#8B5CF6'],
  ];
  customers.forEach(row => cSheet.appendRow(row));

  // GanttTasks シート
  let gSheet = ss.getSheetByName('GanttTasks');
  if (!gSheet) {
    gSheet = ss.insertSheet('GanttTasks');
  }
  gSheet.clearContents();
  gSheet.appendRow(['id', 'customer_id', 'item_name', 'start_date', 'end_date', 'status', 'memo']);

  // サンプルタスク
  const today = new Date();
  const fmt = d => Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };

  const samples = [
    [1, 1, '図面確認・受注手続き',  fmt(today),           fmt(addDays(today,5)),  'done',        ''],
    [2, 1, '材料手配',              fmt(addDays(today,3)), fmt(addDays(today,10)), 'in_progress', 'SUS304'],
    [3, 1, '機械加工',              fmt(addDays(today,10)),fmt(addDays(today,20)), 'pending',     ''],
    [4, 2, '図面確認・受注手続き',  fmt(today),           fmt(addDays(today,3)),  'done',        ''],
    [5, 2, '材料手配',              fmt(addDays(today,4)), fmt(addDays(today,12)), 'in_progress', 'S45C'],
    [6, 3, '図面確認・受注手続き',  fmt(addDays(today,2)), fmt(addDays(today,7)),  'pending',     ''],
  ];
  samples.forEach(row => gSheet.appendRow(row));

  SpreadsheetApp.getUi().alert('初期データをセットアップしました！');
}

// ============================================================
// Web App エントリポイント
// ============================================================
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'getAll';

  try {
    let result;
    switch (action) {
      case 'getAll':         result = getAllData();               break;
      case 'addCustomer':    result = addCustomer(e.parameter);  break;
      case 'addTask':        result = addTask(e.parameter);      break;
      case 'updateTask':     result = updateTask(e.parameter);   break;
      case 'deleteTask':     result = deleteTask(e.parameter);   break;
      case 'deleteCustomer': result = deleteCustomer(e.parameter); break;
      default:               result = { status: 'error', message: '不明なアクション: ' + action };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// POST も受け付ける（CORS対策でGETのみでも動作するよう全処理をGETで実装）
function doPost(e) { return doGet(e); }

// ============================================================
// 全データ取得
// ============================================================
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const customers = sheetToObjects(ss.getSheetByName('Customers'));
  const tasks     = sheetToObjects(ss.getSheetByName('GanttTasks'));
  return { status: 'ok', customers, tasks };
}

// ============================================================
// 顧客追加
// ============================================================
function addCustomer(params) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName('Customers');
  const rows   = cSheet.getDataRange().getValues();
  const newId  = rows.length; // ヘッダ行込みなのでそのままIDに

  const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6',
                  '#EC4899','#14B8A6','#F97316','#6366F1','#84CC16'];
  const usedColors = rows.slice(1).map(r => r[2]);
  const color = colors.find(c => !usedColors.includes(c)) || colors[newId % colors.length];

  cSheet.appendRow([newId, params.name || '新規顧客', color]);
  return { status: 'ok', id: newId };
}

// ============================================================
// タスク追加
// ============================================================
function addTask(params) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const rows   = gSheet.getDataRange().getValues();
  const newId  = rows.length; // ヘッダ行込み

  gSheet.appendRow([
    newId,
    parseInt(params.customer_id || 1),
    params.item_name  || '新規工程',
    params.start_date || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
    params.end_date   || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
    params.status     || 'pending',
    params.memo       || '',
  ]);
  return { status: 'ok', id: newId };
}

// ============================================================
// タスク更新
// ============================================================
function updateTask(params) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const data   = gSheet.getDataRange().getValues();
  const targetId = parseInt(params.id);

  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === targetId) {
      const row = i + 1;
      if (params.item_name)  gSheet.getRange(row, 3).setValue(params.item_name);
      if (params.start_date) gSheet.getRange(row, 4).setValue(params.start_date);
      if (params.end_date)   gSheet.getRange(row, 5).setValue(params.end_date);
      if (params.status)     gSheet.getRange(row, 6).setValue(params.status);
      if (params.memo !== undefined) gSheet.getRange(row, 7).setValue(params.memo);
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'タスクが見つかりません: ' + targetId };
}

// ============================================================
// タスク削除
// ============================================================
function deleteTask(params) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const data   = gSheet.getDataRange().getValues();
  const targetId = parseInt(params.id);

  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === targetId) {
      gSheet.deleteRow(i + 1);
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'タスクが見つかりません: ' + targetId };
}

// ============================================================
// 顧客削除
// ============================================================
function deleteCustomer(params) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName('Customers');
  const gSheet = ss.getSheetByName('GanttTasks');
  const targetId = parseInt(params.id);

  // 顧客削除
  const cData = cSheet.getDataRange().getValues();
  for (let i = 1; i < cData.length; i++) {
    if (parseInt(cData[i][0]) === targetId) {
      cSheet.deleteRow(i + 1);
      break;
    }
  }
  // 関連タスクも削除（後ろから削除）
  const gData = gSheet.getDataRange().getValues();
  for (let i = gData.length - 1; i >= 1; i--) {
    if (parseInt(gData[i][1]) === targetId) {
      gSheet.deleteRow(i + 1);
    }
  }
  return { status: 'ok' };
}

// ============================================================
// ユーティリティ
// ============================================================
function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
