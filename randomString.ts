import { randomBytes } from "crypto";

const getToken = (length: number = 6) => {
  const alphabet = "23456789ABCDGHJKLTYPRWS";

  const bytes = randomBytes(alphabet.length * 2).readBigUInt64BE();
  console.log(bytes);

  return Array.from({ length }).reduce((acc, _, idx) => {});
};

console.log(getToken());
