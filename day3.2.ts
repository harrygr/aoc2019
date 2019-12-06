import R from "ramda";
import fs from "fs";
import { getPointLookup, intersection, parseInput } from "./day3";

const [wire1, wire2] = parseInput(fs.readFileSync("day3.input.txt"));

// const wire1 = "R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51";
// const wire2 = "U98,R91,D20,R16,D67,R40,U7,R15,U6,R7";
// const wire1 = "R75,D30,R83,U83,L12,D49,R71,U7,L72";
// const wire2 = "U62,R66,U55,R34,D71,R55,D58,R83";
// const wire1 = "R8,U5,L5,D3";
// const wire2 = "U7,R6,D4,L4";

const wire1Points = getPointLookup(wire1);
const wire2Points = getPointLookup(wire2);

const intersectionsArr = intersection(wire1Points)(wire2Points);

const getStepsForIntersections = (
  intersectionsLookup: Record<string, string>
) =>
  R.compose(
    R.head,
    R.reduce(
      ([stepsObj, n]: [Record<string, number>, number], point: string) =>
        R.has(point, intersectionsLookup)
          ? [R.merge({ [point]: n }, stepsObj), R.inc(n)]
          : [stepsObj, R.inc(n)],
      [{}, 1]
    )
  );

const getSteps = getStepsForIntersections(
  R.indexBy(R.identity, intersectionsArr)
);

const wire1Steps = getSteps(wire1Points);
const wire2Steps = getSteps(wire2Points);

const ds = R.compose(
  R.reduce(R.min, Number.MAX_SAFE_INTEGER),
  R.values,
  R.reduce(
    (acc, int: string) =>
      R.set(
        R.lensProp(int),
        R.add(R.prop(int, wire1Steps), R.prop(int, wire2Steps)),
        acc
      ),
    {}
  )
)(intersectionsArr);

console.log(ds);
