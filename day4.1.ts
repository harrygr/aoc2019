import R from "ramda";
import { isSixDigits, has2AdjacentDigits, digitsNeverDecrease } from "./day4";

const meetsCriteria = R.allPass([
  isSixDigits,
  has2AdjacentDigits,
  digitsNeverDecrease
]);

const [start, fin] = R.map(parseFloat, R.split("-", "147981-691423"));

const countPassingValues = (start: number, end: number) =>
  R.compose(
    R.last,
    R.until(
      ([n]) => R.lte(end, n),
      ([n, count]) => [R.inc(n), meetsCriteria(n) ? R.inc(count) : count]
    )
  )([start, 0]);

console.log(countPassingValues(start, fin));
