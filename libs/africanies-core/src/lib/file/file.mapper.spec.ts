import {
  FILE_GENERATE_PATH,
  FILE_READ_PATH,
  FILE_UPLOAD_DEFAULT_FOLDER,
  mapFileRead,
  mapFileReadList,
  mapSignedUploadInstructions,
  toFileGenerateRequest,
} from './file.mapper';

const WIRE_PDF = {
  mime_type: 'application/pdf',
  base_64: 'data:application/pdf;base64,JVBERi0=',
  url: 'https://example.com/doc.pdf',
};

describe('file.mapper', () => {
  it('exposes the file read and generate paths', () => {
    expect(FILE_READ_PATH).toBe('/file/read');
    expect(FILE_GENERATE_PATH).toBe('/file/generate');
    expect(FILE_UPLOAD_DEFAULT_FOLDER).toBe('images/items');
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

  it('mapFileReadList maps arrays and single objects', () => {
    expect(mapFileReadList([WIRE_PDF, WIRE_PDF]).length).toBe(2);
    expect(mapFileReadList(WIRE_PDF).length).toBe(1);
    expect(mapFileReadList(null)).toEqual([]);
  });

  it('toFileGenerateRequest maps jpeg/png blobs', () => {
    expect(
      toFileGenerateRequest(
        new File(['x'], 'a.jpeg', { type: 'image/jpeg' }),
        'images/items',
      ),
    ).toEqual({
      extension: 'jpeg',
      mime_type: 'image/jpeg',
      folder: 'images/items',
    });
    expect(
      toFileGenerateRequest(
        new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
        'images/items',
      ),
    ).toEqual({
      extension: 'jpg',
      mime_type: 'image/jpeg',
      folder: 'images/items',
    });
    expect(
      toFileGenerateRequest(
        new File(['x'], 'a.png', { type: 'image/png' }),
        'images/items',
      ),
    ).toEqual({
      extension: 'png',
      mime_type: 'image/png',
      folder: 'images/items',
    });
  });

  it('toFileGenerateRequest rejects unsupported mime types', () => {
    expect(() =>
      toFileGenerateRequest(
        new File(['x'], 'a.gif', { type: 'image/gif' }),
        'images/items',
      ),
    ).toThrow(/JPEG, JPG, and PNG/);
  });

  it('mapSignedUploadInstructions validates count and shape', () => {
    const instruction = {
      upload_url: 'https://s3.example.com/put?X-Amz-SignedHeaders=host',
      s3_key: 'images/items/a.jpg',
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      mime: 'image/jpeg',
      input_name: 'file',
    };
    expect(mapSignedUploadInstructions([instruction], 1)).toEqual([
      {
        upload_url: instruction.upload_url,
        s3_key: 'images/items/a.jpg',
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        mime: 'image/jpeg',
        input_name: 'file',
      },
    ]);
    expect(() => mapSignedUploadInstructions([instruction], 2)).toThrow(
      /unexpected number/,
    );
    expect(() => mapSignedUploadInstructions(null, 1)).toThrow(
      /Unable to prepare/,
    );
    expect(() =>
      mapSignedUploadInstructions([{ ...instruction, method: 'POST' }], 1),
    ).toThrow(/invalid upload instruction/);
  });
});
