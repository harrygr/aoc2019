import R from "ramda";
import fs from "fs";
import { Writer } from "catling";

type Memory = number[];
type Mode =
  | 0 // parameter
  | 1; // immediate

type Machine = {
  memory: Memory;
  ip: number;
};

type MachineWriter = Writer<number[], Machine>;

const lookup = R.nth;

const lookupIndirect = (k: number, m: Memory) => lookup(lookup(k, m), m);

const getMemoryValue = (mode: Mode): ((k: number, m: number[]) => number) =>
  mode === 0 ? lookupIndirect : lookup;

const indirectInsert = (k: number, v: number, m: Memory) =>
  R.update(lookup(k, m), v, m);

const runProgram = (getInput: () => number) => (machine: Machine) => {
  const initialMachine = Writer([], machine);

  return R.until(
    w =>
      w
        .map(machine => R.equals(99, lookup(machine.ip, machine.memory)))
        .value(),
    (w: MachineWriter) => w.flatMap(perform(getInput))
  )(initialMachine);
};

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

const program = fs.readFileSync("day5.input.txt").toString();

const mem = R.map(parseFloat, R.split(",", program));

const endstate = runProgram(() => 5)({
  memory: mem,
  ip: 0
});

console.log(endstate.written());
