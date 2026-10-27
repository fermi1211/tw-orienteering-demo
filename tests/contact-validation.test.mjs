import test from 'node:test';
import assert from 'node:assert/strict';
import {emailError, mobileError} from '../src/contact-validation.js';

test('email validation accepts common addresses, aliases and subdomains', () => {
  for (const email of ['runner@example.test', 'Runner.Name+race@sub.example.com', '  runner@example.com  ', 'runner@xn--example-9d0b.com']) assert.equal(emailError(email), '', email);
});
test('email validation rejects malformed local parts and domains', () => {
  for (const email of ['runner', 'runner@', '@example.com', 'runner@@example.com', 'run ner@example.com', 'runner@example', '.runner@example.com', 'runner.@example.com', 'run..ner@example.com', 'runner@-example.com', 'runner@example-.com', 'runner@example..com', 'runner@example.123', 'runner@example.c', 'runner@exa_mple.com', 'a'.repeat(65)+'@example.com', 'a@'+'a'.repeat(64)+'.com', 'a@' + ('a'.repeat(60)+'.').repeat(4)+'example.com']) assert.notEqual(emailError(email), '', email);
});
test('mobile validation preserves leading zeroes and accepts exactly ten digits', () => {
  for (const phone of ['0900000000', '0912345678', '0999999999', ' 0912345678 ']) assert.equal(mobileError(phone), '', phone);
});
test('mobile validation rejects other prefixes, lengths, symbols and non-ASCII digits', () => {
  for (const phone of ['0812345678', '0212345678', '091234567', '09123456789', '+886912345678', '0912-345678', '0912 345678', '09abcdefgh', '０９１２３４５６７８', 912345678]) assert.match(mobileError(phone), /09|填寫/, String(phone));
});
test('required values and emergency phone errors are explicit', () => {
  for (const value of ['', '  ', null, undefined]) {
    assert.match(emailError(value), /填寫 Email/);
    assert.match(mobileError(value, '緊急聯絡電話'), /填寫緊急聯絡電話/);
  }
  assert.match(mobileError('0212345678', '緊急聯絡電話'), /緊急聯絡電話必須是 09/);
});
