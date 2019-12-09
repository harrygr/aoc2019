import R from "ramda";
import fs from "fs";

type Memory = number[];
type Mode =
  | 0 // parameter
  | 1; // immediate

type Machine = {
  memory: Memory;
  ip: number;
};

const INPUT = 1;

const lookup = R.nth;

const lookupIndirect = (k: number, m: Memory) => lookup(lookup(k, m), m);

const getMemoryValue = (mode: Mode): ((k: number, m: number[]) => number) =>
  mode === 0 ? lookupIndirect : lookup;

const indirectInsert = (k: number, v: number, m: Memory) =>
  R.update(lookup(k, m), v, m);

const insertMemoryValue = (mode: Mode) =>
  mode === 0 ? indirectInsert : R.update;

const runAll = (machine: Machine) => {
  return R.until<Machine, Machine>(
    machine => R.equals(99, lookup(machine.ip, machine.memory)),
    runStep
  )(machine);
};

const runStep = (machine: Machine): Machine => {
  const instruction = lookup(machine.ip, machine.memory);
  const opcode = instruction % 100;
  const parameterModes = R.toString(Math.floor(instruction / 100));
  console.log({ instruction, opcode, parameterModes });
  const [memory, ip] = perform(
    opcode,
    parameterModes,
    machine.ip,
    machine.memory
  );
  console.log({ memory, ip });
  return { memory, ip };
};

const perform = (
  opcode: number,
  parameterModes: string,
  ip: number,
  memory: Memory
): [Memory, number] => {
  switch (opcode) {
    case 1: {
      const modeParam1 = parseFloat(parameterModes[1]) as Mode;
      const modeParam2 = parseFloat(parameterModes[0]) as Mode;
      return [
        indirectInsert(
          ip + 3,
          R.add(
            getMemoryValue(modeParam1)(ip + 1, memory),
            getMemoryValue(modeParam2)(ip + 2, memory)
          ),
          memory
        ),
        ip + 4
      ];
    }

    case 2: {
      const modeParam1 = parseFloat(parameterModes[1]) as Mode;
      const modeParam2 = parseFloat(parameterModes[0]) as Mode;
      return [
        indirectInsert(
          ip + 3,
          R.multiply(
            getMemoryValue(modeParam1)(ip + 1, memory),
            getMemoryValue(modeParam2)(ip + 2, memory)
          ),
          memory
        ),
        ip + 4
      ];
    }
    case 3:
      return [indirectInsert(ip + 1, INPUT, memory), ip + 2];
    case 4:
      console.log(`OUTPUT:`, lookupIndirect(ip + 1, memory));
      return [memory, ip + 2];

    default:
      throw new Error(`Invalid opcode: ${opcode}`);
  }
};

const program = fs.readFileSync("day5.input.txt").toString();
// const program = "3,0,4,0,99";

const mem = R.map(parseFloat, R.split(",", program));

const endstate = runAll({
  memory: mem,
  ip: 0
});

console.log(endstate);
