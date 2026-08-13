import { mapZone, mapZoneList, ZONE_READ_PATH } from './zone.mapper';

const WIRE_ZONE_R = {
  id: 1,
  name: 'R',
  type: 'standard',
  active: true,
  deleted_at: null,
  created_at: '2024-12-17T12:05:49.000000Z',
  updated_at: null,
};

describe('zone.mapper', () => {
  it('exposes the zone read path', () => {
    expect(ZONE_READ_PATH).toBe('/zone/read/records');
  });

  it('maps snake_case timestamps', () => {
    expect(mapZone(WIRE_ZONE_R)).toEqual({
      id: 1,
      name: 'R',
      type: 'standard',
      active: true,
      deletedAt: null,
      createdAt: '2024-12-17T12:05:49.000000Z',
      updatedAt: null,
    });
  });

  it('mapZoneList normalizes arrays and single objects', () => {
    expect(mapZoneList([WIRE_ZONE_R])).toHaveLength(1);
    expect(mapZoneList(WIRE_ZONE_R)[0]?.name).toBe('R');
    expect(mapZoneList(null)).toEqual([]);
  });
});
