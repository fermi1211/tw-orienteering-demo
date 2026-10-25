import { optionName } from './access-model.js';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, MagnifyingGlass } from '@phosphor-icons/react';
import { articleDate, articleReadingMinutes } from './article-model.js';
import { ArticleContent } from './ArticleContent.jsx';
import './journal.css';

export function ArticleReadingSurface({ article, categories=[], preview = false }) {
  return <article className="journal-reading"><header className="journal-reading-heading"><p className="eyebrow">{optionName(categories,article.category)} {preview && '· 草稿預覽'}</p><h1>{article.title || '未命名文章'}</h1>{article.excerpt && <p className="journal-reading-excerpt">{article.excerpt}</p>}<div className="journal-byline"><span>{article.author}</span>{article.publishedAt && <time dateTime={article.publishedAt}>{articleDate(article.publishedAt)}</time>}<span><Clock size={16}/>{articleReadingMinutes(article.content)} 分鐘閱讀</span></div></header>{article.cover && <figure className="journal-reading-cover"><img src={article.cover} alt={article.coverAlt || ''}/></figure>}<ArticleContent content={article.content}/></article>;
}

function ArticleCard({ categories, article, featured, onRead }) {
  return <article className={`journal-card ${featured ? 'journal-featured' : ''}`}>
    <button className="journal-card-image" onClick={() => onRead(article.id)} aria-label={`閱讀：${article.title}`} tabIndex={-1}>{article.cover ? <img src={article.cover} alt={article.coverAlt || ''} loading={featured ? 'eager' : 'lazy'}/> : <div className="journal-no-cover"><BookOpen size={66} weight="light"/></div>}</button>
    <div className="journal-card-copy"><p className="journal-category">{optionName(categories,article.category)}{featured && <span>編輯選讀</span>}</p><h2><button onClick={() => onRead(article.id)}>{article.title}</button></h2><p className="journal-card-excerpt">{article.excerpt}</p><div className="journal-card-footer"><span>{articleDate(article.publishedAt)}<span> · {articleReadingMinutes(article.content)} 分鐘</span></span><button onClick={() => onRead(article.id)} aria-label={`繼續閱讀：${article.title}`}>繼續閱讀<ArrowRight size={18}/></button></div></div>
  </article>;
}

export function JournalPage({ categories, articles, articleId, onRead, onBack }) {
  const [category, setCategory] = useState('__all__'), [query, setQuery] = useState('');
  if (articleId) {
    const article = articles.find(item => item.id === articleId);
    return <main id="main" className="journal-detail-page"><button className="text-button journal-back" onClick={onBack}><ArrowLeft size={18}/>返回定向專欄</button>{article ? <><ArticleReadingSurface article={article} categories={categories}/><aside className="journal-read-next"><BookOpen size={26}/><div><h2>讓每一次出發，多一點理解。</h2><p>回到專欄，繼續探索定向的世界。</p></div><button className="secondary" onClick={onBack}>探索其他文章<ArrowRight size={18}/></button></aside></> : <div className="journal-empty"><BookOpen size={50}/><h1>文章尚未公開</h1><p>這篇文章可能還在編輯中，或已移下線。</p><button className="primary" onClick={onBack}>回到定向專欄</button></div>}</main>;
  }
  const visible = articles.filter(article => (category === '__all__' || article.category === category) && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <main id="main" className="journal-page"><section className="journal-hero"><div><p className="eyebrow">THE ORIENTEERING JOURNAL</p><h1>方向，從理解開始。</h1><p>從第一張地圖到下一次出發，<br className="journal-mobile-break"/>一起把好奇，走成自己的路。</p></div><div className="journal-hero-mark" aria-hidden="true"><BookOpen size={58} weight="light"/><span>觀察・閱讀・探索</span></div></section>
    <section className="journal-library" aria-label="定向知識文章"><div className="journal-library-toolbar"><nav className="journal-filters" aria-label="文章分類">{[{id:'__all__',name:'全部文章'},...categories.filter(item=>item.active||articles.some(article=>article.category===item.id))].map(item=><button key={item.id} aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}>{item.name}</button>)}</nav><label className="journal-search"><MagnifyingGlass size={19}/><input type="search" aria-label="搜尋專欄文章" placeholder="搜尋想了解的主題" value={query} onChange={event => setQuery(event.target.value)}/></label></div><p className="journal-result-count">{category==='__all__'?'全部文章':optionName(categories,category)} · {visible.length} 篇文章</p>{visible.length ? <div className="journal-grid">{visible.map((article, index) => <ArticleCard categories={categories} key={article.id} article={article} featured={index === 0 && category === '__all__' && !query} onRead={onRead}/>)}</div> : <div className="journal-empty"><BookOpen size={48} weight="light"/><h2>還沒有符合的文章</h2><p>試試其他關鍵字，或瀏覽全部文章。</p><button className="secondary" onClick={() => { setQuery(''); setCategory('__all__'); }}>查看全部文章</button></div>}<p className="journal-sample-note">目前為專欄示範內容，正式文章由編輯團隊撰寫與審閱。</p></section>
  </main>;
}
