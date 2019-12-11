import R from "ramda";
import fs from "fs";

const layerWithFewestZeros = R.compose(
  R.reduce(
    (layerWithFewestZeros, l) =>
      R.propOr(Number.MAX_SAFE_INTEGER, "0", l) <
      R.prop("0", layerWithFewestZeros)
        ? l
        : layerWithFewestZeros,
    { "0": Number.MAX_SAFE_INTEGER }
  ),
  R.map(R.countBy<string>(R.identity)),
  R.splitEvery(25 * 6),
  R.split("")
)(fs.readFileSync("day8.input.txt").toString());

console.log(layerWithFewestZeros["1"] * layerWithFewestZeros["2"]);
