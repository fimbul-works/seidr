export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getDecimalCount(value: number): number {
  return (String(value).split(".")[1] || "").length;
}

export function roundValue(value: number, decimalCount: number): number {
  const rounder = 10 ** decimalCount;
  return Math.round(value * rounder) / rounder;
}

export function snapValueToStep(value: number, min: number, max: number, step: number): number {
  const remainder = (value - min) % step;
  let snapped =
    Math.abs(remainder) * 2 >= step
      ? value - remainder + (remainder > 0 ? step : -step)
      : value - remainder;
  const decimalCount = getDecimalCount(step);
  snapped = roundValue(snapped, decimalCount);
  return clamp(snapped, min, max);
}

export function linearScale(
  input: readonly [number, number],
  output: readonly [number, number],
): (value: number) => number {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

export function getClosestValueIndex(values: number[], nextValue: number): number {
  if (values.length <= 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  const closestIndex = distances.indexOf(closestDistance);

  return nextValue < values[closestIndex] ? closestIndex : distances.lastIndexOf(closestDistance);
}

export function getNextSortedValues(prevValues: number[], nextValue: number, atIndex: number): number[] {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}

export function hasMinStepsBetweenValues(values: number[], minStepsBetweenValues: number): boolean {
  if (minStepsBetweenValues > 0 && values.length > 1) {
    for (let i = 0; i < values.length - 1; i++) {
      if ((values[i + 1] ?? 0) - (values[i] ?? 0) < minStepsBetweenValues) {
        return false;
      }
    }
  }
  return true;
}
