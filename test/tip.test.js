import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcTip } from '../src/tip.js';

test('15% of 50 is 7.5', () => {
  assert.equal(calcTip(50, 15), 7.5);
});

test('rounds to cents', () => {
  assert.equal(calcTip(33.33, 15), 5);
});

test('0% tip is 0', () => {
  assert.equal(calcTip(80, 0), 0);
});
