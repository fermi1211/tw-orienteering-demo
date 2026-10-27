import { sanitizeArticleDocument } from './article-model.js';
const escape=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function articleHtml(content){
 const render=(node)=>{
  if(node.type==='text')return (node.marks||[]).reduce((value,mark)=>{
   if(mark.type==='textStyle'){const styles=Object.entries(mark.attrs||{}).map(([key,value])=>`${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${escape(value)}`).join(';');return `<span style="${styles}">${value}</span>`;}
   if(mark.type==='link')return `<a href="${escape(mark.attrs.href)}" target="_blank" rel="noopener noreferrer">${value}</a>`;
   const tag={bold:'strong',italic:'em',underline:'u',strike:'s',code:'code'}[mark.type];return tag?`<${tag}>${value}</${tag}>`:value;
  },escape(node.text));
  if(node.type==='horizontalRule')return '<hr>';if(node.type==='hardBreak')return '<br>';
  if(node.type==='image')return `<figure class="article-image align-${escape(node.attrs.align)}" style="width:${node.attrs.width}%"><img src="${escape(node.attrs.src)}" alt="${escape(node.attrs.alt)}" loading="lazy">${node.attrs.caption?`<figcaption>${escape(node.attrs.caption)}</figcaption>`:''}</figure>`;
  const children=(node.content||[]).map(render).join(''),tag={paragraph:'p',heading:`h${node.attrs?.level||2}`,bulletList:'ul',orderedList:'ol',listItem:'li',blockquote:'blockquote'}[node.type];
  return tag?`<${tag}${node.attrs?.textAlign?` style="text-align:${escape(node.attrs.textAlign)}"`:''}${node.type==='orderedList'&&node.attrs?.start?` start="${node.attrs.start}"`:''}>${children}</${tag}>`:children;
 };
 return sanitizeArticleDocument(content).content.map(render).join('');
}
