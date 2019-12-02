import * as fs from "fs";
import R from "ramda";

const parseData = R.compose(
  R.filter(Boolean),
  R.map(parseFloat),
  R.split("\n"),
  R.toString
);

const data = fs.readFileSync("day1.input.txt");
const calcFuel = R.compose(R.subtract(R.__, 2), Math.floor, R.divide(R.__, 3));

const getTotalFuel = (mass: number, total = 0) => {
  const fuelNeeded = calcFuel(mass);

  return R.gt(fuelNeeded, 0)
    ? getTotalFuel(fuelNeeded, R.add(fuelNeeded, total))
    : total;
};

const getResult = R.compose(R.sum, R.map(getTotalFuel), parseData);

console.log(getResult(data));
