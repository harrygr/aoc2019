import * as fs from "fs";
import {
  compose,
  map,
  split,
  subtract,
  divide,
  sum,
  toString,
  __,
  filter
} from "ramda";
import identity from "ramda/es/identity";

const parseFile = compose(split("\n"), toString);
const calcFuel = compose(
  subtract(__, 2),
  Math.floor,
  divide(__, 3),
  parseFloat
);

const getResult = compose(sum, map(calcFuel), filter(Boolean), parseFile);

console.log(getResult(fs.readFileSync("day1-input.txt")));
