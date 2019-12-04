import R from "ramda";
import fs from "fs";

const restoreTo1202ProgramAlarm = R.compose(R.update(2, 2), R.update(1, 12));

const processInput = R.compose(
  R.filter(Number.isFinite),
  R.map(parseFloat),
  R.split(","),
  R.trim,
  R.toString
);

const opcodes = processInput(fs.readFileSync("day2.input.txt"));
const addIndex = (codes: number[]) =>
  codes.map<[number, number]>((val, i) => [val, i]);

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
        const outputIdx = valAt(R.add(3, idx), acc);
        const newVal = (val === 1 ? R.add : R.multiply)(
          valAtIndex(R.add(1, idx), acc),
          valAtIndex(R.add(2, idx), acc)
        );

        return R.update(outputIdx, [newVal, outputIdx], acc);
      }
      return acc;
    },
    codes,
    codes
  )
);

const target = 19690720;

const testValues = R.range(0, 100);

const ans = R.reduceWhile(
  R.compose(R.not, R.equals(target), R.head),
  (_, [x, y]) => [
    R.compose(
      R.head,
      runIntcode,
      addIndex,
      R.update(2, x),
      R.update(1, y)
    )(opcodes),
    y,
    x
  ],
  [0, 0, 0]
)(
  R.compose(
    R.unnest,
    R.map((x: number) => R.map(y => [x, y] as const, testValues))
  )(testValues)
);

console.log(ans);
