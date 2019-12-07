import R from "ramda";
import {
  isSixDigits,
  has2AdjacentDigits,
  digitsNeverDecrease,
  hasRepeatedDigitsNotPartOfLargerGroup
} from "./day4";

const meetsCriteria = R.allPass([
  isSixDigits,
  has2AdjacentDigits,
  digitsNeverDecrease,
  hasRepeatedDigitsNotPartOfLargerGroup
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
