import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { updateShipmentsFilterConfig } from '@aies/aies-models';

import { ShipmentMethodService } from '../shipment-method/shipment-method.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import {
  collectFilterOptionsSources,
  mapShipmentMethodFilterOptions,
  mapWarehouseFilterOptions,
  mergeFilterOptionLists,
} from './filter-options.mapper';
import { FilterOptionsResolver } from './filter-options.resolver';

describe('filter-options', () => {
  describe('mapWarehouseFilterOptions', () => {
    it('maps id and name', () => {
      expect(
        mapWarehouseFilterOptions([
          { id: 37, name: 'Lagos Hub' } as never,
        ]),
      ).toEqual([{ value: '37', label: 'Lagos Hub' }]);
    });
  });

  describe('mapShipmentMethodFilterOptions', () => {
    it('maps id and name', () => {
      expect(
        mapShipmentMethodFilterOptions([
          { id: 12, name: 'DHL' } as never,
        ]),
      ).toEqual([{ value: '12', label: 'DHL' }]);
    });
  });

  describe('mergeFilterOptionLists', () => {
    it('lets host overrides win', () => {
      expect(
        mergeFilterOptionLists(
          { warehouse_id: [{ value: '1', label: 'A' }] },
          { warehouse_id: [{ value: '9', label: 'Host' }] },
        ),
      ).toEqual({ warehouse_id: [{ value: '9', label: 'Host' }] });
    });
  });

  describe('collectFilterOptionsSources', () => {
    it('lists distinct SDK sources from update-shipments config', () => {
      expect(collectFilterOptionsSources(updateShipmentsFilterConfig)).toEqual(
        expect.arrayContaining(['warehouses', 'shipmentMethods', 'shipmentManifests']),
      );
    });
  });

  describe('FilterOptionsResolver', () => {
    let resolver: FilterOptionsResolver;
    let warehouseReadAll: jest.Mock;
    let methodsReadAll: jest.Mock;

    beforeEach(() => {
      warehouseReadAll = jest.fn().mockReturnValue(
        of({
          success: true,
          data: [{ id: 1, name: 'Lagos Hub' }],
        }),
      );
      methodsReadAll = jest.fn().mockReturnValue(
        of({
          success: true,
          data: [{ id: 10, name: 'DHL' }],
        }),
      );

      TestBed.configureTestingModule({
        providers: [
          FilterOptionsResolver,
          {
            provide: WarehouseService,
            useValue: { readAll: warehouseReadAll },
          },
          {
            provide: ShipmentMethodService,
            useValue: { readAll: methodsReadAll },
          },
        ],
      });

      resolver = TestBed.inject(FilterOptionsResolver);
    });

    it('resolves warehouse_id and shipment_method_id keyed by field.key', (done) => {
      resolver.resolve(updateShipmentsFilterConfig).subscribe((lists) => {
        expect(warehouseReadAll).toHaveBeenCalledTimes(1);
        expect(methodsReadAll).toHaveBeenCalledTimes(1);
        expect(lists['warehouse_id']).toEqual([
          { value: '1', label: 'Lagos Hub' },
        ]);
        expect(lists['shipment_method_id']).toEqual([
          { value: '10', label: 'DHL' },
        ]);
        expect(lists['shipment_manifest_id']).toBeUndefined();
        done();
      });
    });

    it('returns empty object when no resolvable selects', (done) => {
      resolver
        .resolve({
          id: 'empty',
          transport: 'named',
          fields: [
            {
              key: 'status',
              label: 'Status',
              type: 'enum',
              options: [{ value: 'open', label: 'Open' }],
            },
          ],
        })
        .subscribe((lists) => {
          expect(lists).toEqual({});
          expect(warehouseReadAll).not.toHaveBeenCalled();
          done();
        });
    });
  });
});
