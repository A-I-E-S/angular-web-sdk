import { mapPlan, mapPlanList, mapPlanPackage, PLAN_READ_PATH } from './plan.mapper';

/** Abbreviated wire sample from GET /public/plan/read. */
const WIRE_PLAN = {
  id: 1,
  name: 'Starter',
  active: true,
  deleted_at: null,
  created_at: '2024-01-01T00:00:00.000000Z',
  updated_at: '2024-06-01T00:00:00.000000Z',
  packages: [
    {
      id: 2,
      plan_id: 1,
      company_service_id: 3,
      name: 'Box',
      metrics: '10kg',
      volume: 1,
      discount: '10%',
      model: null,
      monthly: '5000',
      quarterly: null,
      biannually: null,
      annually: null,
      active: true,
      deleted_at: null,
      created_at: null,
      updated_at: null,
    },
  ],
};

describe('plan mapper', () => {
  it('exports the public read path', () => {
    expect(PLAN_READ_PATH).toBe('/public/plan/read');
  });

  it('maps a plan with nested packages', () => {
    const mapped = mapPlan(WIRE_PLAN);
    expect(mapped.id).toBe(1);
    expect(mapped.name).toBe('Starter');
    expect(mapped.packages).toHaveLength(1);
    expect(mapped.packages[0]?.name).toBe('Box');
    expect(mapped.packages[0]?.company_service_id).toBe(3);
    expect(mapped.packages[0]?.discount).toBe('10%');
  });

  it('maps a standalone package', () => {
    const mapped = mapPlanPackage(WIRE_PLAN.packages[0]);
    expect(mapped.plan_id).toBe(1);
    expect(mapped.monthly).toBe('5000');
  });

  it('maps a list payload', () => {
    expect(mapPlanList([WIRE_PLAN])).toHaveLength(1);
    expect(mapPlanList(WIRE_PLAN)).toHaveLength(1);
  });

  it('returns empty packages when wire omits them', () => {
    const mapped = mapPlan({ id: 2, name: 'Pro', active: true });
    expect(mapped.packages).toEqual([]);
  });
});
