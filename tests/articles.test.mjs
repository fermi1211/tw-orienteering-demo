import test from 'node:test';
import assert from 'node:assert/strict';
import { articleHasDraftChanges, articleImageCount, articlePublishErrors, articleReadingMinutes, articleText, initialArticles, normalizeArticle, publicArticles, safeArticleColor, safeArticleImage, safeArticleLink, sanitizeArticleDocument, saveArticleRecord } from '../src/article-model.js';
import { articleImageProblem } from '../src/article-images.js';

const content = { type:'doc', content:[{ type:'heading', attrs:{level:2,textAlign:'center'}, content:[{type:'text',text:'排版標題'}] },{type:'paragraph',content:[{type:'text',text:'內文測試',marks:[{type:'bold'},{type:'italic'},{type:'underline'},{type:'textStyle',attrs:{fontFamily:'Noto Serif TC',fontSize:'24px',color:'#194f3c',backgroundColor:'#fff2a8'}}]}]},{type:'horizontalRule'},{type:'image',attrs:{src:'./assets/journal-map.svg',caption:'地圖描述',alt:'地圖替代文字',width:50,align:'right'}}] };
const draft = { title:'測試文章',excerpt:'文章摘要',author:'編輯部',category:'讀圖技巧',content };
test('all requested text and image styles survive normalization',()=>{
  const safe=normalizeArticle(draft);
  assert.equal(safe.content.content[0].attrs.textAlign,'center');
  assert.deepEqual(safe.content.content[1].content[0].marks,content.content[1].content[0].marks);
  assert.equal(safe.content.content[2].type,'horizontalRule');
  assert.deepEqual(safe.content.content[3].attrs,content.content[3].attrs);
  assert.equal(articleImageCount(safe.content),1);
});
test('public documents whitelist nodes, attributes and styles, reject unsafe URL schemes',()=>{
  const malicious={type:'doc',content:[{type:'script',content:[{type:'text',text:'alert(1)'}]},{type:'image',attrs:{src:'javascript:alert(1)',onerror:'alert(1)'}},{type:'paragraph',attrs:{textAlign:'url(evil)'},content:[{type:'text',text:'安全文字',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}},{type:'textStyle',attrs:{fontSize:'999px',fontFamily:'evil',backgroundColor:'url(evil)',color:'#f00',onclick:'evil'}}]}]}]};
  const safe=sanitizeArticleDocument(malicious);
  assert.equal(safe.content.length,1);
  assert.equal(safe.content[0].attrs.textAlign,'left');
  assert.deepEqual(safe.content[0].content[0].marks,[{type:'textStyle',attrs:{color:'#ff0000'}}]);
  assert.equal(JSON.stringify(safe).includes('alert'),false);
  for(const url of ['javascript:alert(1)','data:text/html,evil','https://example.test/\nscript'])assert.equal(safeArticleLink(url),null);
  assert.equal(safeArticleLink('https://example.test/article'),'https://example.test/article');
  assert.equal(safeArticleImage('data:image/svg+xml;base64,AAAA'),null);
  assert.equal(safeArticleImage('https://example.test/tracking.png'),null);
  assert.equal(safeArticleImage('../assets/secret.png'),null);
  assert.equal(safeArticleImage('data:image/png;base64,AAAA'),'data:image/png;base64,AAAA');
});
test('saving a draft never changes the public version; publishing is explicit',()=>{
  const published=saveArticleRecord({id:'one'},draft,true,'2026-10-24T01:00:00Z');
  const updated=saveArticleRecord(published,{...draft,title:'尚未公開的標題'},false,'2026-10-25T01:00:00Z');
  assert.equal(articleHasDraftChanges(updated),true);
  assert.equal(publicArticles([updated])[0].title,'測試文章');
  assert.equal(JSON.stringify(publicArticles([updated])).includes('尚未公開的標題'),false);
  assert.equal('draft' in publicArticles([updated])[0],false);
  const next=saveArticleRecord(updated,updated.draft,true,'2026-10-25T02:00:00Z');
  assert.equal(publicArticles([next])[0].title,'尚未公開的標題');
  assert.equal(next.published.publishedAt,'2026-10-24T01:00:00Z');
  assert.equal(next.published.updatedAt,'2026-10-25T02:00:00Z');
  assert.equal(articleHasDraftChanges(next),false);
});
test('drafts, unpublished and trashed articles never appear publicly; restoring retains the version',()=>{
  const published=saveArticleRecord({id:'published'},draft,true,'2026-10-24T01:00:00Z');
  const privateDraft=saveArticleRecord({id:'draft'},draft,false,'2026-10-25T01:00:00Z');
  const trashed={...published,id:'trashed',deletedAt:'2026-10-25T02:00:00Z'};
  const unpublished={...published,id:'unpublished',published:null};
  assert.deepEqual(publicArticles([published,privateDraft,trashed,unpublished]).map(article=>article.id),['published']);
  assert.equal(publicArticles([{...trashed,deletedAt:null}])[0].title,draft.title);
  assert.equal(publicArticles(initialArticles).length,3);
});
test('empty content, missing titles and excessive images block publication while drafts remain possible',()=>{
  assert.match(articlePublishErrors({...draft,title:''}).join(' '),/標題/);
  assert.match(articlePublishErrors({...draft,content:{type:'doc',content:[{type:'paragraph'}]}}).join(' '),/內容/);
  assert.throws(()=>saveArticleRecord({id:'empty'},{title:'',content:{type:'doc'}},true),/標題/);
  assert.equal(saveArticleRecord({id:'empty'},{title:'',content:{type:'doc'}},false).published,null);
  const images=Array.from({length:31},()=>content.content[3]);
  assert.match(articlePublishErrors({...draft,content:{type:'doc',content:images}}).join(' '),/30 張/);
  assert.deepEqual(articlePublishErrors(draft),[]);
});
test('image file limits and stored sizes keep article figures responsive',()=>{
  assert.match(articleImageProblem({type:'image/svg+xml',size:500}),/JPG/);
  assert.match(articleImageProblem({type:'image/png',size:11*1024*1024}),/10 MB/);
  assert.match(articleImageProblem({type:'image/jpeg',size:0}),/為空/);
  assert.match(articleImageProblem({type:'image/webp',size:1024}),/JPG/);
  assert.equal(articleImageProblem({type:'image/png',size:10*1024*1024}),'');
  const safe=sanitizeArticleDocument({type:'doc',content:[{...content.content[3],attrs:{...content.content[3].attrs,width:999,align:'evil'}}]});
  assert.equal(safe.content[0].attrs.width,100);
  assert.equal(safe.content[0].attrs.align,'center');
});
test('color parsing, reading estimate and depth bounds handle pasted content safely',()=>{
  assert.equal(safeArticleColor('rgb(25, 79, 60)'),'#194f3c');
  assert.equal(safeArticleColor('rgb(300, 1, 1)'),null);
  assert.equal(safeArticleColor('#abc'),'#aabbcc');
  assert.equal(articleReadingMinutes({type:'doc',content:[{type:'text',text:'字'.repeat(701)}]}),3);
  assert.match(articleText(content),/地圖描述/);
  let node={type:'text',text:'過深'};for(let index=0;index<30;index++)node={type:'blockquote',content:[node]};
  assert.equal(JSON.stringify(sanitizeArticleDocument({type:'doc',content:[node]})).includes('過深'),false);
});

test('article draft previews tolerate missing dates without preventing dialog initialization',async()=>{
 const {articleDate}=await import('../src/article-model.js');
 assert.equal(articleDate(undefined),'尚未發布');assert.equal(articleDate('invalid'),'尚未發布');assert.equal(articleDate('2026-10-28T00:00:00+08:00'),'2026/10/28');
});
