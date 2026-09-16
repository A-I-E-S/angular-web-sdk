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

  it('toFileGenerateRequest maps jpeg/png/pdf and office blobs', () => {
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
    expect(
      toFileGenerateRequest(
        new File(['x'], 'a.pdf', { type: 'application/pdf' }),
        'images/items',
      ),
    ).toEqual({
      extension: 'pdf',
      mime_type: 'application/pdf',
      folder: 'images/items',
    });
    expect(
      toFileGenerateRequest(
        new File(['x'], 'a.webp', { type: 'image/webp' }),
        'images/items',
      ),
    ).toEqual({
      extension: 'webp',
      mime_type: 'image/webp',
      folder: 'images/items',
    });
    expect(
      toFileGenerateRequest(
        new File(['x'], 'notes.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        'documents',
      ),
    ).toEqual({
      extension: 'docx',
      mime_type:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      folder: 'documents',
    });
  });

  it('toFileGenerateRequest falls back to filename extension when mime is empty', () => {
    expect(
      toFileGenerateRequest(new File(['x'], 'scan.HEIC', { type: '' }), 'images/items'),
    ).toEqual({
      extension: 'heic',
      mime_type: 'image/heic',
      folder: 'images/items',
    });
  });

  it('toFileGenerateRequest rejects unsupported mime types', () => {
    expect(() =>
      toFileGenerateRequest(
        new File(['x'], 'a.bmp', { type: 'image/bmp' }),
        'images/items',
      ),
    ).toThrow(/Unsupported file type/);
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
