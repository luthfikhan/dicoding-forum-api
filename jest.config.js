/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/", "dist/"],
  clearMocks: true,
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**", "!**/src/index.ts"],
};
