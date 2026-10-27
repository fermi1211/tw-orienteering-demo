import test from 'node:test';
import assert from 'node:assert/strict';
import {activityTermsText,consentError,readingAtEnd,DEFAULT_ACTIVITY_NOTICE} from '../src/consent-model.js';

test('reading remains incomplete at the beginning or middle of long terms',()=>{
  assert.equal(readingAtEnd({scrollTop:0,clientHeight:300,scrollHeight:1500}),false);
  assert.equal(readingAtEnd({scrollTop:600,clientHeight:300,scrollHeight:1500}),false);
});
test('reading completes at the bottom, allowing fractional scroll rounding',()=>{
  assert.equal(readingAtEnd({scrollTop:1200,clientHeight:300,scrollHeight:1500}),true);
  assert.equal(readingAtEnd({scrollTop:1198.5,clientHeight:300,scrollHeight:1500}),true);
  assert.equal(readingAtEnd({scrollTop:1197,clientHeight:300,scrollHeight:1500}),false);
});
test('short terms count as complete only when a visible reader fits the full content',()=>{
  assert.equal(readingAtEnd({scrollTop:0,clientHeight:300,scrollHeight:300}),true);
  assert.equal(readingAtEnd({scrollTop:0,clientHeight:0,scrollHeight:300}),false);
  assert.equal(readingAtEnd({scrollTop:0,clientHeight:0,scrollHeight:0}),false);
});
test('invalid geometry cannot unlock acceptance',()=>{
  for(const scrollTop of [-1,NaN,Infinity,undefined])assert.equal(readingAtEnd({scrollTop,clientHeight:300,scrollHeight:300}),false);
});
test('a checked checkbox cannot bypass reading and reading does not imply acceptance',()=>{
  assert.equal(consentError(false,false),'請閱讀完條款');
  assert.equal(consentError(false,true),'請閱讀完條款');
  assert.equal(consentError(true,false),'請勾選同意條款');
  assert.equal(consentError(true,true),'');
});
test('activity reading includes every term and preserves plain text and newlines',()=>{
  const event={terms:[{title:'第一條',content:'第一段\n第二段'},{title:'第二條',content:'<script>不執行</script>'}]};
  assert.equal(activityTermsText(event),'第一條\n第一段\n第二段\n\n第二條\n<script>不執行</script>');
  assert.equal(activityTermsText({terms:[]}),DEFAULT_ACTIVITY_NOTICE);
});
