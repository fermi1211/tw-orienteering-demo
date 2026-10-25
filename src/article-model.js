export const articleFonts = ['Noto Sans TC', 'Noto Serif TC', 'Arial', 'Georgia'];
export const articleFontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
export const emptyArticleDocument = () => ({ type: 'doc', content: [{ type: 'paragraph' }] });
const text = (value, max = 100000) => typeof value === 'string' ? value.slice(0, max) : '';
const alignments = ['left', 'center', 'right', 'justify'];
export function safeArticleColor(value) {
  if (typeof value !== 'string') return null;
  if (/^#[\da-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[\da-f]{3}$/i.test(value)) return '#' + value.slice(1).split('').map(char => char + char).join('').toLowerCase();
  const rgb = value.match(/^rgb\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)$/);
  return rgb && rgb.slice(1).every(channel => Number(channel) <= 255) ? '#' + rgb.slice(1).map(channel => Number(channel).toString(16).padStart(2, '0')).join('') : null;
}
export function safeArticleLink(value) {
  if (typeof value !== 'string' || /[\s\u0000-\u001f]/.test(value)) return null;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
export function safeArticleImage(value) {
  if (typeof value !== 'string') return null;
  if (/^(?:\.\/)?assets\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|svg)$/i.test(value)) return value;
  if (value.length <= 7 * 1024 * 1024 && /^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=\r\n]+$/.test(value)) return value;
  return null;
}
export function safeArticleMarks(marks) {
  if (!Array.isArray(marks)) return [];
  return marks.flatMap(mark => {
    if (['bold', 'italic', 'underline', 'strike', 'code'].includes(mark?.type)) return [{ type: mark.type }];
    if (mark?.type === 'link') { const href = safeArticleLink(mark.attrs?.href); return href ? [{ type: 'link', attrs: { href } }] : []; }
    if (mark?.type !== 'textStyle') return [];
    const input = mark.attrs || {}, attrs = {};
    for (const key of ['color', 'backgroundColor']) { const value = safeArticleColor(input[key]); if (value) attrs[key] = value; }
    const font = text(input.fontFamily).replace(/^["']|["']$/g, '');
    if (articleFonts.includes(font)) attrs.fontFamily = font;
    if (articleFontSizes.some(size => input.fontSize === `${size}px`)) attrs.fontSize = input.fontSize;
    return Object.keys(attrs).length ? [{ type: 'textStyle', attrs }] : [];
  });
}
export function sanitizeArticleDocument(document) {
  let remaining = 15000;
  function clean(node, depth = 0) {
    if (!node || depth > 20 || --remaining < 0) return null;
    if (node.type === 'text') { const value = text(node.text); return value ? { type: 'text', text: value, marks: safeArticleMarks(node.marks) } : null; }
    if (node.type === 'image') {
      const attrs = node.attrs || {}, src = safeArticleImage(attrs.src);
      return src ? { type: 'image', attrs: { src, alt: text(attrs.alt, 250), caption: text(attrs.caption, 500), width: Math.max(25, Math.min(100, Number(attrs.width) || 100)), align: ['left', 'center', 'right'].includes(attrs.align) ? attrs.align : 'center' } } : null;
    }
    if (['horizontalRule', 'hardBreak'].includes(node.type)) return { type: node.type };
    if (!['doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type)) return null;
    const result = { type: node.type, content: (Array.isArray(node.content) ? node.content : []).map(child => clean(child, depth + 1)).filter(Boolean) };
    if (['paragraph', 'heading'].includes(node.type)) {
      result.attrs = { textAlign: alignments.includes(node.attrs?.textAlign) ? node.attrs.textAlign : 'left' };
      if (node.type === 'heading') result.attrs.level = [2, 3, 4].includes(node.attrs?.level) ? node.attrs.level : 2;
    }
    if (node.type === 'orderedList') result.attrs = { start: Math.max(1, Math.min(999, Number(node.attrs?.start) || 1)) };
    return result;
  }
  const result = clean(document?.type === 'doc' ? document : emptyArticleDocument());
  return result?.content?.length ? result : emptyArticleDocument();
}
export function articleText(document) {
  if (!document) return '';
  if (document.type === 'text') return text(document.text);
  if (document.type === 'image') return text(document.attrs?.caption);
  return (document.content || []).map(articleText).join(['doc', 'blockquote', 'bulletList', 'orderedList'].includes(document.type) ? '\n' : '');
}
export function articleImageCount(document) { return (document?.type === 'image' ? 1 : 0) + (document?.content || []).reduce((sum, node) => sum + articleImageCount(node), 0); }
export function normalizeArticle(input = {}) {
  const content = sanitizeArticleDocument(input.content);
  return { title: text(input.title, 100).trim(), excerpt: text(input.excerpt, 220).trim(), category: text(input.category, 80).trim(), author: text(input.author, 60).trim() || '台灣定向編輯部', cover: safeArticleImage(input.cover) || '', coverAlt: text(input.coverAlt, 250), content };
}
export function articlePublishErrors(input) {
  const article = normalizeArticle(input), errors = [];
  if (!article.title) errors.push('請填寫文章標題。');
  if (!articleText(article.content).trim() && !articleImageCount(article.content)) errors.push('請先撰寫文章內容或加入圖片。');
  if (articleImageCount(article.content) > 10) errors.push('每篇文章最多加入 10 張內文圖片。');
  return errors;
}
export function saveArticleRecord(previous, draft, publish, now = new Date().toISOString()) {
  const next = normalizeArticle(draft);
  if (publish) { const error = articlePublishErrors(next)[0]; if (error) throw new Error(error); }
  return { ...previous, id: previous?.id || crypto.randomUUID(), draft: next, savedAt: now, published: publish ? { ...next, publishedAt: previous?.published?.publishedAt || now, updatedAt: now } : previous?.published || null };
}
export function publicArticles(records) {
  return records.filter(record => record.published && !record.deletedAt).map(record => ({ id: record.id, ...normalizeArticle(record.published), publishedAt: record.published.publishedAt, updatedAt: record.published.updatedAt })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export const articleHasDraftChanges = record => Boolean(record.published) && JSON.stringify(normalizeArticle(record.draft)) !== JSON.stringify(normalizeArticle(record.published));
export const articleReadingMinutes = content => Math.max(1, Math.ceil(articleText(content).replace(/\s/g, '').length / 350));
export const articleDate = value => new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));

const p = value => ({ type: 'paragraph', content: [{ type: 'text', text: value }] });
const heading = value => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: value }] });
function seedArticle(id, title, category, excerpt, cover, content, date) {
  return saveArticleRecord({ id }, { title, category, excerpt, cover, coverAlt: '定向專欄示意圖片', author: '台灣定向編輯部', content: { type: 'doc', content } }, true, date);
}
export const initialArticles = [
  seedArticle('first-map', '先讀懂地圖，再走出自己的路', '定向入門', '把好奇心放進背包。從一張地圖開始，練習觀察、選擇，與找到方向的樂趣。', './assets/forest-tablet.png', [
    p('定向的第一步，可以從放慢腳步、仔細看開始。這篇示範專欄邀請你把眼前的環境與手上的地圖放在一起觀察。'),
    heading('先觀察，再決定下一步'), p('練習時，選擇一個容易辨認的位置，描述你看見的道路、轉角與周邊地形，再與地圖上的資訊對照。用自己的話說出觀察，是很好的開始。'),
    { type: 'image', attrs: { src: './assets/journal-map.svg', alt: '以等高線、道路與三個檢查點構成的定向示意圖', caption: '示意插圖：把路線選擇拆成一個個可以觀察的小決定。此圖不供實際導航。', width: 100, align: 'center' } },
    heading('留一點時間，回看自己的選擇'), p('每一次練習後，記下一個印象深刻的判斷。你當時看見什麼？為什麼選這條路？下次想試試哪種做法？把心得留下來，會讓每次出發都有新的發現。'),
    { type: 'blockquote', content: [p('方向感，是一次次觀察與選擇累積而來的。')] },
    { type: 'horizontalRule' }, p('本文為網站編排示範，正式教學內容將由管理員補充與審閱；活動規則與實際資訊請以主辦單位公告為準。'),
  ], '2026-10-24T01:00:00Z'),
  seedArticle('map-observation', '讀圖筆記：把眼前的風景連回地圖', '讀圖技巧', '從可辨認的地物開始，建立自己的觀察筆記，讓每一次練習都留下收穫。', './assets/journal-map.svg', [heading('帶著問題去觀察'), p('今天的練習，可以只專注在一個問題：哪些地物最容易辨認？把你看見的資訊寫成簡短筆記，再回到地圖上找出對應位置。'), heading('記錄自己的判斷'), p('描述觀察、記下疑問，再與夥伴交流。這是專欄內容與圖片排版的示範文章，正式教學內容待編輯補充。')], '2026-10-22T01:00:00Z'),
  seedArticle('before-start', '出發前，替自己留一份準備清單', '參賽準備', '把報到、活動資訊與個人用品整理好，留更多心思給當天的探索。', './assets/forest-hero.png', [heading('先把活動資訊放在一起'), p('日期、集合地點、報到方式與主辦單位公告，可以先整理在同一份清單，出門前再確認一次。'), { type: 'bulletList', content: [p('閱讀本場活動簡章與最新公告。'), p('確認交通與集合資訊。'), p('依主辦單位要求檢查個人用品。')].map(node => ({ type: 'listItem', content: [node] })) }, p('本文為網站文章排版示範，不取代各場活動的正式要求。')], '2026-10-20T01:00:00Z'),
];
