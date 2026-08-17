import {
  mapService,
  mapServiceList,
  SERVICE_READ_PATH,
} from './service.mapper';

/** Abbreviated wire sample from GET /public/service/read. */
const WIRE_SERVICE = {
  id: 3,
  name: 'Box Storage',
  description: 'Monthly box storage add-on',
  model: 'App\\Models\\BoxStorage',
  active: true,
  deleted_at: null,
  created_at: '2024-01-10T08:00:00.000000Z',
  updated_at: '2025-06-01T12:00:00.000000Z',
};

describe('service mapper', () => {
  it('exports the public read path', () => {
    expect(SERVICE_READ_PATH).toBe('/public/service/read');
  });

  it('maps a single service', () => {
    const mapped = mapService(WIRE_SERVICE);
    expect(mapped.id).toBe(3);
    expect(mapped.name).toBe('Box Storage');
    expect(mapped.description).toBe('Monthly box storage add-on');
    expect(mapped.model).toBe('App\\Models\\BoxStorage');
    expect(mapped.active).toBe(true);
  });

  it('maps a list payload', () => {
    expect(mapServiceList([WIRE_SERVICE])).toHaveLength(1);
    expect(mapServiceList(WIRE_SERVICE)).toHaveLength(1);
  });

  it('maps camelCase wire keys', () => {
    const mapped = mapService({
      id: 1,
      name: 'Express',
      model: 'App\\Models\\Express',
      active: true,
      deletedAt: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    });
    expect(mapped.deleted_at).toBeNull();
    expect(mapped.created_at).toBe('2024-01-01');
    expect(mapped.updated_at).toBe('2024-01-02');
  });
});
