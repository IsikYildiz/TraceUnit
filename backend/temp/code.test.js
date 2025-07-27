const cube = require('./cube');

describe('Cube Function', () => {
  it('should correctly calculate the cube of a positive number', () => {
    expect(cube(2)).toBe(8);
  });

  it('should correctly calculate the cube of zero', () => {
    expect(cube(0)).toBe(0);
  });

  it('should correctly calculate the cube of a negative number', () => {
    expect(cube(-3)).toBe(-27);
  });

  it('should return NaN for non-numeric input', () => {
    expect(isNaN(cube("a"))).toBe(true);
  });

  it('should return NaN for null input', () => {
    expect(isNaN(cube(null))).toBe(true);
  });
});