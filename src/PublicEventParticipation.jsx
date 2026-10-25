import { defaultVisibility } from './public-event-model.js';
import './public-participation.css';

export function PublicVisibilitySettings({ value, onChange }) {
  const settings = { ...defaultVisibility, ...value };
  const change = (key, checked) => onChange({ ...settings, [key]: checked });
  return <fieldset className="public-visibility-settings"><legend>賽事資訊公開設定</legend>
    <p className="hint">各組報名人數固定顯示；下列內容儲存賽事後才套用到前台。</p>
    <div className="visibility-option"><label className="consent"><input type="checkbox" checked={settings.registrations} onChange={event => change('registrations', event.target.checked)}/>顯示已報名名單</label><p>僅公開報名者暱稱與報名組別。</p><label className="consent"><input type="checkbox" disabled={!settings.registrations} checked={settings.maskRegistrations} onChange={event => change('maskRegistrations', event.target.checked)}/>報名名單暱稱隱碼</label></div>
    <div className="visibility-option"><label className="consent"><input type="checkbox" checked={settings.startOrder} onChange={event => change('startOrder', event.target.checked)}/>顯示出發序</label><p>依組別公開暱稱與出發時間；僅顯示已儲存且完整的出發序。</p><label className="consent"><input type="checkbox" disabled={!settings.startOrder} checked={settings.maskStartOrder} onChange={event => change('maskStartOrder', event.target.checked)}/>出發序暱稱隱碼</label></div>
    <p className="hint">隱碼範例：森林旅人 → 森**人。1～2 字暱稱全隱碼；未填寫暱稱顯示「未設定暱稱」，不以姓名或管理員顯示名稱替代。出發序需於報名截止後編排並儲存。</p>
  </fieldset>;
}

export function PublicEventParticipation({ data, mode = 'all' }) {
  return <div className="public-participation">
    {mode !== 'lists' && <section className="activity-section" aria-labelledby="division-count-title"><header className="participation-heading"><div><p className="eyebrow">一起出發</p><h2 id="division-count-title">各組報名人數</h2></div><p className="participation-total">合計 <strong>{data.total}</strong> 人次</p></header><p className="participation-note">依目前有效報名計算；同一人多筆報名分別計入。</p><dl className="division-count-grid">{data.groups.map(group => <div key={group.code}><dt><span>{group.code}</span>{group.name}</dt><dd>{group.count}<small>人次</small></dd></div>)}</dl></section>}
    {mode !== 'counts' && data.showRegistrations && <section className="activity-section" aria-labelledby="public-roster-title"><h2 id="public-roster-title">已報名名單</h2><p className="participation-note">僅顯示暱稱與報名組別{data.maskRegistrations ? ' · 暱稱已隱碼' : ''}。</p>{!data.total ? <p className="participation-empty">目前尚無報名。</p> : <div className="public-group-grid">{data.groups.filter(group => group.count).map(group => <section className="public-group" key={group.code} aria-label={`${group.name}報名名單`}><h3>{group.name} <span>{group.code}</span></h3><table><thead><tr><th scope="col">暱稱</th><th scope="col">報名組別</th></tr></thead><tbody>{group.registrations.map((row, index) => <tr key={index}><td>{row.nickname}</td><td>{row.division}</td></tr>)}</tbody></table></section>)}</div>}</section>}
    {mode !== 'counts' && data.showStartOrder && <section className="activity-section" aria-labelledby="public-start-title"><h2 id="public-start-title">出發序</h2><p className="participation-note">依組別顯示暱稱與出發時間{data.maskStartOrder ? ' · 暱稱已隱碼' : ''}。</p>{!data.startOrderReady ? <p className="participation-empty">出發序尚未公布，請留意主辦單位公告。</p> : <div className="public-group-grid">{data.groups.filter(group => group.count).map(group => <section className="public-group" key={group.code} aria-label={`${group.name}出發序`}><h3>{group.name} <span>{group.code}</span></h3><table><thead><tr><th scope="col">暱稱</th><th scope="col">出發時間</th></tr></thead><tbody>{group.starts.map((row,index) => <tr key={index}><td>{row.nickname}</td><td><time>{row.time}</time></td></tr>)}</tbody></table></section>)}</div>}</section>}
  </div>;
}
