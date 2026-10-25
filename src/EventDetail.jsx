import { ArrowLeft, ArrowRight, MapPin, ArrowSquareOut, CalendarBlank, Clock } from '@phosphor-icons/react';
import { EventHero, EventDocuments } from './EventAttachments.jsx';
import './event-detail.css';
import { PublicEventParticipation } from './PublicEventParticipation.jsx';
import { stateLabels } from './public-event-model.js';

const feeNames = { MEMBER: '會員', LEGACY_PREPAID: '舊制已預繳', SINGLE: '單次報名' };
const groupNames = { ME:'男子菁英組', WE:'女子菁英組', MA:'男子進階組', WA:'女子進階組', OPEN:'公開組' };
const dateTime = value => value ? new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).format(new Date(`${value}:00+08:00`)) : '待主辦單位公告';

function LocationMap({ event }) {
  const point = event.mapLocation;
  const valid = point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 85 && Math.abs(point.lng) <= 180;
  const delta = point?.approximate ? 0.045 : 0.006;
  const bbox = valid ? [Math.max(-180, point.lng - delta * 1.6), Math.max(-85, point.lat - delta), Math.min(180, point.lng + delta * 1.6), Math.min(85, point.lat + delta)].map(n => n.toFixed(6)).join(',') : '';
  const query = new URLSearchParams({bbox, layer:'mapnik'});
  if (valid && !point.approximate) query.set('marker', `${point.lat},${point.lng}`);
  const osmUrl = valid ? `https://www.openstreetmap.org/?${point.approximate ? '' : `mlat=${point.lat}&mlon=${point.lng}`}#map=${point.approximate ? 12 : 16}/${point.lat}/${point.lng}` : `https://www.openstreetmap.org/search?${new URLSearchParams({query:event.location || ''})}`;
  return <section className="activity-map" aria-label="賽事地點地圖"><div className="activity-map-heading"><MapPin size={23}/><h2>活動地點</h2></div><p className="activity-map-location">{event.location || '地點待公告'}</p>{valid ? <><p className="activity-map-note">{point.approximate ? '區域示意 · 實際集合點待主辦單位公告' : '主辦單位設定的活動位置'}</p><iframe key={bbox + String(point.approximate)} title={`${event.name}地點地圖`} src={`https://www.openstreetmap.org/export/embed.html?${query}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/></> : <p className="attachment-empty">地圖位置尚未設定，請以主辦單位公布的集合資訊為準。</p>}<div className="activity-map-footer"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a><a className="osm-expand" href={osmUrl} target="_blank" rel="noreferrer">開啟地圖<ArrowSquareOut size={17}/></a></div><p className="activity-map-help">地圖無法載入時，可使用「開啟地圖」查看。</p></section>;
}

export function EventDetail({ event, state, participation, user, fromRegistration, onBack, onRegister, Dialog }) {
  const attachments = event.status === 'PUBLISHED' ? event.attachments : undefined;
  return <main id="main" className="single-event-page"><div className="single-event-back"><button className="text-button" onClick={onBack}><ArrowLeft size={18}/>{fromRegistration ? '返回我的報名' : '返回賽事列表'}</button><span>示意賽事</span></div>
    <EventHero key={event.id} images={attachments?.images} Dialog={Dialog}/>
    <section className="activity-data" aria-labelledby="activity-data-title"><header className="activity-heading"><p className="eyebrow" id="activity-data-title">活動資料</p><div><h1>{event.name}</h1><span className={state === 'open' ? 'activity-badge' : `activity-badge ${state}`}>{stateLabels[state]}</span></div><p className="activity-intro">活動資訊、報名方式與簡章下載，都在這裡。</p><p className="activity-revision">版本 {event.revision} · 更新於 {event.updatedAt || '2026.10.20'}{event.summary && ` · ${event.summary}`}</p></header>
      <div className="activity-highlights"><div><CalendarBlank size={23}/><span>活動日期<strong>{dateTime(event.starts)}</strong></span></div><div><MapPin size={23}/><span>活動地點<strong>{event.location || '待公告'}</strong></span></div><div><Clock size={23}/><span>報名截止<strong>{dateTime(event.closes)}</strong></span></div></div>
      <PublicEventParticipation data={participation} mode="counts"/>
      <div className="activity-body"><div className="activity-main"><section className="activity-section"><h2>活動說明</h2><p className="activity-description">{event.description?.trim() || '沿著地圖走進自然，享受尋找方向的樂趣。正式活動流程與集合資訊，將由主辦單位另行公告。'}</p><dl className="activity-facts"><div><dt>報名期間</dt><dd>{dateTime(event.opens)}<br/>至 {dateTime(event.closes)}</dd></div><div><dt>參賽組別</dt><dd>{event.divisions.map(code => {const name = event.divisionCatalog?.find(item=>item.code===code)?.name || groupNames[code];return name ? `${name} ${code}` : code;}).join(' ／ ')}</dd></div></dl></section>
        <section className="activity-section"><h2>報名費用</h2><dl className="activity-fees">{Object.entries(event.fees).map(([key, amount]) => <div key={key}><dt>{feeNames[key]}</dt><dd>NT${amount}</dd></div>)}</dl></section>
        <section className="activity-section"><h2>報名與繳款</h2><p>登入後選擇參賽組別及費用類別。單次報名採銀行轉帳，填寫帳號後五碼與繳款日期，由主辦單位人工對帳；外國人另可選擇現場繳費。</p><p>報名期間內可修改組別及尚未完成對帳的繳款資料；不提供取消或退費。</p></section>
        <section className="activity-section"><h2>活動告知</h2>{event.terms?.length ? event.terms.map(term => <div key={term.id} className="activity-term"><h3>{term.title}</h3><p>{term.content}</p><span>{term.required ? '報名時必須同意' : '閱讀告知'}</span></div>) : <p>本場尚未提供活動條款，正式內容待主辦單位公告。</p>}</section>
        <EventDocuments documents={attachments?.documents}/>
      </div><aside className="activity-aside"><LocationMap event={event}/><div className="activity-registration">{state === 'open' ? <><p>準備好，找到自己的方向。</p><button className="primary activity-register-button" onClick={onRegister}>{user ? '立即報名' : '登入後報名'}<ArrowRight size={21}/></button></> : <p className="notice">{state==='past'?'本場為過去賽事，已結束報名。':state==='closed'?'本場報名已截止。':'本場賽事尚未開放報名。'}</p>}<p className="hint">示範頁面，未建立正式報名或收款。</p></div></aside></div>
      <PublicEventParticipation data={participation} mode="lists"/>
    </section>
  </main>;
}
