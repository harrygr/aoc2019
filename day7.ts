import R from "ramda";
import { Writer } from "catling";
export type Memory = number[];
export type Mode =
  | 0 // parameter
  | 1; // immediate

export type Machine = {
  memory: Memory;
  ip: number;
};

export type MachineWriter = Writer<number[], Machine>;

/**
 * Simulate IO by returning a function that returns
 * each successive input value each time it's called.
 * @param inputs A list of inputs to return
 * @example
 * const getInput = makeInputGetter([10,20])
 * getInput() // 10
 * getInput() // 20
 * getInput() // undefined
 */
export const makeInputGetter = (inputs: number[]) => {
  let counter = 0;

  return () => {
    const val = inputs[counter];
    counter = counter + 1;
    return val;
  };
};

export const allPermutations = <T>(
  tokens: T[],
  subperms: T[][] = [[]]
): T[][] =>
  R.isEmpty(tokens)
    ? subperms
    : (R.addIndex(R.chain)(
        (token: T, idx) =>
          allPermutations(
            R.remove(idx, 1, tokens),
            R.compose(R.map, R.append)(token)(subperms) as T[][]
          ),
        tokens
      ) as T[][]);

export const getParameterModes = (nParams: number) => (modeCode: string) => {
  const modes = R.split("", modeCode);
  return R.reverse(
    R.map(parseFloat, R.concat(R.repeat("0", nParams - R.length(modes)), modes))
  ) as Mode[];
};

export const lookup = R.nth;

export const lookupIndirect = (k: number, m: Memory) => lookup(lookup(k, m), m);

export const getMemoryValue = (
  mode: Mode
): ((k: number, m: number[]) => number) =>
  mode === 0 ? lookupIndirect : lookup;

export const indirectInsert = (k: number, v: number, m: Memory) =>
  R.update(lookup(k, m), v, m);
