import { CubeDevicePuzzleInfo } from "./cube-device.component";

export const CUBE_DEVICE_EXAMPLE: CubeDevicePuzzleInfo = {
  master: "XXX",
  processing: false,
  puzzle: "Cube Device",
  saveName: "Temp Cube Device",
  visableName: "Test Puzzle Cube Device",
  config: {
    nrOfCubes: 3,
    startPositions: [0, 1, 2],
    symbols: ["A", "B", "C", "D"],
  },
  state: { positions: [0, 1, 2] },
};
