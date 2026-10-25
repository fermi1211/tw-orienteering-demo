import { useEffect, useState } from 'react';
import { DownloadSimple, ArrowUp, ArrowDown, Plus, Trash, CheckCircle, LockSimple, ArrowCounterClockwise } from '@phosphor-icons/react';
import { activeEventRows, registrationClosed, createStartOrder, assignStartDivision, syncStartOrder, entryName, moveStartEntry, generateSectionTimes, validateStartOrder, startReportSections } from './event-export-model.js';
import { renderRosterImages } from './roster-image.js';
import './event-exports.css';

function ImagePreview({kind,event,rows,settings,disabled}) {
  const [pages,setPages]=useState([]),[index,setIndex]=useState(0),[busy,setBusy]=useState(true),[error,setError]=useState('');
  const signature=JSON.stringify({kind,eventName:event.name,date:event.starts,rows,settings});
  useEffect(()=>{
    let cancelled=false,created=[];setBusy(true);setError('');
    const timer=setTimeout(()=>{renderRosterImages(kind,event,rows,settings).then(next=>{if(cancelled){next.forEach(page=>URL.revokeObjectURL(page.url));return;}created=next;setPages(next);setBusy(false);}).catch(()=>{if(!cancelled){setError('圖片預覽無法產生，請檢查表單內容後重試。');setBusy(false);}});},120);
    return()=>{cancelled=true;clearTimeout(timer);created.forEach(page=>URL.revokeObjectURL(page.url));};
  },[signature]);
  const pageIndex=Math.min(index,Math.max(0,pages.length-1)),page=pages[pageIndex];
  const filename=`${event.name.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,60)}-${kind==='entry'?'組別名單':'出發序'}-${pageIndex+1}.png`;
  return <section className="export-preview" aria-label={kind==='entry'?'組別表圖片預覽':'出發序圖片預覽'}><header><div><h3>圖片預覽</h3><p>藍底名單／分色出發序，長名單會自動分頁。</p></div>{page&&!busy&&!disabled&&!error?<a className="primary export-png-link" href={page.url} download={filename}><DownloadSimple size={19}/>下載本頁 PNG</a>:<button className="primary" disabled><DownloadSimple size={19}/>{busy?'產生預覽中':'下載本頁 PNG'}</button>}</header>
    {pages.length>1&&<div className="export-page-controls"><button className="secondary" onClick={()=>setIndex(Math.max(0,pageIndex-1))} disabled={!pageIndex}>上一頁</button><span>第 {pageIndex+1}／{pages.length} 張</span><button className="secondary" onClick={()=>setIndex(Math.min(pages.length-1,pageIndex+1))} disabled={pageIndex===pages.length-1}>下一頁</button></div>}
    {error?<p role="alert" className="form-error">{error}</p>:page?<div className={busy?'export-image-wrap is-busy':'export-image-wrap'} aria-busy={busy}><img src={page.url} alt={`${settings.title}，第 ${pageIndex+1} 張，${rows.length} 筆有效報名；完整文字可於報名名單或出發序編輯欄位閱讀。`}/></div>:<p className="hint" role="status">{busy?'正在產生圖片預覽…':'尚無可預覽內容，請先完成分區與名單設定。'}</p>}
    {page&&<p className="export-image-meta">PNG · {page.width} × {page.height} px · {pages.length} 張；每頁分別下載。</p>}
  </section>;
}

