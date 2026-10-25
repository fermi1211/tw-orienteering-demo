import { useEffect, useId, useState } from 'react';
import { Images, UploadSimple, FileText, DownloadSimple, Trash, MagnifyingGlassPlus, CaretLeft, CaretRight } from '@phosphor-icons/react';
import './attachments.css';

const empty = { images: [], documents: [] };
export const fileSize = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
function useFileUrl(file) {
  const [url, setUrl] = useState('');
  useEffect(() => { const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next); }, [file]);
  return url;
}
function ImageTile({ item, onView, onRemove, onLabel }) {
  const url = useFileUrl(item.file);
  return <article className="attachment-image">
    <button type="button" className="attachment-thumbnail" onClick={() => onView(item)} aria-label={`放大圖片：${item.label || item.file.name}`}><img src={url || undefined} alt={item.label || item.file.name}/><span><MagnifyingGlassPlus size={18}/>放大查看</span></button>
    {onLabel ? <label className="field">圖片說明<input value={item.label} maxLength={120} onChange={event => onLabel(event.target.value)} placeholder="例如：活動路線與集合位置"/></label> : <p>{item.label || item.file.name}</p>}
    {onRemove && <div className="attachment-meta"><span>{fileSize(item.file.size)}</span><button type="button" className="text-button danger-text" onClick={onRemove} aria-label={`移除圖片：${item.file.name}`}><Trash size={17}/>移除</button></div>}
  </article>;
}
function DocumentTile({ item, onRemove }) {
  const url = useFileUrl(item.file);
  return <article className="attachment-document"><FileText size={28}/><div><strong>{item.file.name}</strong><span>{item.file.name.split('.').pop().toUpperCase()} · {fileSize(item.file.size)}</span></div>{onRemove ? <button type="button" className="icon-button danger-text" onClick={onRemove} aria-label={`移除檔案：${item.file.name}`}><Trash size={20}/></button> : <a className="attachment-download" href={url || undefined} download={item.file.name} aria-label={`下載 ${item.file.name}`}><DownloadSimple size={20}/><span>下載</span></a>}</article>;
}
function FullImage({ item }) {
  const url = useFileUrl(item.file);
  return <figure className="attachment-full"><img src={url || undefined} alt={item.label || item.file.name}/><figcaption>{item.label || item.file.name}</figcaption></figure>;
}

