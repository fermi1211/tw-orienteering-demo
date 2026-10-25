import { sanitizeArticleDocument } from './article-model.js';

export function ArticleContent({ content }) {
  const document = sanitizeArticleDocument(content);
  function render(node, key) {
    if (node.type === 'text') return (node.marks || []).reduce((value, mark, index) => {
      const props = { key: `${key}-mark-${index}` };
      if (mark.type === 'textStyle') return <span {...props} style={mark.attrs}>{value}</span>;
      if (mark.type === 'link') return <a {...props} href={mark.attrs.href} target="_blank" rel="noopener noreferrer">{value}</a>;
      const Tag = { bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code' }[mark.type];
      return Tag ? <Tag {...props}>{value}</Tag> : value;
    }, node.text);
    if (node.type === 'horizontalRule') return <hr key={key}/>;
    if (node.type === 'hardBreak') return <br key={key}/>;
    if (node.type === 'image') return <figure key={key} className={`article-image align-${node.attrs.align}`} style={{ width: `${node.attrs.width}%` }}><img src={node.attrs.src} alt={node.attrs.alt} loading="lazy"/>{node.attrs.caption && <figcaption>{node.attrs.caption}</figcaption>}</figure>;
    const children = node.content?.map((child, index) => render(child, `${key}-${index}`));
    const Tag = { paragraph: 'p', heading: `h${node.attrs?.level || 2}`, bulletList: 'ul', orderedList: 'ol', listItem: 'li', blockquote: 'blockquote' }[node.type];
    return Tag ? <Tag key={key} style={node.attrs?.textAlign ? { textAlign: node.attrs.textAlign } : undefined} start={node.type === 'orderedList' ? node.attrs?.start : undefined}>{children}</Tag> : children;
  }
  return <div className="article-body">{document.content.map((node, index) => render(node, `node-${index}`))}</div>;
}
