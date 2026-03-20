/**
 * Google Apps Script - 製造ガントチャート管理
 *
 * 【スプレッドシートの構成】
 *   シート1: Customers  → 列: id, name, color
 *   シート2: GanttTasks → 列: id, customer_id, type, variety, item_name, start_date, end_date, status, memo
 *
 * 【設定手順】
 * 1. https://sheets.new でスプレッドシートを新規作成（名前: 製造ガント）
 * 2. スプレッドシートのメニュー: 拡張機能 → Apps Script
 * 3. このコードを貼り付けて保存
 * 4. 関数を「setupInitialData」に切り替えて「実行」→ 初期データが作成されます
 * 5. 「デプロイ」→「新しいデプロイ」
 *    種類: ウェブアプリ
 *    実行ユーザー: 自分
 *    アクセスできるユーザー: 全員
 * 6. デプロイ → 承認 → URLをコピー
 * 7. ガントチャートツールの「⚙ GAS設定」にURLを貼り付け
 */

// ============================================================
// 初期データセットアップ（初回のみ実行）
// ============================================================
function setupInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Customers シート
  let cSheet = ss.getSheetByName('Customers');
  if (!cSheet) cSheet = ss.insertSheet('Customers');
  cSheet.clearContents();
  cSheet.appendRow(['id', 'name', 'color']);
  [
    [1, 'ジェイテクト', '#3B82F6'],
    [2, 'ヤンマー',     '#10B981'],
    [3, '大和歯車',     '#F59E0B'],
    [4, '大島精密',     '#EF4444'],
    [5, '前田鐵工所',   '#8B5CF6'],
  ].forEach(r => cSheet.appendRow(r));

  // GanttTasks シート
  let gSheet = ss.getSheetByName('GanttTasks');
  if (!gSheet) gSheet = ss.insertSheet('GanttTasks');
  gSheet.clearContents();
  gSheet.appendRow(['id', 'customer_id', 'type', 'variety', 'item_name', 'start_date', 'end_date', 'status', 'memo']);

  // サンプルタスク
  const fmt = d => Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
  const add = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
  const t   = new Date();
  [
    [1, 1, '旋削', 'シャフトA',   '図面確認・受注手続き', fmt(t),        fmt(add(t,4)),  'done',        ''],
    [2, 1, '旋削', 'シャフトA',   '材料手配',              fmt(add(t,3)), fmt(add(t,9)),  'in_progress', 'SUS304'],
    [3, 1, '旋削', 'シャフトA',   '機械加工',              fmt(add(t,9)), fmt(add(t,18)), 'pending',     ''],
    [4, 1, '研削', 'フランジB',   '材料手配',              fmt(add(t,1)), fmt(add(t,7)),  'in_progress', 'S45C'],
    [5, 1, '研削', 'フランジB',   '研削加工',              fmt(add(t,8)), fmt(add(t,16)), 'pending',     ''],
    [6, 2, '旋削', 'ギアC',       '図面確認・受注手続き',  fmt(t),        fmt(add(t,3)),  'done',        ''],
    [7, 2, '旋削', 'ギアC',       '材料手配',              fmt(add(t,4)), fmt(add(t,11)), 'in_progress', 'SCM440'],
    [8, 3, 'フライス', 'ブラケットD', '図面確認',           fmt(add(t,2)), fmt(add(t,6)),  'pending',     ''],
  ].forEach(r => gSheet.appendRow(r));

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
      case 'getAll':         result = getAllData();                break;
      case 'addCustomer':    result = addCustomer(e.parameter);   break;
      case 'addTask':        result = addTask(e.parameter);       break;
      case 'updateTask':     result = updateTask(e.parameter);    break;
      case 'deleteTask':     result = deleteTask(e.parameter);    break;
      case 'deleteCustomer': result = deleteCustomer(e.parameter);break;
      default:               result = { status:'error', message:'不明なアクション: ' + action };
    }
    return jsonResponse(result);
  } catch(err) {
    return jsonResponse({ status:'error', message: err.toString() });
  }
}
function doPost(e) { return doGet(e); }

// ============================================================
// 全データ取得
// ============================================================
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    status:    'ok',
    customers: sheetToObjects(ss.getSheetByName('Customers')),
    tasks:     sheetToObjects(ss.getSheetByName('GanttTasks')),
  };
}

// ============================================================
// 顧客追加
// ============================================================
function addCustomer(p) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName('Customers');
  const rows   = cSheet.getDataRange().getValues();
  const newId  = rows.length;
  const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1','#84CC16'];
  const used   = rows.slice(1).map(r => r[2]);
  const color  = COLORS.find(c => !used.includes(c)) || COLORS[newId % COLORS.length];
  cSheet.appendRow([newId, p.name || '新規顧客', color]);
  return { status:'ok', id: newId };
}

// ============================================================
// タスク追加
// ============================================================
function addTask(p) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const rows   = gSheet.getDataRange().getValues();
  const newId  = rows.length;
  gSheet.appendRow([
    newId,
    parseInt(p.customer_id || 1),
    p.type       || '',
    p.variety    || '',
    p.item_name  || '新規工程',
    p.start_date || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
    p.end_date   || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
    p.status     || 'pending',
    p.memo       || '',
  ]);
  return { status:'ok', id: newId };
}

// ============================================================
// タスク更新
// ============================================================
function updateTask(p) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const data   = gSheet.getDataRange().getValues();
  const targetId = parseInt(p.id);
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === targetId) {
      const row = i + 1;
      // 列順: id(1), customer_id(2), type(3), variety(4), item_name(5), start_date(6), end_date(7), status(8), memo(9)
      if (p.type       !== undefined) gSheet.getRange(row, 3).setValue(p.type);
      if (p.variety    !== undefined) gSheet.getRange(row, 4).setValue(p.variety);
      if (p.item_name  !== undefined) gSheet.getRange(row, 5).setValue(p.item_name);
      if (p.start_date !== undefined) gSheet.getRange(row, 6).setValue(p.start_date);
      if (p.end_date   !== undefined) gSheet.getRange(row, 7).setValue(p.end_date);
      if (p.status     !== undefined) gSheet.getRange(row, 8).setValue(p.status);
      if (p.memo       !== undefined) gSheet.getRange(row, 9).setValue(p.memo);
      return { status:'ok' };
    }
  }
  return { status:'error', message:'タスクが見つかりません: ' + targetId };
}

// ============================================================
// タスク削除
// ============================================================
function deleteTask(p) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const gSheet = ss.getSheetByName('GanttTasks');
  const data   = gSheet.getDataRange().getValues();
  const targetId = parseInt(p.id);
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === targetId) { gSheet.deleteRow(i+1); return { status:'ok' }; }
  }
  return { status:'error', message:'タスクが見つかりません: ' + targetId };
}

// ============================================================
// 顧客削除（関連タスクも削除）
// ============================================================
function deleteCustomer(p) {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const cSheet = ss.getSheetByName('Customers');
  const gSheet = ss.getSheetByName('GanttTasks');
  const targetId = parseInt(p.id);
  const cData = cSheet.getDataRange().getValues();
  for (let i = 1; i < cData.length; i++) {
    if (parseInt(cData[i][0]) === targetId) { cSheet.deleteRow(i+1); break; }
  }
  const gData = gSheet.getDataRange().getValues();
  for (let i = gData.length-1; i >= 1; i--) {
    if (parseInt(gData[i][1]) === targetId) gSheet.deleteRow(i+1);
  }
  return { status:'ok' };
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
