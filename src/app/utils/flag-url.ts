/** Resolve the public-asset URL for a flag SVG. Filenames are kept relative
 *  in `Country.svgFile`; this is the only place that knows where they live
 *  on disk. */
export function getFlagUrl(svgFile: string): string {
  return `/flags/${svgFile}`;
}
