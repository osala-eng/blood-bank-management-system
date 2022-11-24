module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}"
  ],
  coveragePathIgnorePatterns: [
    "node_modules",
    "vendor",
    "skillreactor",
    "dist",
    "coverage",
    "jest.config.js"
  ]
};