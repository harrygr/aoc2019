import R from "ramda";
import fs from "fs";
import { getPointLookup, getManhattans, intersection } from "./day3";

// const [wire1, wire2] = parseInput(fs.readFileSync("day3.input.txt"));
const wire1 = "R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51";
const wire2 = "U98,R91,D20,R16,D67,R40,U7,R15,U6,R7";

const wire1Points = getPointLookup(wire1);
const wire2Points = getPointLookup(wire2);

const intersections = intersection(wire1Points)(wire2Points);

const distances = getManhattans(intersections);

const minDistance = R.reduce(R.min, 99999, distances);

console.log("min distance", minDistance);
