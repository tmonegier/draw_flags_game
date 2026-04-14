import { Injectable } from '@angular/core';
import { CANVAS_BACKGROUND } from '../drawing/drawing-canvas';
import { PIXEL_TOLERANCE, SCORE_SCALE } from '../scoring-config';
import { getFlagUrl } from '../utils/flag-url';

/** Parsed RGB of the unfilled-canvas background. Pixels matching this colour
 *  in the user submission are treated as "empty" and never score, even when
 *  the underlying flag region is white. */
const UNFILLED = (() => {
  const n = parseInt(CANVAS_BACKGROUND.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff] as const;
})();

@Injectable({ providedIn: 'root' })
export class ScoringService {
  /**
   * Computes a pixel-similarity score (0–`SCORE_SCALE`) between the user's
   * drawing and the reference SVG flag.
   *
   * @param userDataUrl - canvas.toDataURL() from the drawing canvas
   * @param svgFile     - filename in /flags/, e.g. "ireland.svg"
   * @param width       - canvas width in pixels
   * @param height      - canvas height in pixels
   */
  computeScore(userDataUrl: string, svgFile: string, width: number, height: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const flagUrl = getFlagUrl(svgFile);

      const flagImg = new Image();

      flagImg.onload = () => {
        try {
          // Off-screen canvas for the reference flag
          const refCanvas = document.createElement('canvas');
          refCanvas.width = width;
          refCanvas.height = height;
          const refCtx = refCanvas.getContext('2d')!;
          refCtx.fillStyle = '#ffffff';
          refCtx.fillRect(0, 0, width, height);
          refCtx.drawImage(flagImg, 0, 0, width, height);

          // Off-screen canvas for the user drawing
          const userCanvas = document.createElement('canvas');
          userCanvas.width = width;
          userCanvas.height = height;
          const userCtx = userCanvas.getContext('2d')!;
          const userImg = new Image();
          userImg.onload = () => {
            try {
              userCtx.drawImage(userImg, 0, 0, width, height);

              const refData = refCtx.getImageData(0, 0, width, height).data;
              const userData = userCtx.getImageData(0, 0, width, height).data;

              const totalPixels = width * height;
              let matching = 0;

              for (let i = 0; i < refData.length; i += 4) {
                // Unfilled canvas pixels never match — empty is not a colour.
                if (
                  userData[i]     === UNFILLED[0] &&
                  userData[i + 1] === UNFILLED[1] &&
                  userData[i + 2] === UNFILLED[2]
                ) continue;
                const rDiff = Math.abs(refData[i]     - userData[i]);
                const gDiff = Math.abs(refData[i + 1] - userData[i + 1]);
                const bDiff = Math.abs(refData[i + 2] - userData[i + 2]);
                if (rDiff <= PIXEL_TOLERANCE && gDiff <= PIXEL_TOLERANCE && bDiff <= PIXEL_TOLERANCE) {
                  matching++;
                }
              }

              resolve(Math.round((matching / totalPixels) * SCORE_SCALE));
            } catch (err) {
              console.error('Scoring failed during pixel comparison', err);
              reject(err);
            }
          };
          userImg.onerror = () => {
            const err = new Error('Failed to load user drawing for scoring');
            console.error(err);
            reject(err);
          };
          userImg.src = userDataUrl;
        } catch (err) {
          console.error('Scoring failed during reference render', err);
          reject(err);
        }
      };

      flagImg.onerror = () => {
        const err = new Error(`Failed to load reference flag at ${flagUrl}`);
        console.error(err);
        reject(err);
      };
      flagImg.src = flagUrl;
    });
  }
}
