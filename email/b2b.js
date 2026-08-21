/* BtoB メール作成（営業 / 実務）共通エンジン */
(function (global) {
  'use strict';

  const THEMES = {
    sales: {
      title: '営業メール',
      subtitle: '訪問・案内・フォローなど、関係を進めるメール',
      otherHref: '../ops/index.html',
      otherLabel: '実務メール →',
      badge: 'bg-blue-100 text-blue-700',
      sitOn: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
      sitOff: 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50',
      accentText: 'text-blue-700',
      btn: 'bg-blue-600 hover:bg-blue-700',
      btnGhost: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700',
      focus: 'focus:ring-blue-300',
    },
    ops: {
      title: '実務メール',
      subtitle: '確認・回答・不具合など、案件を回すメール',
      otherHref: '../sales/index.html',
      otherLabel: '営業メール →',
      badge: 'bg-amber-100 text-amber-800',
      sitOn: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
      sitOff: 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50',
      accentText: 'text-amber-800',
      btn: 'bg-amber-600 hover:bg-amber-700',
      btnGhost: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800',
      focus: 'focus:ring-amber-300',
    },
  };

  const SALES = [
    {
      id: 'visit', name: '訪問アポ', emoji: '📅',
      hint: '工場・事務所への訪問依頼',
      notePlaceholder: '例：\n来週月曜13時か水曜15時\n熱処理の内製化の件\n工場を見学したい',
      fields: [
        { id: 'slots', label: '候補日時', type: 'text', placeholder: '来週月13時 / 水15時' },
        { id: 'duration', label: '所要', type: 'select', options: ['30分', '1時間', '1時間半', '2時間'], value: '1時間' },
        { id: 'place', label: '場所', type: 'select', options: ['先方へ訪問', '自社へお越しいただく', 'オンライン'], value: '先方へ訪問' },
        { id: 'purpose', label: '目的', type: 'text', placeholder: '近況交換、設備見学 など' },
      ],
    },
    {
      id: 'hearing', name: '要件を聞く', emoji: '❓',
      hint: '図面・材質・ロットなどのヒアリング',
      notePlaceholder: '例：\n材質とロット数を知りたい\n熱処理仕様の希望有無\n希望納期',
      fields: [
        { id: 'topics', label: '聞きたい項目', type: 'text', placeholder: '材質、ロット、熱処理仕様、納期' },
        { id: 'deadline', label: '回答希望日', type: 'text', placeholder: '今週末まで など' },
      ],
    },
    {
      id: 'event', name: '行事案内', emoji: '🎪',
      hint: '展示会・勉強会・工場見学会',
      notePlaceholder: '例：\n対象は購買・生産技術の方\n駐車場あり\n当日資料を配布',
      fields: [
        { id: 'eventName', label: '行事名', type: 'text', placeholder: '工場見学会、展示会 など' },
        { id: 'when', label: '日時', type: 'text', placeholder: '来週金曜14時〜16時' },
        { id: 'where', label: '場所', type: 'text', placeholder: '当社工場 / 展示会場' },
        { id: 'rsvp', label: '出欠期限', type: 'text', placeholder: '今週末まで' },
      ],
    },
    {
      id: 'thanks', name: 'お礼', emoji: '🙏',
      hint: '訪問後・紹介後のお礼',
      notePlaceholder: '例：\n工場を見せていただいた\n来週見積をお送りする',
      fields: [
        { id: 'when', label: '訪問・面談日', type: 'text', placeholder: '先日 / 3月10日' },
        { id: 'point', label: 'お礼のポイント', type: 'text', placeholder: '工場見学、ご紹介 など' },
      ],
    },
    {
      id: 'follow', name: 'フォロー', emoji: '🔁',
      hint: '提案後の進捗確認',
      notePlaceholder: '例：\n見積の社内検討状況\n追加で知りたい仕様',
      fields: [
        { id: 'prev', label: '前回の接点', type: 'text', placeholder: '先日の提案、見積送付 など' },
        { id: 'ask', label: '確認したいこと', type: 'text', placeholder: 'ご検討状況' },
      ],
    },
    {
      id: 'quote', name: '見積・資料送付', emoji: '📎',
      hint: '見積・カタログ・仕様書の送付',
      notePlaceholder: '例：\n数量100個の単価\n納期は受注後3週間\n添付は見積PDF',
      fields: [
        { id: 'what', label: '送付内容', type: 'text', placeholder: 'お見積、カタログ、仕様書' },
        { id: 'valid', label: '有効期限', type: 'text', placeholder: '2週間（省略可）' },
      ],
    },
  ];

  const OPS = [
    {
      id: 'confirm', name: '確認', emoji: '✅',
      hint: '仕様・納期・図面・在庫の確認',
      notePlaceholder: '例：\n図面Rev.Cで進めてよいか\n納期8月末で固定か',
      fields: [
        { id: 'target', label: '確認対象', type: 'text', placeholder: '図面Rev、仕様、在庫、納期' },
        { id: 'deadline', label: '回答期限', type: 'text', placeholder: '明日まで など' },
      ],
    },
    {
      id: 'request-reply', name: '要請事項に対して回答', emoji: '📋',
      hint: '先方の依頼リストに項目ごと返答',
      notePlaceholder: '例：\n1. 納期8月末 → 可能\n2. 焼入れ HRC58-62 → 可能\n3. 溝深さ変更 → 来週中に再回答\n4. 特急割増なし → 不可（特急は+15%）',
      fields: [
        { id: 'reqDate', label: '元の要請日', type: 'text', placeholder: '本日 / 3月12日付' },
        { id: 'deadline', label: '残件の回答予定（省略可）', type: 'text', placeholder: '来週中に再回答 など' },
        { id: 'format', label: '回答の出し方', type: 'select', options: ['項目ごと', '一括'], value: '項目ごと' },
        { id: 'result', label: '結果の傾向', type: 'select', options: ['すべて可', '一部条件付き', '一部不可'], value: '一部条件付き' },
      ],
    },
    {
      id: 'issue', name: '不具合連絡', emoji: '⚠️',
      hint: '品質・納期遅れ・誤出荷などの連絡',
      notePlaceholder: '例：\nロットA-231 焼入れ硬さ不足\n暫定は再熱処理\n本対策は来週中に報告',
      fields: [
        { id: 'level', label: '重要度', type: 'select', options: ['情報', '相談', '至急'], value: '相談' },
        { id: 'lot', label: '対象（ロット・品番など）', type: 'text', placeholder: '品番 / ロット' },
        { id: 'impact', label: '影響', type: 'text', placeholder: '出荷停止、再処理 など' },
        { id: 'temp', label: '暫定策', type: 'text', placeholder: '再熱処理、代替品 など' },
      ],
    },
    {
      id: 'progress', name: '進捗報告', emoji: '📈',
      hint: '加工中・熱処理中の途中報告',
      notePlaceholder: '例：\n本日検査完了予定\n問題なければ金曜出荷',
      fields: [
        { id: 'status', label: '現状', type: 'text', placeholder: '熱処理中、検査待ち など' },
        { id: 'next', label: '次工程', type: 'text', placeholder: '検査 → 出荷' },
        { id: 'delay', label: '遅れの有無', type: 'select', options: ['遅れなし', '遅れあり（相談）'], value: '遅れなし' },
      ],
    },
    {
      id: 'request', name: '依頼・督促', emoji: '📨',
      hint: '図面・承認・発注の依頼や催促',
      notePlaceholder: '例：\nRev.Cの承認が欲しい\nこれがないと着手できない',
      fields: [
        { id: 'what', label: '依頼内容', type: 'text', placeholder: '図面、承認、発注書' },
        { id: 'by', label: '期限', type: 'text', placeholder: '今週金曜まで' },
      ],
    },
    {
      id: 'schedule', name: '納期変更', emoji: '🗓️',
      hint: '前倒し・延期の相談',
      notePlaceholder: '例：\n前工程の遅れ\n代替日程は来週水曜',
      fields: [
        { id: 'old', label: '当初納期', type: 'text', placeholder: '8月28日' },
        { id: 'neu', label: '希望・変更後', type: 'text', placeholder: '9月4日' },
        { id: 'reason', label: '理由', type: 'text', placeholder: '前工程遅れ、特急対応 など' },
      ],
    },
    {
      id: 'decline', name: 'お断り', emoji: '🙇',
      hint: '今回は見送りと伝える',
      notePlaceholder: '例：\n炉の空きがなく今期は難しい\n来期であれば相談可',
      fields: [
        { id: 'style', label: '理由の出し方', type: 'select', options: ['簡潔', '丁寧に事情を添える'], value: '丁寧に事情を添える' },
      ],
    },
  ];

  const BIZ_TERMS = {
    '市況確認': '昨今の市場動向についてのご意見交換',
    '市況意見交換': '昨今の市場動向についての情報交換',
    '近況意見交換': '最近のご状況についての情報交換',
    '近況確認': '最近のご状況についてのご確認',
    '納期確認': '納期についてのご確認',
    '価格確認': '価格についてのご確認',
    '在庫確認': '在庫状況のご確認',
    '見積': 'お見積り',
  };
  const LABEL_KEYS = ['日時', '場所', '要件', '内容', '目的', '時間', '人数', '参加者', '議題', '件名', '備考'];

  let mode = 'sales';
  let theme = THEMES.sales;
  let situations = SALES;
  let sitId = 'visit';
  let fieldCache = {};
  let root = null;
  let generatedSubject = '';
  let generatedBody = '';
  let calendarDates = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function val(id) { const el = $(id); return el ? el.value : ''; }
  function trim(s) { return String(s || '').trim(); }

  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function fmtDate(d) {
    const dw = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}月${d.getDate()}日（${dw[d.getDay()]}）`;
  }
  function convertRelativeDates(text) {
    if (!text) return '';
    const today = new Date();
    const dowMap = { '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6, '日': 0 };
    let s = String(text);
    s = s.replace(/明明後日/g, fmtDate(addDays(today, 3)));
    s = s.replace(/明後日/g, fmtDate(addDays(today, 2)));
    s = s.replace(/明日/g, fmtDate(addDays(today, 1)));
    s = s.replace(/今日/g, fmtDate(today));
    s = s.replace(/今週末/g, () => {
      const d = new Date(today);
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      return fmtDate(d);
    });
    s = s.replace(/再来週([月火水木金土日]?)曜日?/g, (_, dow) => {
      if (dow && dowMap[dow] !== undefined) {
        const d = new Date(today);
        const diff = (dowMap[dow] - today.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff + 7);
        return fmtDate(d);
      }
      const d = new Date(today);
      d.setDate(d.getDate() + 15 - today.getDay());
      return `再来週（${d.getMonth() + 1}月${d.getDate()}日週）`;
    });
    s = s.replace(/来週([月火水木金土日]?)曜日?/g, (_, dow) => {
      if (dow && dowMap[dow] !== undefined) {
        const d = new Date(today);
        const diff = (dowMap[dow] - today.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return fmtDate(d);
      }
      const d = new Date(today);
      const diff = (8 - today.getDay()) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return `来週（${d.getMonth() + 1}月${d.getDate()}日週）`;
    });
    s = s.replace(/([月火水木金土日])曜日?/g, (m, dow) => {
      if (dowMap[dow] === undefined) return m;
      const d = new Date(today);
      const diff = (dowMap[dow] - today.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return fmtDate(d);
    });
    return s;
  }
  function expandBizTerms(text) {
    let s = String(text || '');
    Object.keys(BIZ_TERMS).forEach((k) => { s = s.replace(new RegExp(k, 'g'), BIZ_TERMS[k]); });
    return s;
  }
  function conv(text) {
    return expandBizTerms(convertRelativeDates(trim(text)));
  }
  function currentSit() {
    return situations.find((s) => s.id === sitId) || situations[0];
  }

  function defaultFields(sit) {
    const o = {};
    (sit.fields || []).forEach((f) => { o[f.id] = f.value || ''; });
    return o;
  }
  function cacheKey() { return sitId; }
  function readCache() {
    if (!fieldCache[cacheKey()]) {
      const sit = currentSit();
      fieldCache[cacheKey()] = { fields: defaultFields(sit), notes: '' };
    }
    return fieldCache[cacheKey()];
  }
  function writeCacheFromForm() {
    const sit = currentSit();
    const fields = {};
    (sit.fields || []).forEach((f) => {
      const el = $('fld-' + f.id);
      fields[f.id] = el ? el.value : (f.value || '');
    });
    fieldCache[cacheKey()] = { fields, notes: val('notes') };
  }

  function getSender() {
    return {
      name: localStorage.getItem('bt_myname') || '',
      company: localStorage.getItem('bt_mycompany') || '',
      dept: localStorage.getItem('bt_mydept') || '',
    };
  }
  function saveSenderFromForm() {
    localStorage.setItem('bt_myname', val('my-name'));
    localStorage.setItem('bt_mycompany', val('my-company'));
    localStorage.setItem('bt_mydept', val('my-dept'));
  }

  function getContacts() {
    try { return JSON.parse(localStorage.getItem('bt_email_contacts') || '[]'); }
    catch { return []; }
  }
  function saveContact(company, name) {
    if (!company && !name) return;
    const contacts = getContacts();
    const key = `${company}|||${name}`;
    if (!contacts.find((c) => `${c.company}|||${c.name}` === key)) {
      contacts.unshift({ company: company || '', name: name || '' });
      if (contacts.length > 50) contacts.pop();
      localStorage.setItem('bt_email_contacts', JSON.stringify(contacts));
    }
  }

  function greetingLine(tone, relation) {
    if (relation === '初対面') return '';
    if (tone === 'フォーマル') return 'いつも大変お世話になっております。';
    if (tone === '柔らかめ') return 'いつもお世話になっております。';
    return 'お世話になっております。';
  }
  function nameIntro(tone, relation, sender) {
    const who = sender.company && sender.name
      ? `${sender.company}の${sender.name}`
      : (sender.name || sender.company || '');
    const polite = tone === 'フォーマル';
    if (relation === '初対面') {
      const sudden = tone === '柔らかめ'
        ? '突然のご連絡失礼いたします。'
        : '突然のご連絡、失礼いたします。';
      if (!who) return sudden;
      return polite ? `${sudden}\n${who}と申します。` : `${sudden}\n${who}です。`;
    }
    if (!who) return '';
    return polite ? `${who}でございます。` : `${who}です。`;
  }
  function recipientBlock(company, name) {
    if (company && name) return `${company}\n${name}様`;
    if (name) return `${name}様`;
    if (company) return `${company}\nご担当者様`;
    return 'ご担当者様';
  }
  function buildSignature(sender) {
    let sig = '──────────────────';
    if (sender.name) sig += `\n${sender.name}`;
    if (sender.dept) sig += `\n${sender.dept}`;
    if (sender.company) sig += `\n${sender.company}`;
    return sig;
  }
  function notesLines(notes) {
    return String(notes || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const cleaned = l.replace(/^[\s・\-\*•]+/, '').trim();
      const labeled = cleaned.replace(new RegExp(`^(${LABEL_KEYS.join('|')})は`), (_, key) => `【${key}】`);
      return conv(labeled);
    });
  }
  function notesBlock(notes) {
    const lines = notesLines(notes);
    if (!lines.length) return '';
    return lines.map((l) => (l.startsWith('【') || /^\d+/.test(l) ? l : `・${l}`)).join('\n');
  }
  function metaLines(rows) {
    return rows.filter((r) => r && r[1]).map(([k, v]) => `【${k}】${v}`).join('\n');
  }
  function joinParts(parts) {
    return parts.filter((p) => p != null && String(p).trim() !== '').join('\n\n');
  }
  function placeText(place) {
    if (place === '自社へお越しいただく') return '弊社へお越しいただけますと幸いです';
    if (place === 'オンライン') return 'オンラインでの実施を想定しております';
    return '御社へお伺いします';
  }
  function parseRequestItems(notes) {
    return notesLines(notes).map((line) => {
      const cleaned = line.replace(/^\d+[\.．、\)]\s*/, '').replace(/^[・\-\*]\s*/, '');
      const parts = cleaned.split(/\s*(?:→|->|⇒|／)\s*/);
      if (parts.length >= 2) return { req: parts[0], ans: parts.slice(1).join(' → ') };
      return { req: cleaned, ans: '' };
    }).filter((x) => x.req);
  }

  function closingPlease(tone) {
    if (tone === 'フォーマル') return 'お手数をおかけしますが、どうぞよろしくお願い申し上げます。';
    if (tone === '柔らかめ') return 'よろしくお願いいたします。';
    return 'どうぞよろしくお願いいたします。';
  }

  const BUILDERS = {
    visit(ctx) {
      const f = ctx.f;
      const pre = ctx.tone === 'フォーマル'
        ? 'ぜひ一度お時間をいただき、直接お話しさせていただきたく、ご連絡申し上げました。'
        : ctx.tone === '柔らかめ'
          ? '一度お時間をいただけたらと思い、ご連絡いたしました。'
          : '下記の件でお伺いしたく、ご連絡いたしました。';
      const post = ctx.tone === 'フォーマル'
        ? 'ご多忙の折、誠に恐縮ではございますが、ご都合のよろしい日時をいくつかお知らせいただけますでしょうか。'
        : ctx.tone === '柔らかめ'
          ? 'ご都合のよい日程をお知らせください。'
          : 'ご都合のよい日時をいくつかお知らせいただけますと幸いです。';
      return {
        subject: f.purpose ? `お打ち合わせのお願い（${conv(f.purpose)}）` : 'お打ち合わせのお願い',
        parts: [
          pre,
          metaLines([
            ['目的', conv(f.purpose)],
            ['候補日時', conv(f.slots)],
            ['所要', (f.duration || '1時間') + '程度'],
            ['場所', placeText(f.place)],
          ]),
          ctx.notes,
          post,
          closingPlease(ctx.tone),
        ],
      };
    },
    hearing(ctx) {
      return {
        subject: fSubject(ctx.f.topics, 'ご要件の確認'),
        parts: [
          'ご検討・ご計画の内容を伺いたく、ご連絡いたしました。',
          metaLines([
            ['お伺いしたいこと', conv(ctx.f.topics)],
            ['ご回答希望', conv(ctx.f.deadline)],
          ]),
          ctx.notes,
          '差し支えない範囲で結構ですので、ご教示いただけますと幸いです。',
          closingPlease(ctx.tone),
        ],
      };
    },
    event(ctx) {
      const name = conv(ctx.f.eventName) || 'ご案内';
      return {
        subject: `【ご案内】${name}`,
        parts: [
          `${name}をご案内したく、ご連絡いたしました。`,
          metaLines([
            ['行事', name],
            ['日時', conv(ctx.f.when)],
            ['場所', conv(ctx.f.where)],
            ['出欠期限', conv(ctx.f.rsvp)],
          ]),
          ctx.notes,
          ctx.f.rsvp
            ? `ご都合をお知らせいただけますと幸いです（期限：${conv(ctx.f.rsvp)}）。`
            : 'ご都合をお知らせいただけますと幸いです。',
          closingPlease(ctx.tone),
        ],
      };
    },
    thanks(ctx) {
      const when = conv(ctx.f.when) || '先日';
      const point = conv(ctx.f.point);
      return {
        subject: point ? `先日はありがとうございました（${point}）` : '先日はありがとうございました',
        parts: [
          `${when}はお時間をいただき、誠にありがとうございました。`,
          point ? `${point}につきまして、改めて御礼申し上げます。` : '',
          ctx.notes,
          '今後ともどうぞよろしくお願い申し上げます。',
        ],
      };
    },
    follow(ctx) {
      const prev = conv(ctx.f.prev);
      const ask = conv(ctx.f.ask);
      return {
        subject: prev ? `フォロー：${prev}` : '先日のご相談について',
        parts: [
          prev ? `${prev}の件、その後のご状況はいかがでしょうか。` : '先日ご相談した件、その後のご状況はいかがでしょうか。',
          ask ? `【確認したいこと】${ask}` : '',
          ctx.notes,
          'ご多用のところ恐縮ですが、進捗がございましたらお知らせください。',
          closingPlease(ctx.tone),
        ],
      };
    },
    quote(ctx) {
      const what = conv(ctx.f.what) || '資料';
      return {
        subject: `${what}の送付`,
        parts: [
          `${what}をお送りいたします。ご確認ください。`,
          metaLines([
            ['送付内容', what],
            ['有効期限', conv(ctx.f.valid)],
          ]),
          ctx.notes,
          '内容についてご不明点がございましたら、お気軽にご連絡ください。',
          closingPlease(ctx.tone),
        ],
      };
    },
    confirm(ctx) {
      return {
        subject: fSubject(ctx.f.target, 'ご確認のお願い'),
        parts: [
          '下記の点についてご確認いただきたく、ご連絡いたしました。',
          metaLines([
            ['確認事項', conv(ctx.f.target)],
            ['ご回答期限', conv(ctx.f.deadline)],
          ]),
          ctx.notes,
          'ご確認のうえ、ご回答いただけますと幸いです。',
          closingPlease(ctx.tone),
        ],
      };
    },
    'request-reply'(ctx) {
      const reqDate = conv(ctx.f.reqDate);
      const format = ctx.f.format || '項目ごと';
      const result = ctx.f.result || '一部条件付き';
      const items = parseRequestItems(ctx.notesRaw);
      let middle = '';
      if (format === '項目ごと' && items.length) {
        middle = items.map((it, i) => {
          const ans = it.ans || '確認のうえ、あらためてご回答いたします。';
          return `${i + 1}. ${it.req}\n　→ ${ans}`;
        }).join('\n');
      } else {
        middle = ctx.notes || '内容を確認のうえ、対応可否をご連絡いたします。';
      }
      const lead = reqDate
        ? `${reqDate}でご依頼いただきました要請事項について、下記の通りご回答申し上げます。`
        : 'ご依頼いただきました要請事項について、下記の通りご回答申し上げます。';
      let wrap = '条件付きの項目がございます。内容をご確認のうえ、ご不明点がございましたらお知らせください。';
      if (result === 'すべて可') wrap = 'いずれも対応可能です。ご不明点がございましたらお知らせください。';
      if (result === '一部不可') wrap = '一部、ご期待に沿えない項目がございます。代替案も含めご検討いただけますと幸いです。';
      const remain = conv(ctx.f.deadline);
      return {
        subject: '要請事項へのご回答',
        parts: [
          lead,
          middle,
          remain ? `残件については、${remain}までにあらためてご連絡いたします。` : '',
          wrap,
          closingPlease(ctx.tone),
        ],
      };
    },
    issue(ctx) {
      const level = ctx.f.level || '相談';
      const prefix = level === '至急' ? '【至急】' : (level === '情報' ? '【ご報告】' : '【ご相談】');
      const lead = level === '至急'
        ? '至急ご共有すべき件が発生しましたので、ご連絡いたします。'
        : level === '情報'
          ? '状況をご報告したく、ご連絡いたします。'
          : 'ご相談したく、ご連絡いたします。';
      return {
        subject: prefix + (conv(ctx.f.lot) || '不具合のご連絡'),
        parts: [
          lead,
          metaLines([
            ['重要度', level],
            ['対象', conv(ctx.f.lot)],
            ['影響', conv(ctx.f.impact)],
            ['暫定策', conv(ctx.f.temp)],
          ]),
          ctx.notes,
          '本対策につきましては、分かり次第ご報告いたします。ご指示がございましたらお知らせください。',
          closingPlease(ctx.tone),
        ],
      };
    },
    progress(ctx) {
      const delay = ctx.f.delay || '遅れなし';
      return {
        subject: '進捗のご報告' + (conv(ctx.f.status) ? `（${conv(ctx.f.status)}）` : ''),
        parts: [
          '現在の進捗をご報告いたします。',
          metaLines([
            ['現状', conv(ctx.f.status)],
            ['次工程', conv(ctx.f.next)],
            ['遅れ', delay],
          ]),
          ctx.notes,
          delay === '遅れあり（相談）'
            ? '納期への影響についてご相談させてください。ご都合のよいご連絡をお待ちしております。'
            : '現時点で大きな遅れはございません。変更があればあらためてご連絡いたします。',
          closingPlease(ctx.tone),
        ],
      };
    },
    request(ctx) {
      return {
        subject: fSubject(ctx.f.what, 'ご依頼'),
        parts: [
          '下記についてご対応いただきたく、ご連絡いたしました。',
          metaLines([
            ['お願いしたいこと', conv(ctx.f.what)],
            ['期限', conv(ctx.f.by)],
          ]),
          ctx.notes,
          ctx.f.by
            ? `${conv(ctx.f.by)}までにご対応いただけますと助かります。`
            : 'ご対応いただけますと幸いです。',
          closingPlease(ctx.tone),
        ],
      };
    },
    schedule(ctx) {
      return {
        subject: '納期変更のご相談',
        parts: [
          '納期についてご相談したく、ご連絡いたしました。',
          metaLines([
            ['当初納期', conv(ctx.f.old)],
            ['変更後（希望）', conv(ctx.f.neu)],
            ['理由', conv(ctx.f.reason)],
          ]),
          ctx.notes,
          'ご迷惑をおかけし申し訳ございません。ご調整が可能かご検討いただけますでしょうか。',
          closingPlease(ctx.tone),
        ],
      };
    },
    decline(ctx) {
      const detailed = ctx.f.style !== '簡潔';
      const lead = detailed
        ? 'この度はご相談いただき、誠にありがとうございました。社内で検討いたしましたが、今回はご期待に沿うことが難しいと判断いたしました。'
        : 'この度はご相談いただきありがとうございました。今回は見送らせていただきたく、ご連絡いたします。';
      return {
        subject: 'ご相談の件について',
        parts: [
          lead,
          ctx.notes,
          'せっかくのお話にお応えできず申し訳ございません。またの機会がございましたら、何卒よろしくお願い申し上げます。',
        ],
      };
    },
  };

  function fSubject(hint, fallback) {
    const h = conv(hint);
    return h || fallback;
  }

  function collectCtx() {
    const sit = currentSit();
    const cache = readCache();
    const fields = {};
    (sit.fields || []).forEach((f) => {
      const el = $('fld-' + f.id);
      fields[f.id] = el ? el.value : (cache.fields[f.id] || f.value || '');
    });
    const notesRaw = $('notes') ? val('notes') : cache.notes;
    const sender = {
      name: $('my-name') ? val('my-name') : getSender().name,
      company: $('my-company') ? val('my-company') : getSender().company,
      dept: $('my-dept') ? val('my-dept') : getSender().dept,
    };
    const tone = (document.querySelector('input[name="tone"]:checked') || {}).value || '標準';
    const relation = (document.querySelector('input[name="relation"]:checked') || {}).value || '既存';
    return {
      sit, f: fields, notesRaw, notes: notesBlock(notesRaw),
      sender, tone, relation,
      toCompany: $('to-company') ? val('to-company') : '',
      toName: $('to-name') ? val('to-name') : '',
    };
  }

  function buildEmail() {
    const ctx = collectCtx();
    const builder = BUILDERS[ctx.sit.id] || BUILDERS.visit;
    const made = builder(ctx);
    const greet = greetingLine(ctx.tone, ctx.relation);
    const intro = nameIntro(ctx.tone, ctx.relation, ctx.sender);
    const head = joinParts([greet, intro]);
    const body = joinParts([
      recipientBlock(ctx.toCompany, ctx.toName),
      head,
      made.parts ? joinParts(made.parts) : '',
      buildSignature(ctx.sender),
    ]);
    return {
      subject: made.subject,
      body,
      complete: Boolean(trim(ctx.notesRaw) || Object.values(ctx.f).some((v) => trim(v))),
      hasNotes: Boolean(trim(ctx.notesRaw)),
      sitId: ctx.sit.id,
      slotsText: ctx.f.slots || '',
    };
  }

  function renderPreview() {
    const result = buildEmail();
    generatedSubject = result.subject;
    generatedBody = result.body;
    const subj = $('subject-output');
    const body = $('output-text');
    const badge = $('draft-badge');
    if (subj) subj.textContent = result.subject;
    if (body) body.textContent = result.body;
    if (badge) {
      badge.textContent = result.hasNotes ? '補足入り' : '骨組み';
      badge.className = result.hasNotes
        ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700'
        : 'text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500';
    }
    calendarDates = extractDatesFromText((result.slotsText || '') + '\n' + result.body);
    const calBtn = $('cal-btn');
    if (calBtn) calBtn.classList.toggle('hidden', sitId !== 'visit' || calendarDates.length === 0);
  }

  function extractDatesFromText(text) {
    const results = [];
    const parts = String(text || '').split(/か|または|もしくは|／|\/|,|、/);
    for (const part of parts) {
      const dm = part.match(/(\d{1,2})月(\d{1,2})日[^）]*）?\s*(\d{1,2})時(?:(\d{2})分)?/);
      if (!dm) continue;
      const year = new Date().getFullYear();
      const start = new Date(year, parseInt(dm[1], 10) - 1, parseInt(dm[2], 10), parseInt(dm[3], 10), parseInt(dm[4] || '0', 10));
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const fmt = (d) => d.getFullYear().toString()
        + String(d.getMonth() + 1).padStart(2, '0')
        + String(d.getDate()).padStart(2, '0')
        + 'T' + String(d.getHours()).padStart(2, '0')
        + String(d.getMinutes()).padStart(2, '0') + '00';
      results.push({ start: fmt(start), end: fmt(end) });
    }
    return results;
  }

  function fieldHtml(f) {
    const cache = readCache();
    const v = cache.fields[f.id] != null ? cache.fields[f.id] : (f.value || '');
    const focus = theme.focus;
    if (f.type === 'select') {
      const opts = (f.options || []).map((o) =>
        `<option value="${esc(o)}"${o === v ? ' selected' : ''}>${esc(o)}</option>`
      ).join('');
      return `<label class="block"><span class="text-xs font-semibold text-gray-600">${esc(f.label)}</span>
        <select id="fld-${esc(f.id)}" data-role="field" class="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${focus}">${opts}</select></label>`;
    }
    return `<label class="block"><span class="text-xs font-semibold text-gray-600">${esc(f.label)}</span>
      <input id="fld-${esc(f.id)}" data-role="field" type="text" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}"
        class="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${focus}" /></label>`;
  }

  function situationButtons() {
    return situations.map((s) => {
      const on = s.id === sitId;
      return `<button type="button" data-sit="${esc(s.id)}"
        class="sit-btn text-left rounded-xl border px-3 py-2.5 ${on ? theme.sitOn : theme.sitOff}">
        <p class="text-sm font-bold text-gray-800 leading-tight">${s.emoji} ${esc(s.name)}</p>
        <p class="text-[11px] text-gray-500 mt-0.5 leading-snug">${esc(s.hint)}</p>
      </button>`;
    }).join('');
  }

  function shellHtml() {
    const sender = getSender();
    const sit = currentSit();
    const cache = readCache();
    const hasKey = !!localStorage.getItem('bt_claude_api_key');
    return `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <a href="../../index.html?v=b2b2" class="text-gray-400 hover:text-gray-600 text-sm whitespace-nowrap">← ツール一覧</a>
          <span class="text-gray-300">|</span>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold text-gray-800">${esc(theme.title)}</h1>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${theme.badge}">BtoB</span>
            </div>
            <p class="text-xs text-gray-400 truncate">${esc(theme.subtitle)}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="ai-settings-btn" class="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">${hasKey ? 'AI設定済' : 'AI設定'}</button>
          <a href="${theme.otherHref}" class="text-xs font-semibold ${theme.accentText} bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg whitespace-nowrap">${esc(theme.otherLabel)}</a>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-5 space-y-4">
      <section>
        <p class="text-xs font-semibold text-gray-500 mb-2">シチュエーション</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" id="sit-grid">
          ${situationButtons()}
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4" id="work-area">
        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold ${theme.badge} px-2 py-0.5 rounded">設定</span>
            <span class="text-sm font-semibold text-gray-700">${sit.emoji} ${esc(sit.name)}</span>
          </div>

          <div class="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p class="text-xs font-semibold text-gray-500 mb-2">差出人（自動保存）</p>
            <div class="grid grid-cols-2 gap-2">
              <input id="my-name" type="text" placeholder="氏名（例: 稲垣 督）" value="${esc(sender.name)}"
                class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${theme.focus}" />
              <input id="my-company" type="text" placeholder="会社名" value="${esc(sender.company)}"
                class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${theme.focus}" />
              <input id="my-dept" type="text" placeholder="部署（省略可）" value="${esc(sender.dept)}"
                class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white col-span-2 focus:outline-none focus:ring-2 ${theme.focus}" />
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-gray-500 mb-2">相手</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="contact-wrap">
                <input id="to-company" type="text" placeholder="相手の会社名" autocomplete="off"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${theme.focus}" />
                <div id="contact-dropdown" class="contact-dropdown hidden"></div>
              </div>
              <input id="to-name" type="text" placeholder="氏名（例: 服部）"
                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${theme.focus}" />
            </div>
            <p class="text-[11px] text-gray-400 mt-1">一度使った相手は候補に出ます</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1.5">関係</p>
              <div class="flex flex-col gap-1 text-sm">
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="relation" value="既存" checked class="accent-blue-500" /> 既存</label>
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="relation" value="初対面" class="accent-blue-500" /> 初対面</label>
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="relation" value="協力会社" class="accent-blue-500" /> 協力会社</label>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-1.5">文体</p>
              <div class="flex flex-col gap-1 text-sm">
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tone" value="フォーマル" class="accent-blue-500" /> フォーマル</label>
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tone" value="標準" checked class="accent-blue-500" /> 標準</label>
                <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" name="tone" value="柔らかめ" class="accent-blue-500" /> 柔らかめ</label>
              </div>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-gray-500 mb-2">このメールの設定</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" id="field-grid">
              ${sit.fields.map(fieldHtml).join('')}
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-1">補足説明
              <span class="text-gray-400 font-normal text-xs ml-1">（箇条書きでOK。これが本文の核になります）</span>
            </label>
            <textarea id="notes" rows="6" placeholder="${esc(sit.notePlaceholder)}"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${theme.focus}">${esc(cache.notes)}</textarea>
          </div>

          <div class="flex gap-2">
            <button type="button" id="complete-btn" class="flex-1 ${theme.btn} text-white font-bold py-3 rounded-xl transition">
              文章を完成する
            </button>
            <button type="button" id="ai-polish-btn" class="${hasKey ? '' : 'hidden '}flex-1 border ${theme.btnGhost} font-semibold py-3 rounded-xl transition">
              AIで仕上げ
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col min-h-[420px]" id="preview-card">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">完成文</span>
              <span class="text-sm font-semibold text-gray-700">件名と本文</span>
            </div>
            <span id="draft-badge" class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">骨組み</span>
          </div>
          <div class="mb-3">
            <p class="text-xs font-semibold text-gray-500 mb-1">件名</p>
            <div class="flex items-center gap-2">
              <p id="subject-output" class="flex-1 text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"></p>
              <button type="button" id="copy-subject" class="text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-2 py-1.5 hover:bg-blue-50 whitespace-nowrap">コピー</button>
            </div>
          </div>
          <div class="flex-1 flex flex-col">
            <p class="text-xs font-semibold text-gray-500 mb-1">本文</p>
            <div id="output-text" class="flex-1 text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 leading-7 min-h-[220px]"></div>
          </div>
          <div class="flex gap-2 mt-3">
            <button type="button" id="copy-all" class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl">全文コピー</button>
            <button type="button" id="open-gmail" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2.5 rounded-xl border border-red-100">Gmailで開く</button>
          </div>
          <button type="button" id="cal-btn" class="hidden w-full mt-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2.5 rounded-xl border border-blue-100">📅 Googleカレンダーに仮登録</button>
        </div>
      </section>
    </main>

    <div id="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2.5 rounded-xl opacity-0 transition-opacity pointer-events-none z-50">コピーしました</div>

    <div id="modal-api" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 class="text-base font-bold text-gray-800 mb-1">AI設定（Claude Haiku）</h2>
        <p class="text-xs text-gray-500 mb-4">任意です。未設定でもテンプレートで文章は完成します。キーはこのブラウザにのみ保存されます。</p>
        <input id="api-key-input" type="password" placeholder="sk-ant-..." autocomplete="off"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <p id="api-status" class="text-xs mb-4 text-gray-400"></p>
        <div class="flex gap-2">
          <button type="button" id="api-save" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2.5 rounded-xl">保存</button>
          <button type="button" id="api-clear" class="border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-xl">削除</button>
          <button type="button" id="api-close" class="border border-gray-200 text-gray-500 text-sm px-4 py-2.5 rounded-xl">閉じる</button>
        </div>
      </div>
    </div>`;
  }

  function showToast(msg) {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  function filterContacts() {
    const q = val('to-company').trim().toLowerCase();
    const contacts = getContacts();
    const filtered = q
      ? contacts.filter((c) => (c.company || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q))
      : contacts;
    const dd = $('contact-dropdown');
    if (!dd) return;
    if (!filtered.length) { dd.classList.add('hidden'); return; }
    dd.innerHTML = filtered.slice(0, 10).map((c, i) =>
      `<div class="contact-item" data-ci="${i}">${esc(c.company)}${c.name ? ' ' + esc(c.name) : ''}</div>`
    ).join('');
    dd.dataset.json = JSON.stringify(filtered.slice(0, 10));
    dd.classList.remove('hidden');
  }

  function selectSituation(id, keepRecipient) {
    writeCacheFromFormSafe();
    sitId = id;
    const toCompany = keepRecipient ? val('to-company') : val('to-company');
    const toName = keepRecipient ? val('to-name') : val('to-name');
    const relation = (document.querySelector('input[name="relation"]:checked') || {}).value;
    const tone = (document.querySelector('input[name="tone"]:checked') || {}).value;
    const sender = { name: val('my-name'), company: val('my-company'), dept: val('my-dept') };
    localStorage.setItem('bt_b2b_last_' + mode, id);
    rebuildInner(toCompany, toName, relation, tone, sender);
  }

  function writeCacheFromFormSafe() {
    if ($('notes')) writeCacheFromForm();
  }

  function rebuildInner(toCompany, toName, relation, tone, sender) {
    const sitGrid = $('sit-grid');
    const fieldGrid = $('field-grid');
    const notes = $('notes');
    if (sitGrid) sitGrid.innerHTML = situationButtons();
    const sit = currentSit();
    const cache = readCache();
    if (fieldGrid) fieldGrid.innerHTML = sit.fields.map(fieldHtml).join('');
    if (notes) {
      notes.value = cache.notes;
      notes.placeholder = sit.notePlaceholder;
    }
    const title = document.querySelector('#work-area .text-sm.font-semibold');
    if (title) title.innerHTML = `${sit.emoji} ${esc(sit.name)}`;
    if (toCompany != null && $('to-company')) $('to-company').value = toCompany;
    if (toName != null && $('to-name')) $('to-name').value = toName;
    if (sender) {
      if ($('my-name')) $('my-name').value = sender.name || '';
      if ($('my-company')) $('my-company').value = sender.company || '';
      if ($('my-dept')) $('my-dept').value = sender.dept || '';
    }
    if (relation) {
      const r = document.querySelector(`input[name="relation"][value="${relation}"]`);
      if (r) r.checked = true;
    }
    if (tone) {
      const t = document.querySelector(`input[name="tone"][value="${tone}"]`);
      if (t) t.checked = true;
    }
    renderPreview();
  }

  async function polishWithAI() {
    const apiKey = localStorage.getItem('bt_claude_api_key');
    if (!apiKey) { showToast('AIキーが未設定です'); return; }
    const ctx = collectCtx();
    const draft = buildEmail();
    const btn = $('ai-polish-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> 仕上げ中...'; }
    const today = new Date();
    const dw = ['日', '月', '火', '水', '木', '金', '土'];
    const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${dw[today.getDay()]}）`;
    const prompt = `あなたは日本のBtoBビジネスメール作成の専門家です。下書きを自然で丁寧な本文に整えてください。
今日: ${todayStr}
ルール:
- 署名は含めない
- 相対日付は「○月○日（曜日）」に変換
- 文体は「${ctx.tone}」、関係は「${ctx.relation}」
- 設定と補足の事実は残し、言い回しだけ整える
- JSONのみ返す: {"subject":"件名","body":"本文（宛先行から結びまで。署名なし）"}

差出人: ${ctx.sender.name} / ${ctx.sender.company} / ${ctx.sender.dept}
宛先: ${ctx.toCompany} ${ctx.toName}
シチュエーション: ${ctx.sit.name}
下書き件名: ${draft.subject}
下書き本文:\n${draft.body}`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-cors': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error('APIエラー ' + res.status);
      const data = await res.json();
      const raw = data.content[0].text;
      const match = raw.match(/\{[\s\S]*"subject"[\s\S]*"body"[\s\S]*\}/);
      if (!match) throw new Error('解析できませんでした');
      const parsed = JSON.parse(match[0]);
      generatedSubject = parsed.subject;
      generatedBody = String(parsed.body).trim() + '\n\n' + buildSignature(ctx.sender);
      $('subject-output').textContent = generatedSubject;
      $('output-text').textContent = generatedBody;
      const badge = $('draft-badge');
      if (badge) {
        badge.textContent = 'AI仕上げ';
        badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700';
      }
      saveContact(ctx.toCompany, ctx.toName);
      showToast('AIで仕上げました');
    } catch (err) {
      showToast('AI失敗のためテンプレートを表示します');
      renderPreview();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'AIで仕上げ'; }
    }
  }

  function openCalendar() {
    if (!calendarDates.length) { showToast('日時が見つかりません'); return; }
    let calEmail = localStorage.getItem('bt_cal_email') || '';
    if (!calEmail) {
      calEmail = prompt('Googleカレンダーに使うGmailアドレス', '') || '';
      if (!calEmail) return;
      localStorage.setItem('bt_cal_email', calEmail.trim());
    }
    const toCompany = val('to-company');
    const toName = val('to-name');
    const title = encodeURIComponent(`【仮】${generatedSubject}（${toCompany}${toName ? ' ' + toName : ''}様）`);
    const details = encodeURIComponent('※メールで調整中\n\n' + generatedBody.slice(0, 300));
    const d = calendarDates[0];
    window.open(`https://calendar.google.com/calendar/u/${encodeURIComponent(calEmail)}/r/eventedit?text=${title}&dates=${d.start}/${d.end}&details=${details}`, '_blank');
  }

  function onRootClick(e) {
    const sitBtn = e.target.closest('[data-sit]');
    if (sitBtn) {
      selectSituation(sitBtn.getAttribute('data-sit'), true);
      return;
    }
    const ci = e.target.closest('[data-ci]');
    if (ci) {
      const dd = $('contact-dropdown');
      const list = JSON.parse(dd.dataset.json || '[]');
      const item = list[Number(ci.getAttribute('data-ci'))];
      if (item) {
        $('to-company').value = item.company || '';
        $('to-name').value = item.name || '';
        dd.classList.add('hidden');
        renderPreview();
      }
      return;
    }
    const id = e.target.closest('button') && e.target.closest('button').id;
    if (id === 'complete-btn') {
      writeCacheFromForm();
      saveSenderFromForm();
      renderPreview();
      saveContact(val('to-company'), val('to-name'));
      $('preview-card') && $('preview-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast(trim(val('notes')) ? '文章を完成しました' : '骨組みです。補足を書くと具体になります');
      return;
    }
    if (id === 'ai-polish-btn') { polishWithAI(); return; }
    if (id === 'copy-subject') {
      navigator.clipboard.writeText(generatedSubject).then(() => showToast('件名をコピーしました'));
      return;
    }
    if (id === 'copy-all') {
      navigator.clipboard.writeText(`件名: ${generatedSubject}\n\n${generatedBody}`).then(() => showToast('全文コピーしました'));
      return;
    }
    if (id === 'open-gmail') {
      saveContact(val('to-company'), val('to-name'));
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(generatedBody)}`, '_blank');
      return;
    }
    if (id === 'cal-btn') { openCalendar(); return; }
    if (id === 'ai-settings-btn') {
      const modal = $('modal-api');
      $('api-key-input').value = localStorage.getItem('bt_claude_api_key') || '';
      $('api-status').textContent = localStorage.getItem('bt_claude_api_key') ? '設定済み' : '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      return;
    }
    if (id === 'api-close' || e.target.id === 'modal-api') {
      $('modal-api').classList.add('hidden');
      $('modal-api').classList.remove('flex');
      return;
    }
    if (id === 'api-save') {
      const key = val('api-key-input').trim();
      if (!key) { showToast('キーを入力してください'); return; }
      localStorage.setItem('bt_claude_api_key', key);
      $('api-status').textContent = '保存しました';
      $('ai-settings-btn').textContent = 'AI設定済';
      $('ai-polish-btn').classList.remove('hidden');
      showToast('AIキーを保存しました');
      return;
    }
    if (id === 'api-clear') {
      localStorage.removeItem('bt_claude_api_key');
      $('api-key-input').value = '';
      $('api-status').textContent = '削除しました';
      $('ai-settings-btn').textContent = 'AI設定';
      $('ai-polish-btn').classList.add('hidden');
      return;
    }
  }

  function onRootInput(e) {
    if (e.target && e.target.id === 'to-company') filterContacts();
    if (e.target && (e.target.id === 'my-name' || e.target.id === 'my-company' || e.target.id === 'my-dept')) {
      saveSenderFromForm();
    }
    if ($('notes')) writeCacheFromForm();
    renderPreview();
  }

  function init(opts) {
    mode = opts.mode === 'ops' ? 'ops' : 'sales';
    theme = THEMES[mode];
    situations = mode === 'ops' ? OPS : SALES;
    sitId = localStorage.getItem('bt_b2b_last_' + mode) || situations[0].id;
    if (!situations.find((s) => s.id === sitId)) sitId = situations[0].id;
    root = opts.root;
    document.title = theme.title;
    root.innerHTML = shellHtml();
    root.addEventListener('click', onRootClick);
    root.addEventListener('input', onRootInput);
    root.addEventListener('change', onRootInput);
    const toCompany = $('to-company');
    if (toCompany) {
      toCompany.addEventListener('focus', filterContacts);
      toCompany.addEventListener('blur', () => setTimeout(() => $('contact-dropdown') && $('contact-dropdown').classList.add('hidden'), 150));
    }
    renderPreview();
  }

  global.B2BMail = { init };
})(window);
