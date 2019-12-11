import R from "ramda";
import fs from "fs";
import { Writer, Reader } from "catling";
import {
  makeInputGetter,
  allPermutations,
  Machine,
  lookup,
  MachineWriter,
  Mode,
  indirectInsert,
  getMemoryValue
} from "./day7";

/**
 * Initialize the intcode computer with an initial state and return a
 * `Reader` that requires a input-getter.
 *
 * When run returns the final output value from running the program with
 * the input.
 * @param initialState
 * @example
 * initMachine(initalState).run(() => 1)
 */
const initMachine = (initialState: Machine) =>
  Reader((getInput: () => number) => {
    return R.until(
      w =>
        w
          .map(machine => R.equals(99, lookup(machine.ip, machine.memory)))
          .value(),
      (w: MachineWriter) => w.flatMap(perform(getInput))
    )(Writer([], initialState));
  })
    .map(_ => _.written())
    .map<number>(R.last);

const getParameterModes = (nParams: number) => (modeCode: string) => {
  const modes = R.split("", modeCode);
  return R.reverse(
    R.map(parseFloat, R.concat(R.repeat("0", nParams - R.length(modes)), modes))
  ) as Mode[];
};

const perform = (getInput: () => number) => ({
  memory,
  ip
}: Machine): MachineWriter => {
  const instruction = lookup(ip, memory);
  const opcode = instruction % 100;
  const modes = R.toString(Math.floor(instruction / 100));

  switch (opcode) {
    case 1: {
      const parameterModes = getParameterModes(3)(modes);
      return Writer([], {
        memory: indirectInsert(
          ip + 3,
          R.add(
            getMemoryValue(parameterModes[0])(ip + 1, memory),
            getMemoryValue(parameterModes[1])(ip + 2, memory)
          ),
          memory
        ),
        ip: ip + 4
      });
    }

    case 2: {
      const parameterModes = getParameterModes(3)(modes);
      return Writer([], {
        memory: indirectInsert(
          ip + 3,
          R.multiply(
            getMemoryValue(parameterModes[0])(ip + 1, memory),
            getMemoryValue(parameterModes[1])(ip + 2, memory)
          ),
          memory
        ),
        ip: ip + 4
      });
    }
    case 3:
      return Writer([], {
        memory: indirectInsert(ip + 1, getInput(), memory),
        ip: ip + 2
      });
    case 4: {
      const parameterModes = getParameterModes(1)(modes);

      return Writer([getMemoryValue(parameterModes[0])(ip + 1, memory)], {
        memory,
        ip: ip + 2
      });
    }
    case 5: {
      const parameterModes = getParameterModes(2)(modes);
      const param1 = getMemoryValue(parameterModes[0])(ip + 1, memory);
      const param2 = getMemoryValue(parameterModes[1])(ip + 2, memory);

      return Writer([], {
        memory,
        ip: R.equals(param1, 0) ? ip + 3 : param2
      });
    }
    case 6: {
      const parameterModes = getParameterModes(2)(modes);
      const param1 = getMemoryValue(parameterModes[0])(ip + 1, memory);
      const param2 = getMemoryValue(parameterModes[1])(ip + 2, memory);

      return Writer([], {
        memory,
        ip: R.equals(param1, 0) ? param2 : ip + 3
      });
    }
    case 7: {
      const parameterModes = getParameterModes(3)(modes);
      const param1 = getMemoryValue(parameterModes[0])(ip + 1, memory);
      const param2 = getMemoryValue(parameterModes[1])(ip + 2, memory);

      return Writer([], {
        memory: indirectInsert(ip + 3, param1 < param2 ? 1 : 0, memory),
        ip: ip + 4
      });
    }
    case 8: {
      const parameterModes = getParameterModes(3)(modes);
      const param1 = getMemoryValue(parameterModes[0])(ip + 1, memory);
      const param2 = getMemoryValue(parameterModes[1])(ip + 2, memory);

      return Writer([], {
        memory: indirectInsert(ip + 3, param1 === param2 ? 1 : 0, memory),
        ip: ip + 4
      });
    }
    default:
      throw new Error(`Invalid opcode: ${opcode}`);
  }
};

const getThrusterValue = (machine: Reader<() => number, number>) =>
  R.reduce(
    (prev, phase: number) => machine.run(makeInputGetter([phase, prev])),
    0
  );

// const program = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0";
const program = fs.readFileSync("day7.input.txt").toString();

const toMemory = R.compose(R.map(parseFloat), R.split(","));

const programmedMachine = initMachine({
  memory: toMemory(program),
  ip: 0
});

const allPossiblePhaseCombos = allPermutations([0, 1, 2, 3, 4]);

const res = R.reduce(
  (acc, phases) => R.max(acc, getThrusterValue(programmedMachine)(phases)),
  0,
  allPossiblePhaseCombos
);
console.log(res);
