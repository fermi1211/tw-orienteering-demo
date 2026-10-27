import test from 'node:test';
import assert from 'node:assert/strict';
import {mediaPolicy,setImageLimit} from '../src/media-policy.js';
import {articleImageProblem} from '../src/article-images.js';
test('shared media policy defaults to thirty images and ten megabytes',()=>{
 assert.equal(mediaPolicy.maxImages,30);assert.equal(mediaPolicy.maxBytes,10*1024*1024);
 assert.equal(articleImageProblem({type:'image/png',size:mediaPolicy.maxBytes}),'');
 assert.match(articleImageProblem({type:'image/png',size:mediaPolicy.maxBytes+1}),/10 MB/);
});
test('configurable image limits reject invalid settings without mutating the current limit',()=>{
 const initial=mediaPolicy.maxImages;setImageLimit(12);assert.equal(mediaPolicy.maxImages,12);
 for(const value of [0,-1,1.5,101,'bad']){assert.throws(()=>setImageLimit(value));assert.equal(mediaPolicy.maxImages,12);}
 setImageLimit(initial);
});
