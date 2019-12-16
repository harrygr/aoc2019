import R from "ramda";
import fs from "fs";

type Point = [number, number];

const toGrid = R.compose(R.map(R.split("")), R.split("\n"));

const reduceIndexed = R.addIndex(R.reduce);

const toAsteriodList = reduceIndexed(
  (prev: Point[], row: string[], y): Point[] =>
    R.concat(
      prev,
      reduceIndexed(
        (ll: Point[], p: string, x): Point[] =>
          R.concat(p === "#" ? [[x, y]] : [], ll),
        [],
        row
      ) as Point[]
    ),
  []
) as (s: string[][]) => Point[];

const gcd = (a: number, b: number) => (R.equals(0) ? a : gcd(b, a % b));

const simplifySlope = ([x, y]: Point) =>
  R.map(R.divide(R.__, Math.abs(gcd(x, y))), [x, y]);

const toKey = R.join(",");

const isDifferentPointTo = (p: Point) =>
  R.compose(R.not, R.equals(toKey(p)), toKey);

/**
 * Returns a function that takes a point and returns the number of all other
 * asteroids that are directly observable from the given point
 *
 * @example makeAsteroidObserver([[1,0], [2,0]])([0,0]) // 1
 */
const makeAsteroidObservableCounter = (asteroidList: Point[]) => (p: Point) =>
  R.compose(
    R.add(0), // for the typechecker
    R.length,
    R.uniqBy(toKey),
    R.map(
      R.compose(simplifySlope, R.zipWith<number, number, number>(R.subtract, p))
    ),
    R.filter<number[], "array">(isDifferentPointTo(p))
  )(asteroidList);

const toCountOfObservables = (countObserables: (p: Point) => number) =>
  R.reduce<Point, Record<string, number>>(
    (counts, point) => R.assoc(toKey(point), countObserables(point), counts),
    {}
  );

// const m = `.#..#
// .....
// #####
// ....#
// ...##`;

const m = fs.readFileSync("day10.input.txt").toString();

const asteroidList = R.compose(toAsteriodList, toGrid)(m);

const res = toCountOfObservables(makeAsteroidObservableCounter(asteroidList))(
  asteroidList
);

console.log(R.compose(R.reduce(R.max, 0), R.values)(res));
