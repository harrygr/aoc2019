import R from "ramda";

const opcodes = [1, 1, 1, 4, 99, 5, 6, 0, 99];

// const ans2 = R.reduceWhile((_acc, elem) => {
// return elem === 99
// }, )

const ans = opcodes.reduce((acc, item, idx) => {
  if (R.modulo(idx, 4) === 0) {
    const operate = item === 1 ? R.add : R.multiply;

    const val = operate(R.nth(idx + 1, opcodes), R.nth(idx + 2, opcodes));
    return R.update(idx + 3, val, acc);
  }
  return acc;
}, opcodes);

console.log(ans);
