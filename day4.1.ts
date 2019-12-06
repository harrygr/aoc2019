import R from "ramda";

const isSixDigits = R.compose(R.equals(6), R.prop("length"), R.toString);

const has2AdjacentDigits = R.compose(
  R.head,
  R.reduceWhile(
    R.compose(R.not, R.head),
    ([, prev], el: string) => [R.equals(prev, el), el],
    [false, ""]
  ),
  R.split(""),
  R.toString
);

const digitsNeverDecrease = R.compose(
  R.not,
  R.head,
  R.reduceWhile(
    R.compose(R.not, R.head),
    ([, prev], el: number) => [R.gt(prev, el), el],
    [false, 0]
  ),
  R.map(parseFloat),
  R.split(""),
  R.toString
);

const meetsCriteria = R.allPass([
  isSixDigits,
  has2AdjacentDigits,
  digitsNeverDecrease
]);

const [start, fin] = R.map(parseFloat, R.split("-", "147981-691423"));

const countPassingValues = R.compose(
  R.last,
  R.until(
    ([n]) => R.lte(fin, n),
    ([n, count]) => [R.inc(n), meetsCriteria(n) ? R.inc(count) : count]
  )
);

console.log(countPassingValues([start, 0]));