export function EventHero({ images = [], Dialog }) {
  const [selected, setSelected] = useState(0), [viewing, setViewing] = useState(false);
  const index = Math.min(selected, images.length - 1), item = images[index];
  if (!item) return null;
  return <section className="uploaded-event-hero" aria-label="活動主圖"><HeroImage item={item} onView={() => setViewing(true)}/><div className="event-hero-caption"><span>{item.label || '主辦單位提供圖片'}</span>{images.length > 1 && <div className="event-hero-controls"><button type="button" aria-label="上一張活動圖片" onClick={() => setSelected((index - 1 + images.length) % images.length)}><CaretLeft size={20}/></button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" aria-label="下一張活動圖片" onClick={() => setSelected((index + 1) % images.length)}><CaretRight size={20}/></button></div>}</div>{viewing && <Dialog title="檢視活動圖片" onClose={() => setViewing(false)} wide><FullImage item={item}/></Dialog>}</section>;
}
function HeroImage({ item, onView }) {
  const url = useFileUrl(item.file);
  return <button type="button" className="event-hero-view" onClick={onView} aria-label={`放大活動圖片：${item.label || item.file.name}`}><img src={url || undefined} alt={item.label || item.file.name}/><span><MagnifyingGlassPlus size={19}/>放大查看</span></button>;
}
export function EventDocuments({ documents = [] }) {
  return <section className="activity-section event-downloads" aria-label="簡章下載"><h2>簡章下載</h2><p>下載主辦單位提供的活動文件。</p>{documents.length ? <div className="attachment-documents">{documents.map(item => <DocumentTile key={item.id} item={item}/>)}</div> : <p className="attachment-empty">主辦單位尚未提供可下載的簡章。</p>}</section>;
}

export function EventImageGallery({images=[],Dialog}) {
  const [viewing,setViewing]=useState(null);
  return <><div className="attachment-gallery">{images.map(item=><ImageTile key={item.id} item={item} onView={setViewing}/>)}</div>{viewing&&<Dialog title="檢視公告圖片" onClose={()=>setViewing(null)} wide><FullImage item={viewing}/></Dialog>}</>;
}

export function EventAttachments({ value = empty, Dialog, editor = false, onChange, imagesOnly=false, imageLabel='賽事圖片' }) {
  const id = useId(), [viewing, setViewing] = useState(null), [error, setError] = useState('');
  const images = value.images || [], documents = value.documents || [];
  function addFiles(event, kind) {
    const files = Array.from(event.target.files || []); event.target.value = '';
    if (!files.length) return;
    const current = kind === 'images' ? images : documents;
    const limit = kind === 'images' ? 8 : 5, maxSize = (kind === 'images' ? 10 : 20) * 1024 * 1024;
    if (current.length + files.length > limit) { setError(`每場最多 ${limit} ${kind === 'images' ? '張圖片' : '份簡章檔案'}，請移除部分附件後再選擇。`); return; }
    const invalid = files.find(file => !file.size || file.size > maxSize || (kind === 'images' ? !/^image\/(jpeg|png|webp)$/.test(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name) : !(/\.pdf$/i.test(file.name) && (!file.type || file.type === 'application/pdf') || /\.docx$/i.test(file.name) && (!file.type || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))));
    if (invalid) { setError(`「${invalid.name}」無法加入。請選擇${kind === 'images' ? '10 MB 以內的 JPG、PNG 或 WebP 圖片' : '20 MB 以內的 PDF 或 DOCX 檔案'}，且檔案不可為空。`); return; }
    setError(''); onChange({ ...value, [kind]: [...current, ...files.map(file => ({ id: crypto.randomUUID(), file, label: '' }))] });
  }
  function remove(kind, id) { setError(''); onChange({ ...value, [kind]: value[kind].filter(item => item.id !== id) }); }
  return <section className={editor ? 'event-attachments attachment-editor' : 'event-attachments'} aria-label={editor ? '上傳賽事附件' : '賽事圖片與簡章下載'}>
    {!imagesOnly&&<header><p className="eyebrow">{editor ? '賽事附件' : '活動資料'}</p><h3>{editor ? '讓參賽資訊更完整' : '圖片與簡章'}</h3><p>{editor ? '加入活動照片、路線圖及簡章，儲存後提供參賽者查看。' : '查看主辦單位提供的圖片，下載簡章掌握活動資訊。'}</p></header>}
    <div className="attachment-section-heading"><h4><Images size={21}/>{imageLabel} <span>{images.length ? `· ${images.length} 張` : ''}</span></h4>{editor && <label className="attachment-upload" htmlFor={`${id}-images`}><UploadSimple size={19}/>選擇圖片<input id={`${id}-images`} aria-label={`上傳${imageLabel}`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => addFiles(event, 'images')}/></label>}</div>
    {editor && <p className="hint">JPG、PNG、WebP；每張上限 10 MB，最多 8 張。第一張會先顯示。</p>}
    {images.length ? <div className="attachment-gallery">{images.map(item => <ImageTile key={item.id} item={item} onView={setViewing} onRemove={editor ? () => remove('images', item.id) : undefined} onLabel={editor ? label => onChange({ ...value, images: images.map(image => image.id === item.id ? { ...image, label } : image) }) : undefined}/>)}</div> : <p className="attachment-empty">{editor ? '尚未加入圖片，可上傳活動照片或路線圖。' : '主辦單位尚未提供圖片。'}</p>}
    {!imagesOnly&&<><div className="attachment-section-heading"><h4><FileText size={21}/>簡章檔案 <span>{documents.length ? `· ${documents.length} 份` : ''}</span></h4>{editor && <label className="attachment-upload" htmlFor={`${id}-documents`}><UploadSimple size={19}/>選擇檔案<input id={`${id}-documents`} aria-label="上傳簡章檔案" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple onChange={event => addFiles(event, 'documents')}/></label>}</div>
    {editor && <p className="hint">PDF、DOCX；每份上限 20 MB，最多 5 份。參賽者將以原檔名下載。</p>}
    {documents.length ? <div className="attachment-documents">{documents.map(item => <DocumentTile key={item.id} item={item} onRemove={editor ? () => remove('documents', item.id) : undefined}/>)}</div> : <p className="attachment-empty">{editor ? '尚未加入簡章檔案。' : '主辦單位尚未提供可下載的簡章。'}</p>}</>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {editor && <p className="attachment-save-note">附件會在儲存賽事後套用；草稿附件僅供後台查看。本次原型僅於瀏覽器暫存，重新整理即清除。</p>}
    {viewing && <Dialog title="檢視賽事圖片" onClose={() => setViewing(null)} wide><FullImage item={viewing}/></Dialog>}
  </section>;
}