function StartOrderEditor({event,rows,saved,onSave,Dialog}) {
  const [draft,setDraft]=useState(()=>syncStartOrder(saved||createStartOrder(event),rows));
  const [message,setMessage]=useState(''),[error,setError]=useState(''),[regenerate,setRegenerate]=useState(null),[mode,setMode]=useState('edit');
  const order=syncStartOrder(draft,rows),errors=validateStartOrder(order,rows),rowMap=new Map(rows.map(row=>[row.id,row]));
  const assigned=new Set(order.sections.flatMap(section=>section.entries.map(entry=>entry.recordId)));
  const unassigned=rows.filter(row=>!assigned.has(row.id));
  const divisionChoices=[...new Set([...event.divisions,...rows.map(row=>row.division)])];
  const changed=JSON.stringify(order)!==JSON.stringify(saved||syncStartOrder(createStartOrder(event),rows));
  function changeOrder(next){setDraft(next);setMessage('');setError('');}
  function changeSection(id,patch){changeOrder({...order,sections:order.sections.map(section=>section.id===id?{...section,...patch}:section)});}
  function changeEntry(sectionId,recordId,patch){changeOrder({...order,sections:order.sections.map(section=>section.id===sectionId?{...section,entries:section.entries.map(entry=>entry.recordId===recordId?{...entry,...patch}:entry)}:section)});}
  function generate(section){try{const next=generateSectionTimes(section);changeSection(section.id,next);setRegenerate(null);setMessage(`已依設定產生「${section.title}」的出發時間，請檢查並儲存。`);}catch(problem){setError(problem.message);setRegenerate(null);}}
  function save(){if(errors.length){setError(errors[0]);return;}onSave(order);setMessage('出發序已儲存於本次分頁預覽。');setError('');}
  return <div className="start-order-editor"><div className="start-order-intro"><div><h2>安排出發序</h2><p>先設定分區，再安排順序與時間。此處顯示名稱供圖片匯出；前台公開出發序一律使用報名暱稱。</p></div><div className="start-header-actions"><span className="export-draft-state">{changed?'尚有未儲存變更':saved?'已儲存於本次預覽':'本次預覽草稿'}</span><button className="primary" onClick={save}><CheckCircle size={18}/>儲存目前修改</button></div></div>
    <div className="export-tabs start-mode-tabs" role="group" aria-label="出發序工作模式"><button aria-pressed={mode==='edit'} onClick={()=>setMode('edit')}>編輯出發序</button><button aria-pressed={mode==='preview'} onClick={()=>setMode('preview')}>圖片預覽與匯出</button></div>
    <div hidden={mode!=='edit'}><label className="field export-title-field">表單標題<input value={order.title} maxLength={40} onChange={event=>changeOrder({...order,title:event.target.value})}/></label>
    <p className="export-scope-note">全部 {rows.length} 筆有效報名，不受名單篩選影響；同一人多筆報名各自保留。初始依報名順序，不自動抽籤。</p>
    {order.sections.map((section,sectionIndex)=><section className={`start-section theme-${section.theme}`} key={section.id} aria-label={`出發分區 ${sectionIndex+1}`}><header><span>分區 {sectionIndex+1} · {section.entries.length} 筆報名</span><button className="text-button danger-text" onClick={()=>changeOrder({...order,detachedEntries:[...(order.detachedEntries||[]),...section.entries],sections:order.sections.filter(item=>item.id!==section.id)})}><Trash size={17}/>移除分區</button></header><div className="start-section-settings"><label className="field">分區標題<input value={section.title} maxLength={60} onChange={event=>changeSection(section.id,{title:event.target.value})}/></label><label className="field">分區配色<select value={section.theme} onChange={event=>changeSection(section.id,{theme:event.target.value})}><option value="green">森林綠</option><option value="orange">暖橘</option><option value="blue">湖水藍</option></select></label></div>
      <fieldset className="start-group-choices"><legend>納入報名組別</legend>{divisionChoices.map(code=><label key={code}><input type="checkbox" checked={section.divisions.includes(code)} onChange={event=>changeOrder(syncStartOrder(assignStartDivision(order,section.id,code,event.target.checked),rows))}/>{code}</label>)}</fieldset>
      <p className="start-group-help">所有本場組別皆可勾選；已在其他分區的組別會移至本分區，保留已編輯名稱與時間。</p>
      <div className="start-timing-settings"><label className="field">起始時間<input type="time" step="60" value={section.start} onInput={event=>changeSection(section.id,{start:event.currentTarget.value})} onChange={event=>changeSection(section.id,{start:event.target.value})}/></label><label className="field">間隔（分鐘）<input type="number" min="1" max="60" value={section.interval} onChange={event=>changeSection(section.id,{interval:event.target.value})}/></label><label className="field">同時出發人數<select value={section.parallel} onChange={event=>changeSection(section.id,{parallel:Number(event.target.value)})}>{[1,2,3,4].map(count=><option key={count} value={count}>{count} 位</option>)}</select></label><label className="field">每欄最多列數<input type="number" min="5" max="25" value={section.rowsPerColumn} onChange={event=>changeSection(section.id,{rowsPerColumn:event.target.value})}/></label></div>
      <div className="start-generate"><button className="secondary" disabled={!section.entries.length} onClick={()=>section.entries.some(entry=>entry.time)?setRegenerate(section):generate(section)}><ArrowCounterClockwise size={18}/>依設定產生時間</button><p>上下移動會交換人員，保留該位置的時間；批次排時會覆蓋本分區時間。</p></div>
      {section.entries.length?<div className="start-entry-list">{section.entries.map((entry,index)=>{const row=rowMap.get(entry.recordId);return <div className="start-entry" key={entry.recordId}><div className="start-entry-number"><strong>{String(index+1).padStart(2,'0')}</strong><span>{row.division}</span></div><label className="field">顯示名稱<input value={entryName(entry,row)} maxLength={80} onChange={event=>changeEntry(section.id,entry.recordId,{nameOverride:event.target.value})}/><span className="start-record-id">{entry.recordId}</span></label><label className="field">出發時間<input type="time" step="60" value={entry.time} onInput={event=>changeEntry(section.id,entry.recordId,{time:event.currentTarget.value})} onChange={event=>changeEntry(section.id,entry.recordId,{time:event.target.value})}/></label><div className="start-move-controls"><button className="icon-button" aria-label={`上移 ${entry.recordId}`} disabled={!index} onClick={()=>changeSection(section.id,{entries:moveStartEntry(section.entries,index,-1)})}><ArrowUp size={19}/></button><button className="icon-button" aria-label={`下移 ${entry.recordId}`} disabled={index===section.entries.length-1} onClick={()=>changeSection(section.id,{entries:moveStartEntry(section.entries,index,1)})}><ArrowDown size={19}/></button></div></div>;})}</div>:<p className="hint">此分區沒有報名者，可勾選其他未分配組別。</p>}
    </section>)}
    <button className="secondary" onClick={()=>changeOrder({...order,sections:[...order.sections,{id:crypto.randomUUID(),title:'新分區',theme:'blue',divisions:[],start:'09:00',interval:1,parallel:1,rowsPerColumn:13,entries:[]}]})}><Plus size={18}/>新增出發分區</button>
    {unassigned.length>0&&<p className="form-error" role="alert">尚有 {unassigned.length} 筆報名未分配（{[...new Set(unassigned.map(row=>row.division))].join('、')}），請將組別加入分區。</p>}
    </div>{error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="export-success" role="status"><CheckCircle size={20}/>{message}</p>}
    <div className="start-save"><p>切換頁面前請儲存；本次分頁保留，重新整理後清除。</p><button className="primary" onClick={save}><CheckCircle size={20}/>儲存出發序</button></div>
    {errors.length>0&&<p className="export-validation">尚有 {errors.length} 項待完成：{errors[0]} 完成後可下載圖片。</p>}
    <div hidden={mode!=='preview'}><ImagePreview kind="start" event={event} rows={rows} settings={{...order,sections:startReportSections(order,rows)}} disabled={errors.length>0}/></div>
    {regenerate&&<Dialog title="重新產生出發時間？" onClose={()=>setRegenerate(null)}><p>將依「{regenerate.title}」的起始時間、間隔與同時出發人數，覆蓋本分區現有時間；目前的人員順序與顯示名稱保留。</p><div className="admin-editor-actions"><button className="secondary" onClick={()=>setRegenerate(null)}>保留現有時間</button><button className="primary" onClick={()=>generate(regenerate)}>確認重新排時</button></div></Dialog>}
  </div>;
}

