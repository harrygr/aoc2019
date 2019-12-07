import R from "ramda";

export const toDigitList = R.compose(
  R.map(parseFloat),
  R.split(""),
  R.toString
);

export const isSixDigits = R.compose(R.equals(6), R.prop("length"), R.toString);

export const has2AdjacentDigits = R.compose(
  R.head,
  R.reduceWhile(
    R.compose(R.not, R.head),
    ([, prev], el) => [R.equals(prev, el), el],
    [false, ""]
  ),
  toDigitList
);

export const digitsNeverDecrease = R.compose(
  R.not,
  R.head,
  R.reduceWhile(
    R.compose(R.not, R.head),
    ([, prev], el: number) => [R.gt(prev, el), el],
    [false, 0]
  ),
  toDigitList
);

const lookup = R.map(
  R.compose(R.join(""), R.repeat(R.__, 2) as any),
  R.range(0, 10)
);

export const hasRepeatedDigitsNotPartOfLargerGroup = R.compose(
  (s: string) =>
    R.any(
      d => R.contains(d, s) && R.not(R.contains(R.concat(d, R.head(d)), s)),
      lookup
    ),
  R.toString
);
