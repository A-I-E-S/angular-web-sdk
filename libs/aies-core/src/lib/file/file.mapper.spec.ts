import { FILE_READ_PATH,mapFileRead } from './file.mapper';

const WIRE_PDF = {
  mime_type: 'application/pdf',
  base_64: 'data:application/pdf;base64,JVBERi0=',
  url: 'https://example.com/doc.pdf',
};

describe('file.mapper', () => {
  it('exposes the file read path', () => {
    expect(FILE_READ_PATH).toBe('/file/read');
  });

  it('mapFileRead preserves snake_case fields', () => {
    const mapped = mapFileRead(WIRE_PDF);
    expect(mapped.mime_type).toBe('application/pdf');
    expect(mapped.base_64).toContain('base64');
    expect(mapped.url).toContain('doc.pdf');
  });

  it('mapFileRead accepts camelCase aliases', () => {
    expect(
      mapFileRead({
        mimeType: 'image/png',
        base64: 'abc',
        url: 'https://example.com/a.png',
      }),
    ).toEqual({
      mime_type: 'image/png',
      base_64: 'abc',
      url: 'https://example.com/a.png',
    });
  });

  it('mapFileRead unwraps a one-element array if present', () => {
    expect(mapFileRead([WIRE_PDF]).mime_type).toBe('application/pdf');
  });
});
