import {
  mapProduct,
  mapProductList,
  PRODUCT_READ_PATH,
} from './product.mapper';

/** Abbreviated wire sample from GET /product/read/all. */
const WIRE_INDOMIE = {
  id: 6280,
  account_id: 78,
  product_category_id: null,
  hs_code: '010121000123',
  hs_code_10: null,
  hs_code_8: null,
  hs_code_6: null,
  name: 'Indomie',
  value: 0,
  usage: 0,
  document_ids: null,
  etw_ids: null,
  active: true,
  is_external: true,
  deleted_at: null,
  created_at: '2026-04-10T08:35:36.000000Z',
  updated_at: '2026-04-10T08:35:36.000000Z',
  document_details: [],
  etw_document_details: [],
  zone_product_required_documents: [],
};

const WIRE_WITH_DOCS = {
  id: 6279,
  account_id: null,
  product_category_id: null,
  hs_code: '2782902',
  hs_code_10: '2782902',
  hs_code_8: '8382902',
  hs_code_6: '73829021',
  name: 'Test Busola Again',
  value: 0,
  usage: 0,
  document_ids: [7],
  etw_ids: [6],
  active: true,
  is_external: false,
  deleted_at: null,
  created_at: '2025-11-11T09:23:40.000000Z',
  updated_at: '2025-11-11T09:23:40.000000Z',
  document_details: ['Fumigation Certificate'],
  etw_document_details: ['FDA Certificate'],
  zone_product_required_documents: [],
};

describe('product.mapper', () => {
  it('exposes the product read path', () => {
    expect(PRODUCT_READ_PATH).toBe('/product/read');
  });

  it('maps snake_case product fields', () => {
    const mapped = mapProduct(WIRE_INDOMIE);
    expect(mapped.id).toBe(6280);
    expect(mapped.account_id).toBe(78);
    expect(mapped.product_category_id).toBeNull();
    expect(mapped.hs_code).toBe('010121000123');
    expect(mapped.hs_code_10).toBeNull();
    expect(mapped.name).toBe('Indomie');
    expect(mapped.document_ids).toBeNull();
    expect(mapped.is_external).toBe(true);
    expect(mapped.document_details).toEqual([]);
    expect(mapped.zone_product_required_documents).toEqual([]);
  });

  it('maps document id lists and detail labels', () => {
    const mapped = mapProduct(WIRE_WITH_DOCS);
    expect(mapped.document_ids).toEqual([7]);
    expect(mapped.etw_ids).toEqual([6]);
    expect(mapped.document_details).toEqual(['Fumigation Certificate']);
    expect(mapped.etw_document_details).toEqual(['FDA Certificate']);
    expect(mapped.hs_code_8).toBe('8382902');
    expect(mapped.is_external).toBe(false);
  });

  it('mapProductList normalizes arrays and single objects', () => {
    expect(mapProductList([WIRE_INDOMIE, WIRE_WITH_DOCS])).toHaveLength(2);
    expect(mapProductList(WIRE_INDOMIE)[0]?.name).toBe('Indomie');
    expect(mapProductList(null)).toEqual([]);
  });

  it('accepts camelCase aliases', () => {
    const mapped = mapProduct({
      id: 1,
      accountId: 9,
      productCategoryId: 2,
      hsCode: 'ABC',
      hsCode10: '10',
      isExternal: true,
      documentIds: [1, 2],
      etwIds: null,
      documentDetails: ['A'],
      etwDocumentDetails: [],
      zoneProductRequiredDocuments: [{ id: 1 }],
    });
    expect(mapped.account_id).toBe(9);
    expect(mapped.product_category_id).toBe(2);
    expect(mapped.hs_code).toBe('ABC');
    expect(mapped.hs_code_10).toBe('10');
    expect(mapped.is_external).toBe(true);
    expect(mapped.document_ids).toEqual([1, 2]);
    expect(mapped.document_details).toEqual(['A']);
    expect(mapped.zone_product_required_documents).toEqual([{ id: 1 }]);
  });
});
