import { csvCell, downloadCsv, toCsvString } from './download-csv';

describe('csvCell', () => {
  it('passes through plain text', () => {
    expect(csvCell('Lagos')).toBe('Lagos');
  });

  it('stringifies numbers and treats nullish as empty', () => {
    expect(csvCell(12)).toBe('12');
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
  });

  it('quotes commas, quotes, and line breaks', () => {
    expect(csvCell('a, b')).toBe('"a, b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
  });
});

describe('toCsvString', () => {
  it('joins header and rows with a trailing newline and a BOM', () => {
    expect(
      toCsvString({
        headers: ['Name', 'City'],
        rows: [['Acme', 'Lagos, NG']],
      }),
    ).toBe('\uFEFFName,City\nAcme,"Lagos, NG"\n');
  });

  it('omits the BOM when bom is false', () => {
    expect(
      toCsvString({
        headers: ['Name'],
        rows: [['Acme']],
        bom: false,
      }),
    ).toBe('Name\nAcme\n');
  });
});

describe('downloadCsv', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.body.replaceChildren();
  });

  it('triggers a download with the given filename', () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:csv');
    const revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const click = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        el.click = click;
      }
      return el;
    });

    expect(
      downloadCsv({
        filename: 'warehouses.csv',
        headers: ['Name'],
        rows: [['Acme']],
      }),
    ).toBe(true);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
  });
});
