/** Framework-independent Tiptap NodeView: never interpolates untrusted HTML. */
export function articleImageView({node,editor,getPos}:any){
 const figure=document.createElement('figure'),button=document.createElement('button'),image=document.createElement('img'),caption=document.createElement('figcaption'),hint=document.createElement('span');
 button.type='button';button.className='editor-image-select';button.setAttribute('aria-label','編輯這張圖片');button.append(image);figure.append(button,caption,hint);figure.contentEditable='false';hint.className='editor-image-hint';hint.textContent='已選取圖片 · 在上方調整說明與大小';hint.hidden=true;
 const render=(current:any)=>{const selected=figure.classList.contains('is-selected');figure.className=`article-image editor-image align-${current.attrs.align||'center'}${selected?' is-selected':''}`;figure.style.width=`${Math.max(25,Math.min(100,Number(current.attrs.width)||100))}%`;image.src=current.attrs.src||'';image.alt=current.attrs.alt||'';caption.textContent=current.attrs.caption||'';caption.hidden=!current.attrs.caption;};render(node);
 const choose=()=>editor.commands.setNodeSelection(getPos());button.addEventListener('click',choose);
 return {dom:figure,update(next:any){if(next.type!==node.type)return false;node=next;render(next);return true;},selectNode(){figure.classList.add('is-selected');hint.hidden=false;},deselectNode(){figure.classList.remove('is-selected');hint.hidden=true;},stopEvent(event:any){return event.target===button||button.contains(event.target);},destroy(){button.removeEventListener('click',choose);}};
}