export function EventExports({catalog,event,rows,onEventChange,tab,onTabChange,saved,onSave,Dialog}) {
  const [entrySettings,setEntrySettings]=useState({title:'Entry List',rowsPerColumn:13});
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  const entries=activeEventRows(rows,event.id),closed=registrationClosed(event,now);
  return <div className="event-exports"><div className="export-event-select"><label className="field">匯出賽事<select value={event.id} onChange={input=>onEventChange(input.target.value)}>{catalog.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><p>{event.status==='DRAFT'?'草稿':closed?'報名已截止':'報名尚未截止'} · {event.closes?.replace('T',' ')}（台灣時間）</p></div>
    <div className="export-tabs" role="group" aria-label="匯出表單類型"><button aria-pressed={tab==='entry'} onClick={()=>onTabChange('entry')}>組別名單表</button><button aria-pressed={tab==='start'} onClick={()=>onTabChange('start')}>出發序</button></div>
    {event.status!=='PUBLISHED'?<div className="export-locked"><LockSimple size={32}/><h2>請先發布賽事</h2><p>草稿尚未提供公告表單匯出。</p></div>:tab==='entry'?<><div className="export-entry-intro"><h2>依組別整理報名名單</h2><p>每組一欄，超過每欄人數會自動續欄；僅顯示報名顯示名稱。</p></div><div className="entry-export-settings"><label className="field">表單標題<input maxLength={40} value={entrySettings.title} onChange={input=>setEntrySettings({...entrySettings,title:input.target.value})}/></label><label className="field">每欄最多人數<input type="number" min="5" max="25" value={entrySettings.rowsPerColumn} onChange={input=>setEntrySettings({...entrySettings,rowsPerColumn:input.target.value})}/></label></div><p className="export-scope-note">本場全部 {entries.length} 筆有效報名，未套用名單篩選；已刪除／停用紀錄不列入。同一人多筆報名各自保留。</p>{!entries.length&&<p className="hint">本場尚無有效報名，可先至「報名名單」新增。</p>}<ImagePreview kind="entry" event={event} rows={entries} settings={entrySettings} disabled={!entries.length||!entrySettings.title.trim()||!Number.isInteger(Number(entrySettings.rowsPerColumn))||Number(entrySettings.rowsPerColumn)<5||Number(entrySettings.rowsPerColumn)>25}/></>:!closed?<div className="export-locked"><LockSimple size={32}/><h2>報名截止後開放安排出發序</h2><p>本場截止時間為 {event.closes.replace('T',' ')}（台灣時間）。</p><p>可切換至「秋日定向賽（已截止示範）」試用完整排程。</p></div>:<StartOrderEditor key={event.id} event={event} rows={entries} saved={saved} onSave={onSave} Dialog={Dialog}/>}
  </div>;
}
