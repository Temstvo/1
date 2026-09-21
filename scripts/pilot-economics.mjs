import { pathToFileURL } from 'node:url';
export function estimate({
  price,
  fixedMonthly,
  variablePerUser,
  feePercent,
  taxPercent,
  refundPercent,
  acquisitionCost,
  averagePaidMonths,
}) {
  const values = [
    price,
    fixedMonthly,
    variablePerUser,
    feePercent,
    taxPercent,
    refundPercent,
    acquisitionCost,
    averagePaidMonths,
  ];
  if (
    values.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0) ||
    price === 0 ||
    averagePaidMonths === 0 ||
    feePercent + taxPercent + refundPercent > 100
  )
    throw new Error(
      'Use nonnegative finite inputs, positive price/lifetime and combined percentages <= 100',
    );
  const contribution =
    price * (1 - (feePercent + taxPercent + refundPercent) / 100) -
    variablePerUser -
    acquisitionCost / averagePaidMonths;
  return {
    contributionPerUser: Number(contribution.toFixed(2)),
    breakEvenUsers: contribution > 0 ? Math.ceil(fixedMonthly / contribution) : null,
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(estimate(JSON.parse(process.argv[2] || '{}')), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
