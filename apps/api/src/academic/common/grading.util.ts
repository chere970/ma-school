/**
 * Shared grading utilities for CampusCore ERP.
 *
 * Single source of truth for the 7-band grading scale used by
 * GradeService, StudentResultService, and ResultReportService.
 *
 * | Percentage | Letter | GPA  |
 * |-----------|--------|------|
 * | >= 90     | A      | 4.0  |
 * | >= 85     | B+     | 3.5  |
 * | >= 80     | B      | 3.0  |
 * | >= 75     | C+     | 2.5  |
 * | >= 70     | C      | 2.0  |
 * | >= 60     | D      | 1.0  |
 * |  < 60     | F      | 0.0  |
 */

export const GRADE_SCALE: Array<{
  min: number;
  letter: string;
  point: number;
}> = [
  { min: 90, letter: 'A', point: 4.0 },
  { min: 85, letter: 'B+', point: 3.5 },
  { min: 80, letter: 'B', point: 3.0 },
  { min: 75, letter: 'C+', point: 2.5 },
  { min: 70, letter: 'C', point: 2.0 },
  { min: 60, letter: 'D', point: 1.0 },
  { min: 0, letter: 'F', point: 0.0 },
];

export const PASS_THRESHOLD = 60;

export interface GradeResult {
  letter: string;
  point: number;
  passed: boolean;
}

/**
 * Maps a percentage (0–100) to a letter grade, GPA point, and pass/fail.
 * Percentage is clamped: values < 0 are treated as 0.
 */
export function computeLetterGrade(percentage: number): GradeResult {
  const clamped = Math.max(0, percentage);
  const entry =
    GRADE_SCALE.find((g) => clamped >= g.min) ??
    GRADE_SCALE[GRADE_SCALE.length - 1];

  return {
    letter: entry.letter,
    point: entry.point,
    passed: clamped >= PASS_THRESHOLD,
  };
}

/**
 * Converts a Prisma Decimal (or null) to a rounded JS number.
 * Returns null when the input is null/undefined.
 */
export function decimalToNumber(
  value: { toNumber(): number } | null | undefined,
): number | null {
  if (value == null) return null;
  return Math.round(value.toNumber() * 100) / 100;
}

/**
 * Safely divides numerator by denominator.
 * Returns null instead of Infinity / NaN when denominator is 0.
 */
export function safePercent(
  score: number,
  maxScore: number,
): number | null {
  if (maxScore <= 0) return null;
  return Math.round((score / maxScore) * 10000) / 100; // 2 dp
}
