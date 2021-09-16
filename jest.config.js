/** @type {import("@jest/types").Config.InitialOptions} */

const config = {
  transform: {
    "^.+\\.(ts|js)$": [
      "esbuild-jest",
      { sourcemap: "true", target: "node10", platform: "node" },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
};

module.exports = config;
