import R from "ramda";
import fs from "fs";

const processInput = R.compose(
  R.map(R.split(")")),
  R.filter(Boolean),
  R.split("\n")
) as (s: string) => [string, string][];

type Orbits = Record<string, string>;

const buildOrbits = R.reduce(
  (acc, [prim, sat]) => R.set(R.lensProp(sat), prim, acc),
  {}
);

const orbitCount = R.curry((orbits: Orbits, here: string): number =>
  R.has(here, orbits) ? 1 + orbitCount(orbits, orbits[here]) : 0
);

const input = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;

const input2 = fs.readFileSync("day6.input.txt").toString();

const orbits = buildOrbits(processInput(input2));

const c = R.sum(R.map(orbitCount(orbits), Object.keys(orbits)));
console.log(c);
