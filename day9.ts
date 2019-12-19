import R from "ramda";
import fs from "fs";
import { getParameterModes, makeInputGetter } from "./day7";
import { Writer } from "catling";

type Memory = Record<string, number>;

interface Machine {
  relativeBase: number;
  memory: Memory;
  ip: number;
}

type MachineWriter = Writer<number[], Machine>;

enum Mode {
  Position = 0,
  Immediate = 1,
  Relative = 2
}

const perform = (getInput: () => number) => ({
  memory,
  ip,
  relativeBase
}: Machine): MachineWriter => {
  const instruction = R.prop(R.toString(ip), memory);
  const opcode = instruction % 100;
  const modes = R.toString(Math.floor(instruction / 100));
  const params = R.map(
    i => R.prop(R.toString(R.add(i, ip)), memory),
    R.range(1, 4)
  );

  const getVal = (param: number, mode: Mode) => {
    if (mode === Mode.Immediate) {
      return param;
    }
    if (mode === Mode.Position) {
      return R.prop(R.toString(param), memory);
    }
    if (mode === Mode.Relative) {
      return R.prop(R.toString(relativeBase + param), memory);
    }

    throw new Error(`mode ${mode} not supported for getting memory value`);
  };

  const setVal = (param: number, value: number, mode: Mode) => {
    if (mode === Mode.Position) {
      return R.assoc(R.toString(param), value, memory);
    }
    if (mode === Mode.Relative) {
      return R.assoc(R.toString(relativeBase + param), value, memory);
    }
    throw new Error(`mode ${mode} not supported for setting memory value`);
  };

  switch (opcode) {
    case 1: {
      const parameterModes = getParameterModes(3)(modes);
      const value = R.add(
        getVal(params[0], parameterModes[0]),
        getVal(params[1], parameterModes[1])
      );
      return Writer([], {
        relativeBase,
        memory: setVal(params[2], value, parameterModes[2]),
        ip: ip + 4
      });
    }

    case 2: {
      const parameterModes = getParameterModes(3)(modes);
      const value = R.multiply(
        getVal(params[0], parameterModes[0]),
        getVal(params[1], parameterModes[1])
      );
      return Writer([], {
        relativeBase,
        memory: setVal(params[2], value, parameterModes[2]),
        ip: ip + 4
      });
    }
    // Receive input and save to position given by single parameter
    case 3: {
      const inputValue = getInput();
      if (inputValue === undefined) {
        console.log({ ip, memory });
        throw new Error("no input value returned");
      }

      const parameterModes = getParameterModes(1)(modes);
      return Writer([], {
        relativeBase,
        memory: setVal(params[0], inputValue, parameterModes[0]),
        ip: ip + 2
      });
    }
    // Output value of the parameter
    case 4: {
      const parameterModes = getParameterModes(1)(modes);
      const outputValue = getVal(params[0], parameterModes[0]);
      if (outputValue === undefined) {
        console.log({ memory, ip, relativeBase });
        throw new Error("output value undefined");
      }
      return Writer([outputValue], { relativeBase, memory, ip: ip + 2 });
    }
    // Set pointer to value of the second parameter if first parameter is non-zero
    case 5: {
      const parameterModes = getParameterModes(2)(modes);

      return Writer([], {
        relativeBase,
        memory,
        ip: R.equals(getVal(params[0], parameterModes[0]), 0)
          ? ip + 3
          : getVal(params[1], parameterModes[1])
      });
    }
    // Set pointer to value of the second parameter if first parameter is zero
    case 6: {
      const parameterModes = getParameterModes(2)(modes);

      return Writer([], {
        relativeBase,
        memory,
        ip: R.equals(getVal(params[0], parameterModes[0]), 0)
          ? getVal(params[1], parameterModes[1])
          : ip + 3
      });
    }
    // Store 1 in position given by third paramter, if the first parameter is less than the second
    case 7: {
      const parameterModes = getParameterModes(3)(modes);
      const firstIsLessThanSecond = R.lt(
        getVal(params[0], parameterModes[0]),
        getVal(params[1], parameterModes[1])
      );

      return Writer([], {
        relativeBase,
        memory: setVal(
          params[2],
          firstIsLessThanSecond ? 1 : 0,
          parameterModes[2]
        ),
        ip: ip + 4
      });
    }
    // Store 1 in position given by third paramter, if the first parameter is less than the second
    case 8: {
      const parameterModes = getParameterModes(3)(modes);
      const firstEqualsSecond = R.equals(
        getVal(params[0], parameterModes[0]),
        getVal(params[1], parameterModes[1])
      );

      return Writer([], {
        relativeBase,
        memory: setVal(params[2], firstEqualsSecond ? 1 : 0, parameterModes[2]),
        ip: ip + 4
      });
    }
    // Update the relative base
    case 9: {
      const parameterModes = getParameterModes(1)(modes);
      const adjustment = getVal(params[0], parameterModes[0]);

      return Writer([], {
        relativeBase: relativeBase + adjustment,
        memory,
        ip: ip + 2
      });
    }
    case 99: {
      return Writer([], { memory, ip, relativeBase });
    }
    default:
      throw new Error(`Invalid opcode: ${opcode}`);
  }
};

const runProgram = (program: Memory) => {
  const initialMachine: Machine = {
    memory: program,
    ip: 0,
    relativeBase: 0
  };
  const inputGetter = makeInputGetter([2]);
  const endState = R.until(
    (w: MachineWriter) => w.map(m => m.memory[m.ip] === 99).value(),
    w => w.flatMap(m => perform(inputGetter)(m)),
    Writer([], initialMachine)
  );

  return endState;
};

const test1 = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99"; // itself ???
const test2 = "1002,4,3,4,33";
const test3 = "1102,34915192,34915192,7,4,7,99,0";
const test4 = "104,1125899906842624,99";
const test5 = "109,1,9,2,204,-6,99"; // 204
const test6 = "109,1,209,-1,204,-106,99"; // 204
const test7 = "109,1,3,3,204,2,99"; // input
const test8 = "109,-1,4,1,99"; // -1
const test9 = "109,1,203,2,204,2,99"; // input
const test10 = "109,5,203,0,104,0,99"; // input

const input = fs.readFileSync("day9.input.txt").toString();

const toMemory = R.compose(
  (a: number[]) => R.zipObj(R.map(R.toString, R.range(0, R.length(a))), a),
  R.map(parseFloat),
  R.split(",")
);
const res = runProgram(toMemory(input));
console.log(res.written());
