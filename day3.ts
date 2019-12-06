import R from "ramda";

type Direction = "U" | "D" | "L" | "R";
type Instruction = [Direction, number];
type Point = [number, number];

export const parseInput = R.compose(
  R.filter(Boolean),
  R.split("\n"),
  R.toString
);

const parseInstruction = R.compose(R.adjust(1, Number), R.splitAt(1)) as (
  i: string
) => Instruction;

const parseWire = R.compose(R.map(parseInstruction), R.split(","));

/**
 * Get the next point from walking 1 unit in `direction` from
 * the point given
 */
export const nextPoint = R.curry(
  (direction: Direction, [x, y]: Point): Point => {
    return R.cond([
      [R.equals("U"), () => [x, y + 1]],
      [R.equals("D"), () => [x, y - 1]],
      [R.equals("L"), () => [x - 1, y]],
      [R.equals("R"), () => [x + 1, y]]
    ])(direction);
  }
);

const processInstruction = (
  start: Point,
  [direction, distance]: Instruction
): Point[] => {
  const walk = nextPoint(direction);
  const [, newpoints] = R.until(
    R.compose(R.equals(0), R.head),
    ([d, points, lastPoint]: [number, Point[], Point]): [
      number,
      Point[],
      Point
    ] => {
      const newPoint = walk(lastPoint);

      return [d - 1, R.concat(points, [newPoint]), newPoint];
    },
    [distance, [], start]
  );

  return newpoints;
};

/**
 * transform a list of instructions to a list of points
 *
 * @example toPoints(['R2', 'U1']) -> [[0,0], [1,0], [2,0], [2,1]]
 */
const toPoints = R.reduce(
  (acc: Point[], ins: Instruction) =>
    R.concat(acc, processInstruction(R.last(acc), ins)),
  [[0, 0]]
);

export const toPointLookup = R.map(R.join(","));
export const fromPointLookup = R.compose(R.map(Number), R.split(","));

export const getPointLookup = R.compose(
  R.drop(1),
  toPointLookup,
  toPoints,
  parseWire
);

const manhattanDistance = R.compose(R.sum, R.map(Math.abs));

export const getManhattans = R.map(
  R.compose(manhattanDistance, fromPointLookup)
);

/**
 * Efficient intersection by converting the first array to a keyed object
 * so items can be looked up in linear time
 */
export const intersection = (arr1: string[]) =>
  R.filter(R.has(R.__, R.indexBy(R.identity, arr1)));
