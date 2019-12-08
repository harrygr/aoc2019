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

const transferSteps = (orbits: Orbits, transfers: string[], here: string) =>
  R.has(here, orbits)
    ? transferSteps(orbits, R.append(here, transfers), orbits[here])
    : transfers;

const getStepsBetween = (orbits: Orbits, a: string, b: string) => {
  const stepsFromA = transferSteps(orbits, [], a);
  const stepsFromB = transferSteps(orbits, [], b);

  return R.compose(
    R.add(-2),
    R.sum,
    R.map(R.length)
  )([R.without(stepsFromA, stepsFromB), R.without(stepsFromB, stepsFromA)]);
};

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
K)L
K)YOU
I)SAN`;

const input2 = fs.readFileSync("day6.input.txt").toString();

const res = getStepsBetween(buildOrbits(processInput(input2)), "YOU", "SAN");
console.log(res);
