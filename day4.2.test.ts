import assert from "assert";
import { hasRepeatedDigitsNotPartOfLargerGroup } from "./day4";

assert(hasRepeatedDigitsNotPartOfLargerGroup(112233), "112233");
assert(hasRepeatedDigitsNotPartOfLargerGroup(111177), "111177");

assert(hasRepeatedDigitsNotPartOfLargerGroup(123456) === false, "123456");
assert(hasRepeatedDigitsNotPartOfLargerGroup(144456) === false, "123456");
assert(hasRepeatedDigitsNotPartOfLargerGroup(111112) === false, "111122");
