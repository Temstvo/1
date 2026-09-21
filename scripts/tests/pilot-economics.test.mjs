import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimate } from '../pilot-economics.mjs';
const costs = {
  price: 500,
  fixedMonthly: 3000,
  variablePerUser: 50,
  feePercent: 4,
  taxPercent: 6,
  refundPercent: 0,
  acquisitionCost: 100,
  averagePaidMonths: 2,
};
test('includes acquisition cost and rounds required customers upward', () => {
  assert.deepEqual(estimate(costs), { contributionPerUser: 350, breakEvenUsers: 9 });
});
test('does not claim break-even for a negative margin', () => {
  assert.equal(estimate({ ...costs, variablePerUser: 600 }).breakEvenUsers, null);
});
test('rejects missing inputs and invalid lifetime or percentages', () => {
  assert.throws(() => estimate({}));
  assert.throws(() => estimate({ ...costs, averagePaidMonths: 0 }));
  assert.throws(() => estimate({ ...costs, feePercent: 101 }));
});
