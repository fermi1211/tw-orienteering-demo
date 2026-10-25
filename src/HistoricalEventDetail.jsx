import { ArrowLeft, CalendarBlank, MapPin } from '@phosphor-icons/react';
import { EventDocuments, EventHero, EventImageGallery } from './EventAttachments.jsx';
import { LocationMap } from './EventDetail.jsx';
import { historicalFeeLabels, materialSchemas } from './historical-event-model.js';
import './historical-events.css';

export function HistoricalMaterial({material,schema,Dialog}) {
  if(!material)return null;
  const columns=schema.columns.filter(column=>material.rows?.some(row=>row[column.key]));
  return <section className="activity-section history-public-material" aria-label={schema.title}><h2>{schema.title}</h2>{material.mode==='images'?<EventImageGallery images={material.images} Dialog={Dialog}/>:<div className="history-table-scroll" role="region" aria-label={`${schema.title}表格，可左右捲動`} tabIndex={0}><table className="history-public-table" aria-label={schema.title}><thead><tr>{columns.map(column=><th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{material.rows.map((row,index)=><tr key={index}>{columns.map(column=><td key={column.key}>{row[column.key]||'—'}</td>)}</tr>)}</tbody></table></div>}</section>;
}

export function HistoricalEventDetail({event,onBack,Dialog}) {
  if(!event)return <main id="main" className="single-event-page"><p>此歷史賽事尚未公開。</p><button className="secondary" onClick={onBack}>返回賽事列表</button></main>;
  const fees=Object.entries(event.fees || {}),hasDescription=Boolean(event.description),hasGroups=Boolean(event.divisions.length);
  return <main id="main" className="single-event-page historical-event-page"><div className="single-event-back"><button className="text-button" onClick={onBack}><ArrowLeft size={18}/>返回賽事列表</button><span>歷史賽事回顧</span></div>
    <EventHero key={event.id} images={event.attachments?.images} Dialog={Dialog}/>
    <section className="activity-data" aria-labelledby="history-title"><header className="activity-heading"><p className="eyebrow">活動資料</p><div><h1 id="history-title">{event.name}</h1><span className="activity-badge past">歷史賽事</span></div></header>
      <div className="activity-highlights history-highlights"><div><CalendarBlank size={23}/><span>活動日期<strong>{event.starts.replaceAll('-',' / ')}</strong></span></div><div><MapPin size={23}/><span>活動地點<strong>{event.location}</strong></span></div></div>
      {(hasDescription||hasGroups)&&<section className="activity-section" aria-label="活動說明"><h2>活動說明</h2>{hasDescription&&<p className="activity-description">{event.description}</p>}{hasGroups&&<dl className="activity-facts"><div><dt>參賽組別</dt><dd>{event.divisions.join(' ／ ')}</dd></div></dl>}</section>}
      {event.mapLocation&&<div className="history-map"><LocationMap event={event}/></div>}
      {Object.entries(materialSchemas).map(([key,schema])=><HistoricalMaterial key={key} material={event.materials?.[key]} schema={schema} Dialog={Dialog}/>)}
      {fees.length>0&&<section className="activity-section" aria-label="報名費用"><h2>報名費用</h2><dl className="activity-fees">{fees.map(([key,amount])=><div key={key}><dt>{historicalFeeLabels[key]}</dt><dd>NT${amount}</dd></div>)}</dl></section>}
      {event.attachments?.documents?.length>0&&<EventDocuments documents={event.attachments.documents}/>}
      {event.terms.length>0&&<section className="activity-section" aria-label="活動條款"><h2>活動條款</h2>{event.terms.map((term,index)=><div className="activity-term" key={index}><h3>{term.title}</h3><p>{term.content}</p></div>)}</section>}
    </section>
  </main>;
}
