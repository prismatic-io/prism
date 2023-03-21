import path from "path";
import { defaults } from "jest-config";
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
  testEnvironment: "node",
  testPathIgnorePatterns: [
    ...defaults.testPathIgnorePatterns,
    "lib",
    path.join("src", "commands", "components", "temp"),
    "templates",
    path.join("src", "commands", ".+", "test.ts"),
  ],
};

export default config;
