import {
  DOCUMENT_READ_PATH,
  mapDocument,
  mapDocumentList,
} from './document.mapper';

/** Abbreviated wire sample from GET /public/document/read. */
const WIRE_DOCUMENT = {
  id: 7,
  name: 'Fumigation Certificate',
  description: 'Required for agricultural exports',
  type: 'certificate',
  mime_type: 'application/pdf',
  active: true,
  deleted_at: null,
  created_at: '2024-03-01T10:00:00.000000Z',
  updated_at: '2024-03-01T10:00:00.000000Z',
  url: null,
  base_64: null,
};

const WIRE_DOCUMENT_WITH_PREVIEW = {
  ...WIRE_DOCUMENT,
  url: 'https://cdn.example.com/documents/7.pdf',
  base_64: 'data:application/pdf;base64,abc',
};

describe('document mapper', () => {
  it('exports the public read path', () => {
    expect(DOCUMENT_READ_PATH).toBe('/public/document/read');
  });

  it('maps a single document', () => {
    const mapped = mapDocument(WIRE_DOCUMENT);
    expect(mapped.id).toBe(7);
    expect(mapped.name).toBe('Fumigation Certificate');
    expect(mapped.type).toBe('certificate');
    expect(mapped.mime_type).toBe('application/pdf');
    expect(mapped.url).toBeNull();
  });

  it('maps preview fields on single-record reads', () => {
    const mapped = mapDocument(WIRE_DOCUMENT_WITH_PREVIEW);
    expect(mapped.url).toBe('https://cdn.example.com/documents/7.pdf');
    expect(mapped.base_64).toBe('data:application/pdf;base64,abc');
  });

  it('maps a list payload', () => {
    expect(mapDocumentList([WIRE_DOCUMENT])).toHaveLength(1);
    expect(mapDocumentList(WIRE_DOCUMENT)).toHaveLength(1);
  });
});
