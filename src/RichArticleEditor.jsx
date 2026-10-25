import { useEffect, useRef, useState } from 'react';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { articleFonts, articleFontSizes, articleImageCount, safeArticleColor, safeArticleImage, safeArticleLink } from './article-model.js';
import { readArticleImage } from './article-images.js';

function EditorImage({ node, selected, editor, getPos }) {
  const src = safeArticleImage(node.attrs.src);
  return <NodeViewWrapper as="figure" className={`article-image editor-image align-${node.attrs.align} ${selected ? 'is-selected' : ''}`} style={{ width: `${node.attrs.width || 100}%` }} contentEditable={false}>
    <button type="button" className="editor-image-select" aria-label="編輯這張圖片" onClick={() => editor.commands.setNodeSelection(getPos())}>{src ? <img src={src} alt={node.attrs.alt || ''}/> : <span>請改用本機 JPG、PNG 或 WebP 圖片</span>}</button>
    {node.attrs.caption && <figcaption>{node.attrs.caption}</figcaption>}
    {selected && <span className="editor-image-hint">已選取圖片 · 在上方調整說明與大小</span>}
  </NodeViewWrapper>;
}
const ArticleImage = ImageExtension.extend({
  addAttributes() { return { ...this.parent?.(), caption: { default: '' }, width: { default: 100 }, align: { default: 'center' } }; },
  parseHTML() { return [{ tag: 'figure[data-article-image]', getAttrs: element => ({ src: element.querySelector('img')?.getAttribute('src'), alt: element.querySelector('img')?.getAttribute('alt') || '', caption: element.querySelector('figcaption')?.textContent || '', width: Number(element.dataset.width) || 100, align: element.dataset.align || 'center' }) }, { tag: 'img[src]' }]; },
  renderHTML({ node }) { const width = Math.max(25, Math.min(100, Number(node.attrs.width) || 100)); return ['figure', { 'data-article-image': '', 'data-width': width, 'data-align': node.attrs.align, style: `width:${width}%` }, ['img', { src: safeArticleImage(node.attrs.src) || '', alt: node.attrs.alt || '' }], ['figcaption', {}, node.attrs.caption || '']]; },
  addNodeView() { return ReactNodeViewRenderer(EditorImage); },
});

