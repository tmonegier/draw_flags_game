/** Single source of truth for scoring thresholds and palette.
 *
 *  Scores run 0–`SCORE_SCALE`. Each grade fires when the score is `>=` its
 *  entry's `min`. Thresholds are listed top-down (best first) so iteration
 *  order matches the cascading logic.
 */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export const SCORE_SCALE = 1000;

export const GRADE_THRESHOLDS: Array<{ grade: Grade; min: number }> = [
  { grade: 'A', min: 900 },
  { grade: 'B', min: 700 },
  { grade: 'C', min: 500 },
  { grade: 'D', min: 300 },
  { grade: 'F', min: 0 },
];

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#68d391',
  B: '#63b3ed',
  C: '#f6e05e',
  D: '#f6ad55',
  F: '#fc8181',
};

/** Per-channel pixel-difference tolerance used by the scoring service when
 *  comparing a user drawing to the reference flag (0–255 per channel). */
export const PIXEL_TOLERANCE = 60;

export const SCORE_MESSAGES: Array<{ min: number; message: string }> = [
  { min: 900, message: '🎉 Outstanding! Near-perfect match!' },
  { min: 700, message: '👍 Great job! Mostly correct.' },
  { min: 500, message: '😊 Not bad! Room for improvement.' },
  { min: 300, message: '😅 Keep practicing!' },
  { min: 0,   message: '😬 Better luck next time!' },
];
