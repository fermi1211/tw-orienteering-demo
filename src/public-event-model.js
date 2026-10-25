import { activeEventRows, registrationClosed, syncStartOrder, validateStartOrder } from './event-export-model.js';

export const defaultVisibility = { registrations: false, maskRegistrations: true, startOrder: false, maskStartOrder: true };
const groupNames = { ME: '男子菁英組', WE: '女子菁英組', MA: '男子進階組', WA: '女子進階組', OPEN: '公開組' };
const taipeiDay = now => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei' }).format(new Date(now));
const timestamp = value => Date.parse(value ? `${value.length === 16 ? value + ':00' : value}+08:00` : '');

export function eventState(event, now = Date.now()) {
  if (event.starts?.slice(0, 10) < taipeiDay(now)) return 'past';
  if (registrationClosed(event, now)) return 'closed';
  return event.status === 'PUBLISHED' && timestamp(event.opens) <= now && now < timestamp(event.closes) ? 'open' : 'upcoming';
}
export const stateLabels = { open: '報名中', upcoming: '尚未開放', closed: '報名已截止', past: '過去賽事' };
export function eventForList(event, now = Date.now()) {
  const date = event.starts?.slice(0, 10) || '';
  return { ...event, date, displayDate: date.slice(5).replace('-', '.'), deadline: event.closes?.slice(5, 10).replace('-', '.') || '待公告', state: eventState(event, now), singleFee: event.fees.SINGLE };
}
export function groupedEvents(catalog, now = Date.now()) {
  const published = catalog.filter(event => event.status === 'PUBLISHED').map(event => eventForList(event, now));
  return [
    { key: 'open', title: '報名中', description: '選一場賽事，準備出發。', events: published.filter(event => event.state === 'open').sort((a,b) => a.date.localeCompare(b.date)) },
    { key: 'future', title: '即將到來', description: '未來賽事與已截止報名的場次。', events: published.filter(event => ['upcoming','closed'].includes(event.state)).sort((a,b) => a.date.localeCompare(b.date)) },
    { key: 'past', title: '過去賽事', description: '回看活動資訊、公開名單與出發序。', events: published.filter(event => event.state === 'past').sort((a,b) => b.date.localeCompare(a.date)) },
  ];
}

// Segment graphemes so a composed character or emoji is never split in half.
export function publicNickname(value, masked) {
  const nickname = typeof value === 'string' ? value.trim() : '';
  if (!nickname) return '未設定暱稱';
  if (!masked) return nickname;
  const parts = [...new Intl.Segmenter('zh-TW', { granularity: 'grapheme' }).segment(nickname)].map(item => item.segment);
  if (parts.length <= 2) return '*'.repeat(parts.length);
  return parts[0] + '*'.repeat(parts.length - 2) + parts.at(-1);
}

// Only this narrow projection reaches the public UI. No name/ID/contact/payment fallback.
export function publicEventData(event, rows, savedOrder, now = Date.now()) {
  const active = activeEventRows(rows, event.id);
  const visibility = { ...defaultVisibility, ...event.publicVisibility };
  const codes = [...new Set([...event.divisions, ...active.map(row => row.division)])];
  const order = savedOrder ? syncStartOrder(savedOrder, active) : null;
  const startsAvailable = visibility.startOrder && registrationClosed(event, now) && order && !validateStartOrder(order, active).length;
  const times = new Map(startsAvailable ? order.sections.flatMap(section => section.entries.map(entry => [entry.recordId, entry.time])) : []);
  return {
    total: active.length,
    showRegistrations: visibility.registrations,
    showStartOrder: visibility.startOrder,
    startOrderReady: Boolean(startsAvailable),
    maskRegistrations: visibility.maskRegistrations,
    maskStartOrder: visibility.maskStartOrder,
    groups: codes.map(code => {
      const members = active.filter(row => row.division === code);
      return {
        code, name: event.divisionCatalog?.find(group => group.code === code)?.name || groupNames[code] || code,
        count: members.length,
        ...(visibility.registrations ? { registrations: members.map(row => ({ nickname: publicNickname(row.nickname, visibility.maskRegistrations), division: code })) } : {}),
        ...(startsAvailable ? { starts: members.map(row => ({ nickname: publicNickname(row.nickname, visibility.maskStartOrder), time: times.get(row.id) })).sort((a,b) => a.time.localeCompare(b.time)) } : {}),
      };
    }),
  };
}