export function RichArticleEditor({ initialContent, onChange, onBusyChange, Dialog }) {
  const upload = useRef(null), uploadPosition = useRef(0);
  const [problem, setProblem] = useState(''), [busy, setBusy] = useState(false), [linkDialog, setLinkDialog] = useState(null);
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  const editor = useEditor({
    extensions: [StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3, 4] }, link: { openOnClick: false, isAllowedUri: url => Boolean(safeArticleLink(url)) } }), TextStyleKit.configure({ lineHeight: false }), TextAlign.configure({ types: ['heading', 'paragraph'] }), ArticleImage.configure({ allowBase64: true }), Placeholder.configure({ placeholder: '從這裡開始寫作，或貼上文字。選取文字後，可用上方工具列調整樣式。' })],
    content: initialContent,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: { class: 'article-body article-editable', role: 'textbox', 'aria-label': '文章內文', 'aria-multiline': 'true', spellcheck: 'false' },
      handlePaste(view, event) { const files = [...(event.clipboardData?.files || [])]; if (!files.length) return false; event.preventDefault(); void addImages(files, view.state.selection.from); return true; },
      handleDrop(view, event) { const files = [...(event.dataTransfer?.files || [])]; if (!files.length) return false; event.preventDefault(); void addImages(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos || view.state.selection.from); return true; },
      transformPastedHTML(html) { const document = new DOMParser().parseFromString(html, 'text/html'); document.querySelectorAll('script,style,iframe,object,embed,form').forEach(element => element.remove()); document.querySelectorAll('img').forEach(image => { if (!safeArticleImage(image.getAttribute('src'))) image.remove(); }); return document.body.innerHTML; },
    },
  });
  async function addImages(files, position) {
    if (!editor || editor.isDestroyed) return;
    if (articleImageCount(editor.getJSON()) + files.length > 10) { setProblem('每篇文章最多加入 10 張內文圖片。'); return; }
    setBusy(true); setProblem('');
    try {
      const sources = await Promise.all(files.map(readArticleImage));
      if (!editor.isDestroyed) editor.chain().focus().insertContentAt(Math.min(position, editor.state.doc.content.size), sources.flatMap(src => [{ type: 'image', attrs: { src, alt: '', caption: '', width: 100, align: 'center' } }, { type: 'paragraph' }])).run();
    } catch (error) { setProblem(error.message); } finally { setBusy(false); }
  }
  if (!editor) return <p className="hint">正在準備文章編輯器…</p>;
  const format = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';
  const style = editor.getAttributes('textStyle'), image = editor.isActive('image') ? editor.getAttributes('image') : null;
  function tool(label, content, command, active = false, disabled = false) { return <button type="button" className={`rich-tool ${active ? 'is-active' : ''}`} title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={event => event.preventDefault()} onClick={command}>{content}</button>; }
  function saveLink(event) { event.preventDefault(); const form = new FormData(event.currentTarget), href = safeArticleLink(String(form.get('href') || '').trim()); if (!href) { setProblem('連結請使用完整的 http:// 或 https:// 網址。'); return; } const label = String(form.get('label') || '').trim(); if (editor.state.selection.empty && label) editor.chain().focus().insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs: { href } }] }).run(); else if (editor.state.selection.empty) editor.chain().focus().insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run(); else editor.chain().focus().setLink({ href }).run(); setLinkDialog(null); setProblem(''); }
  return <div className="rich-editor">
    <div className="rich-toolbar" role="group" aria-label="文章排版工具列">
      <div className="rich-toolbar-row rich-type-options">
        <label>段落<select aria-label="段落樣式" value={format} onChange={event => event.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().setHeading({ level: Number(event.target.value.slice(1)) }).run()}><option value="p">內文</option><option value="h2">大標題</option><option value="h3">中標題</option><option value="h4">小標題</option></select></label>
        <label>字型<select aria-label="文章字型" value={articleFonts.includes(style.fontFamily) ? style.fontFamily : 'Noto Sans TC'} onChange={event => editor.chain().focus().setFontFamily(event.target.value).run()}>{articleFonts.map((font, index) => <option key={font} value={font}>{['思源黑體', '思源宋體', 'Arial', 'Georgia'][index]}</option>)}</select></label>
        <label>字級<select aria-label="文字大小" value={style.fontSize || '18px'} onChange={event => editor.chain().focus().setFontSize(event.target.value).run()}>{articleFontSizes.map(size => <option key={size} value={`${size}px`}>{size} px</option>)}</select></label>
      </div>
      <div className="rich-toolbar-row">
        {tool('粗體', <b>B</b>, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {tool('斜體', <i>I</i>, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {tool('底線', <u>U</u>, () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        <label className="rich-color" title="文字顏色"><span aria-hidden="true">A</span><input type="color" aria-label="文字顏色" value={safeArticleColor(style.color) || '#102722'} onInput={event => editor.chain().focus().setColor(event.currentTarget.value).run()} onChange={event => editor.chain().focus().setColor(event.target.value).run()}/></label>
        <label className="rich-color rich-highlight" title="螢光底色"><span aria-hidden="true">螢</span><input type="color" aria-label="螢光底色" value={safeArticleColor(style.backgroundColor) || '#fff2a8'} onInput={event => editor.chain().focus().setBackgroundColor(event.currentTarget.value).run()} onChange={event => editor.chain().focus().setBackgroundColor(event.target.value).run()}/></label>
        {tool('螢光標示', '▰', () => editor.chain().focus().setBackgroundColor('#fff2a8').run(), Boolean(style.backgroundColor))}
        {tool('清除文字格式', 'Tx', () => editor.chain().focus().unsetAllMarks().run())}
        <span className="rich-toolbar-divider"/>
        {tool('項目清單', '• ≡', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {tool('編號清單', '1. ≡', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {tool('引言', '❝', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        {tool('分割線', '―', () => editor.chain().focus().setHorizontalRule().run())}
        {tool('靠左對齊', '⇤', () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
        {tool('置中對齊', '↔', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
        {tool('靠右對齊', '⇥', () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
        {tool('加入連結', '連結', () => { setProblem(''); setLinkDialog({ href: editor.getAttributes('link').href || '' }); }, editor.isActive('link'))}
        {tool('移除連結', '斷鏈', () => editor.chain().focus().unsetLink().run(), false, !editor.isActive('link'))}
        <span className="rich-toolbar-divider"/>
        {tool('復原', '↶', () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
        {tool('重做', '↷', () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
        <button type="button" className="rich-add-image" disabled={busy} onClick={() => { uploadPosition.current = editor.state.selection.from; upload.current.click(); }}>{busy ? '讀取圖片中…' : '＋ 加入圖片'}</button>
        <input ref={upload} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden aria-label="文章內文圖片" onChange={event => { const files = [...event.target.files]; event.target.value = ''; if (files.length) void addImages(files, uploadPosition.current); }}/>
      </div>
    </div>
    {image && <section className="rich-image-settings" aria-label="選取圖片設定"><header><strong>圖片設定</strong><button type="button" className="text-button danger-text" onClick={() => editor.chain().focus().deleteNode('image').run()}>移除圖片</button></header><div className="rich-image-fields"><label className="field">圖片描述（顯示在圖下）<input value={image.caption || ''} maxLength={500} onInput={event => editor.commands.updateAttributes('image', { caption: event.currentTarget.value })} onChange={event => editor.commands.updateAttributes('image', { caption: event.target.value })}/></label><label className="field">替代文字（供閱讀輔助）<input value={image.alt || ''} maxLength={250} onInput={event => editor.commands.updateAttributes('image', { alt: event.currentTarget.value })} onChange={event => editor.commands.updateAttributes('image', { alt: event.target.value })}/></label></div><div className="rich-image-fields"><label className="field">圖片大小：{image.width || 100}%<input type="range" min="25" max="100" step="5" aria-label="圖片大小" value={image.width || 100} onInput={event => editor.commands.updateAttributes('image', { width: Number(event.currentTarget.value) })} onChange={event => editor.commands.updateAttributes('image', { width: Number(event.target.value) })}/></label><label className="field">圖片對齊<select value={image.align || 'center'} onChange={event => editor.commands.updateAttributes('image', { align: event.target.value })}><option value="left">靠左</option><option value="center">置中</option><option value="right">靠右</option></select></label></div><p>寬度依文章可用空間等比例調整，手機會自動縮放。</p></section>}
    {problem && <p className="form-error rich-error" role="alert">{problem}</p>}
    <EditorContent editor={editor}/>
    <p className="rich-editor-help">可直接貼上文字、貼上或拖入圖片。JPG／PNG／WebP，每張 5 MB、每篇最多 10 張；選取圖片即可調整。Ctrl／⌘ Z 復原。</p>
    {linkDialog && <Dialog title="加入文章連結" onClose={() => { setLinkDialog(null); setProblem(''); }}><form onSubmit={saveLink}><label className="field">網址<input name="href" type="url" defaultValue={linkDialog.href} placeholder="https://" required/></label>{editor.state.selection.empty && <label className="field">顯示文字（選填）<input name="label"/></label>}{problem && <p className="form-error" role="alert">{problem}</p>}<button type="submit" className="primary">套用連結</button></form></Dialog>}
  </div>;
}
