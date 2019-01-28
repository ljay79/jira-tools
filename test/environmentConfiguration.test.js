
environmentConfiguration = require('../src/environmentConfiguration.gs');

test('Config exists with sensible defaults for local dev', () => {
  expect(environmentConfiguration.name).toBe("Local");
  expect(environmentConfiguration.description).not.toBeNull();
  expect(environmentConfiguration.debugEnabled).toBe(false);
});