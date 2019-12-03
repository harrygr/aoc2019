import R from "ramda";
import assert from "assert";
import fs from "fs";

const restoreTo1202ProgramAlarm = R.compose(R.update(2, 2), R.update(1, 12));

const processInput = R.compose(
  restoreTo1202ProgramAlarm,
  R.filter(Number.isFinite),
  R.map(parseFloat),
  R.split(","),
  R.trim,
  R.toString
);

const opcodes = processInput(fs.readFileSync("day2.input.txt"));

const opcodeWithIndex: [number, number][] = opcodes.map((val, idx) => [
  val,
  idx
]);

const isOperation = R.compose(R.equals(0), R.modulo(R.__, 4));

const isEnd = ([val, idx]: [number, number]) =>
  R.and(isOperation(idx), R.equals(99, val));

const valAt = (n: number, codes: [number, number][]) => {
  return R.head(R.nth(n, codes));
};

const valAtIndex = (idx: number, codes: [number, number][]) =>
  valAt(valAt(idx, codes), codes);

const runIntcode = R.compose(R.map(R.head), (codes: [number, number][]) =>
  R.reduceWhile(
    (_, elem) => R.not(isEnd(elem)),
    (acc, [val, idx]) => {
      if (isOperation(idx)) {
        const firstVal = valAtIndex(R.add(1, idx), acc);

        const secondVal = valAtIndex(R.add(2, idx), acc);
        const outputIdx = valAt(R.add(3, idx), acc);
        const newVal = (val === 1 ? R.add : R.multiply)(firstVal, secondVal);

        return R.update(outputIdx, [newVal, outputIdx], acc);
      }
      return acc;
    },
    codes,
    codes
  )
);

console.log(opcodes);
const ans = runIntcode(opcodeWithIndex);
console.log(ans);
