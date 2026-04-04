import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScoringService {
  /**
   * Computes a pixel-similarity score (0–100) between the user's drawing
   * and the reference SVG flag.
   *
   * @param userDataUrl - canvas.toDataURL() from the drawing canvas
   * @param svgFile     - filename in /flags/, e.g. "ireland.svg"
   * @param width       - canvas width in pixels
   * @param height      - canvas height in pixels
   */
  computeScore(userDataUrl: string, svgFile: string, width: number, height: number): Promise<number> {
    return new Promise((resolve) => {
      const flagUrl = `/flags/${svgFile}`;

      const flagImg = new Image();

      flagImg.onload = () => {
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
          userCtx.drawImage(userImg, 0, 0, width, height);

          const refData = refCtx.getImageData(0, 0, width, height).data;
          const userData = userCtx.getImageData(0, 0, width, height).data;

          const totalPixels = width * height;
          let matching = 0;
          const tolerance = 60;

          for (let i = 0; i < refData.length; i += 4) {
            const rDiff = Math.abs(refData[i]     - userData[i]);
            const gDiff = Math.abs(refData[i + 1] - userData[i + 1]);
            const bDiff = Math.abs(refData[i + 2] - userData[i + 2]);
            if (rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance) {
              matching++;
            }
          }

          resolve(Math.round((matching / totalPixels) * 100));
        };
        userImg.onerror = () => resolve(0);
        userImg.src = userDataUrl;
      };

      flagImg.onerror = () => resolve(0);
      flagImg.src = flagUrl;
    });
  }
}
