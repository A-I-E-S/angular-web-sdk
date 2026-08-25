import {
  DOCUMENT_READ_PATH,
  mapDocument,
  mapDocumentList,
} from './document.mapper';

/** Abbreviated wire sample from GET /public/document/read (list row). */
const WIRE_DOCUMENT = {
  id: 7,
  name: 'Fumigation Certificate',
  description: 'Required for agricultural exports',
  type: 'certificate',
  active: true,
  deleted_at: null,
  created_at: '2024-03-01T10:00:00.000000Z',
  updated_at: '2024-03-01T10:00:00.000000Z',
};

/** By-id preview wire — nested file_ref (Products / Documents modal). */
const WIRE_DOCUMENT_WITH_PREVIEW = {
  ...WIRE_DOCUMENT,
  file_ref: {
    mime_type: 'application/pdf',
    base_64: 'data:application/pdf;base64,abc',
  },
};

describe('document mapper', () => {
  it('exports the public read path', () => {
    expect(DOCUMENT_READ_PATH).toBe('/public/document/read');
  });

  it('maps a list document without preview', () => {
    const mapped = mapDocument(WIRE_DOCUMENT);
    expect(mapped.id).toBe(7);
    expect(mapped.name).toBe('Fumigation Certificate');
    expect(mapped.type).toBe('certificate');
    expect(mapped.file_ref).toBeNull();
  });

  it('maps nested file_ref on by-id preview responses', () => {
    const mapped = mapDocument(WIRE_DOCUMENT_WITH_PREVIEW);
    expect(mapped.file_ref?.mime_type).toBe('application/pdf');
    expect(mapped.file_ref?.base_64).toBe('data:application/pdf;base64,abc');
  });

  it('maps legacy flat preview fields on the document root', () => {
    const mapped = mapDocument({
      ...WIRE_DOCUMENT,
      mime_type: 'image/png',
      base_64: 'data:image/png;base64,xyz',
      url: 'https://cdn.example.com/doc.png',
    });
    expect(mapped.file_ref?.mime_type).toBe('image/png');
    expect(mapped.file_ref?.base_64).toContain('png');
    expect(mapped.file_ref?.url).toContain('doc.png');
  });

  it('maps a list payload', () => {
    expect(mapDocumentList([WIRE_DOCUMENT])).toHaveLength(1);
    expect(mapDocumentList(WIRE_DOCUMENT)).toHaveLength(1);
  });
});
