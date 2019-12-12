import R from "ramda";
import fs from "fs";

const h = 6;
const w = 25;
const imageData = fs.readFileSync("day8.input.txt").toString();
// const h = 2;
// const w = 2;
// const imageData = "0222112222120000";

const layers = R.compose(
  R.splitEvery(R.multiply(w, h)),
  R.filter(R.contains(R.__, ["0", "1", "2"])),
  R.split(""),
  R.reverse
)(imageData);

const mapWithIndex = R.addIndex(R.map);

const combinePixels = (newLayer: string[]) => (pixel: string, i: number) =>
  R.cond([
    [R.compose(R.equals("2"), R.nth(i)), R.always(pixel)],
    [R.T, R.nth(i)]
  ])(newLayer);

const combineLayers = (previousLayer: string[], newLayer: string[]) =>
  mapWithIndex(combinePixels(newLayer), previousLayer);

const layerData = R.reverse(
  R.reduce(
    combineLayers,
    R.map(R.always("2"), R.range(0, R.multiply(w, h))),
    layers
  )
);

const toImage = R.compose(
  R.join("\n"),
  R.map(R.join("")),
  R.splitEvery(w),
  R.map(
    R.cond([
      [R.equals("0"), R.always(" ")],
      [R.T, R.always("█")]
    ])
  )
);
console.log(toImage(layerData));
