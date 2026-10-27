import test from 'node:test';
import assert from 'node:assert/strict';
import {articleHtml} from '../src/article-html.js';
const document=content=>({type:'doc',content});
test('Angular article rendering escapes user text and drops unsafe links, images and style properties',()=>{
 const html=articleHtml(document([{type:'paragraph',content:[{type:'text',text:'<img src=x onerror=alert(1)> & "測試"',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}},{type:'textStyle',attrs:{color:'red;background:url(x)',fontFamily:'Arial;position:fixed',fontSize:'999px'}}]}]},{type:'image',attrs:{src:'https://example.test/private.png',caption:'hidden'}}]));
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);assert.match(html,/&amp; &quot;測試&quot;/);assert.doesNotMatch(html,/<img|<a|style=".*url|javascript:/);
});
test('formatted articles retain valid marks, image descriptions and constrained layout',()=>{
 const html=articleHtml(document([{type:'heading',attrs:{level:3,textAlign:'center'},content:[{type:'text',text:'定向知識',marks:[{type:'bold'},{type:'textStyle',attrs:{fontSize:'24px',color:'#194f3c',backgroundColor:'#fff2a8'}}]}]},{type:'image',attrs:{src:'./assets/forest-tablet.png',alt:'森林"示意',caption:'圖說 <script>',width:250,align:'right'}},{type:'horizontalRule'}]));
 assert.match(html,/<h3 style="text-align:center">/);assert.match(html,/<strong>定向知識<\/strong>/);assert.match(html,/font-size:24px/);assert.match(html,/background-color:#fff2a8/);assert.match(html,/width:100%/);assert.match(html,/alt="森林&quot;示意"/);assert.match(html,/<figcaption>圖說 &lt;script&gt;<\/figcaption>/);assert.match(html,/<hr>/);
});
test('public links are escaped and open with isolation while list start values are sanitized',()=>{
 const html=articleHtml(document([{type:'orderedList',attrs:{start:99999},content:[{type:'listItem',content:[{type:'paragraph',content:[{type:'text',text:'活動資訊',marks:[{type:'link',attrs:{href:'https://example.test/?a=1&b=2'}}]}]}]}]}]));
 assert.match(html,/<ol start="999">/);assert.match(html,/href="https:\/\/example.test\/\?a=1&amp;b=2"/);assert.match(html,/rel="noopener noreferrer"/);
});
