import { expect, test } from 'vitest'


function sum(a, b, c) {
  return a + b + c;
}

test('1 + 1', () => {
  expect(1 + 1).toBe(2);
})

test('testing sum function', () => {
  expect(sum(1, 2, 3)).toBe(6);
})