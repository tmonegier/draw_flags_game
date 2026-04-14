import { getFlagUrl } from './flag-url';
import { FlagUrlPipe } from './flag-url.pipe';

describe('getFlagUrl', () => {
  it('prefixes the filename with /flags/', () => {
    expect(getFlagUrl('france.svg')).toBe('/flags/france.svg');
  });
});

describe('FlagUrlPipe', () => {
  it('delegates to getFlagUrl', () => {
    expect(new FlagUrlPipe().transform('japan.svg')).toBe('/flags/japan.svg');
  });
});
