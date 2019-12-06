import R from "ramda";
import fs from "fs";

type Direction = "U" | "D" | "L" | "R";
type Instruction = [Direction, number];
type Point = [number, number];

const parseInstruction = R.compose(R.adjust(1, Number), R.splitAt(1)) as (
  i: string
) => Instruction;

const parseWire = R.compose(R.map(parseInstruction), R.split(","));

const directionIs = (d: Direction) => R.compose(R.equals(d), R.head);

/**
 * Get the next point from walking according to an instruction
 */
const walk = ([x, y]: Point): ((i: Instruction) => Point) =>
  R.cond([
    [directionIs("U"), ([, d]) => [x, R.add(y, -d)]],
    [directionIs("D"), ([, d]) => [x, R.add(y, d)]],
    [directionIs("R"), ([, d]) => [R.add(x, d), y]],
    [directionIs("L"), ([, d]) => [R.add(x, -d), y]]
  ]);

/**
 * transform a list of instructions to a list of line points
 *
 * @example toPoints([['R',2], ['U',1]]) -> [[0,0], [2,0], [2,1]]
 */
const toPoints = R.reduce(
  (acc: Point[], ins: Instruction) => R.concat(acc, [walk(R.last(acc))(ins)]),
  [[0, 0]]
) as (i: Instruction[]) => Point[];

const getViewboxOrigin = R.reduce(
  ([mx, my], [x, y]: Point) => [R.min(mx, x), R.min(my, y)],
  [0, 0]
);

const getViewboxSize = ([ox, oy]: Point) =>
  R.reduce(
    ([w, h], [x, y]: Point) => [
      R.max(w, R.subtract(x, ox)),
      R.max(h, R.subtract(y, oy))
    ],
    [0, 0]
  );

const getViewBox = (points: Point[]) => {
  const [mx, my] = getViewboxOrigin(points);
  const [w, h] = getViewboxSize([mx, my])(points);
  return [mx - 3, my - 3, w + 4, h + 4];
};

const makePolylinePath = R.compose(R.join(" "), R.map(R.join(",")));
const toPolyLine = (className: string) => (points: Point[]) =>
  `<polyline points="${makePolylinePath(points)}" class="${className}" />`;

// ---

const parseInput = R.compose(R.filter(Boolean), R.split("\n"), R.toString);
// const [wire1, wire2] = parseInput(fs.readFileSync("day3.input.txt"));

// const wire1 = "R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51";
// const wire2 = "U98,R91,D20,R16,D67,R40,U7,R15,U6,R7";

const wire1 = "R75,D30,R83,U83,L12,D49,R71,U7,L72";
const wire2 = "U62,R66,U55,R34,D71,R55,D58,R83";
const lines1 = toPoints(parseWire(wire1));
const lines2 = toPoints(parseWire(wire2));

const makeSvg = (lines1: Point[], lines2: Point[]) => {
  const viewBox = getViewBox(R.concat(lines1, lines2));

  // scale the stroke width according to the viewbox size
  const strokeWidth = R.divide(
    R.mean([R.nth(2, viewBox), R.nth(3, viewBox)]),
    1000
  );

  return R.join("\n", [
    `<svg viewBox="${viewBox.join(" ")}" xmlns="http://www.w3.org/2000/svg">`,
    `<style>polyline{fill:none; stroke-width: ${strokeWidth}px;} .l1{stroke: salmon;} .l2{stroke: teal;}</style>`,
    `<circle cx="0" cy="0" r="${strokeWidth * 3}" fill="orange"/>`,
    toPolyLine("l1")(lines1),
    toPolyLine("l2")(lines2),
    `</svg>`
  ]);
};

const svg = makeSvg(lines1, lines2);

console.log(svg);

fs.writeFileSync("wires.svg", svg);
