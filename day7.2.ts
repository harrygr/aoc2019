import R from "ramda";
import fs from "fs";
import { Writer } from "catling";
import {
  Machine,
  MachineWriter,
  getParameterModes,
  indirectInsert,
  getMemoryValue,
  makeInputGetter,
  allPermutations,
  lookup
} from "./day7";

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
    case 3: {
      const inputValue = getInput();

      if (inputValue !== undefined) {
        return Writer([], {
          memory: indirectInsert(ip + 1, inputValue, memory),
          ip: ip + 2
        });
      }
      console.log({ ip, memory });
      throw new Error("no input value returned");
    }
    case 4: {
      const parameterModes = getParameterModes(1)(modes);
      const outputValue = getMemoryValue(parameterModes[0])(ip + 1, memory);
      if (outputValue === undefined) {
        console.log({ memory, ip });
        throw new Error("output value undefined");
      }
      return Writer([outputValue], {
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
    case 99: {
      return Writer([], { memory, ip });
    }
    default:
      throw new Error(`Invalid opcode: ${opcode}`);
  }
};

const createRunner = (initialState: Machine, phases: number[]) => {
  const run = (machines: MachineWriter[]) => (
    idx: number,
    param: number
  ): number => {
    const machineIdx = idx % 5;
    const phase = R.nth(machineIdx, phases);
    const input = idx < 5 ? [phase, param] : [param];

    const inputGetter = makeInputGetter(input);

    const nextMachineState = R.until(
      (w: MachineWriter) =>
        R.not(R.isEmpty(w.written())) ||
        w.map(m => m.memory[m.ip] === 99).value(),
      w => w.flatMap(m => perform(inputGetter)(m)),
      R.nth(machineIdx, machines)
    );

    if (R.isNil(R.last(nextMachineState.written()))) {
      // this is the final output value, our program has terminated
      return param;
    }

    const newmachines = R.update(
      machineIdx,
      nextMachineState.mapWritten(() => []),
      machines
    );
    return run(newmachines)(R.inc(idx), R.last(nextMachineState.written()));
  };

  return run(R.repeat(Writer([], initialState), 5));
};

const phases = [9, 8, 7, 6, 5];
const allPossiblePhaseCombos = allPermutations(phases);

// const program =
//   "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5";
const program = fs.readFileSync("day7.input.txt").toString();

const toMemory = R.compose(R.map(parseFloat), R.split(","));
const initalState = { memory: toMemory(program), ip: 0 };

const res = R.reduce(
  (acc, phases) => {
    const run = createRunner(initalState, phases);
    const thrusterOutput = run(0, 0);
    console.log("thruster output for phases", phases, "was", thrusterOutput);
    return R.max(thrusterOutput, acc);
  },
  0,
  allPossiblePhaseCombos
);
console.log(res);
