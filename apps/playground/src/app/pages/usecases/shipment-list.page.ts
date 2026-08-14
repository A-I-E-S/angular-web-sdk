import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  ActionMenuComponent,
  type AiesMenuItem,
  CellDefDirective,
  ChipComponent,
  type ChipVariant,
  type TableColumn,
  TableComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../../shared/demo-section.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { USECASE_SHIPMENT_BACK } from '../../snippets';
import { USECASE_SHIPMENTS, type UsecaseShipment } from './shipment-data';

/**
 * Parent list — no Back. Row actions open a child detail route.
 */
@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [
    ActionMenuComponent,
    CellDefDirective,
    ChipComponent,
    TableComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Use cases"
        title="Back button and Breadcrumbs"
        description="You do not implement these. They ship with aies-app-shell: breadcrumbs follow the nav trail, and Back appears only when the current page is a child of a parent route."
      />

      <app-demo-section
        title="Example: list to detail"
        hint="Open ⋯ → View details. Back and breadcrumbs show on the detail page automatically. Paste that URL in a new tab — Back still appears and still returns here."
        badge="built-in"
        [code]="routeCode"
      >
        <aies-table [columns]="columns" [rows]="rows">
          <ng-template aiesCellDef="reference" let-row>
            <span class="font-medium text-ink dark:text-white">{{
              row.reference
            }}</span>
          </ng-template>
          <ng-template aiesCellDef="status" let-row>
            <aies-chip [variant]="statusVariant(row.status)">
              {{ row.status }}
            </aies-chip>
          </ng-template>
          <ng-template aiesCellDef="actions" let-row>
            <aies-action-menu
              [items]="rowActions(row)"
              [ariaLabel]="'Actions for ' + row.reference"
            />
          </ng-template>
        </aies-table>
      </app-demo-section>
    </div>
  `,
})
export class ShipmentListPage {
  private readonly router = inject(Router);

  protected readonly routeCode = USECASE_SHIPMENT_BACK;
  protected readonly rows = USECASE_SHIPMENTS;

  protected readonly columns: TableColumn<UsecaseShipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'route', header: 'Route' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected statusVariant(status: UsecaseShipment['status']): ChipVariant {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Exception':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  protected rowActions(row: UsecaseShipment): AiesMenuItem[] {
    return [
      {
        label: 'View details',
        icon: 'eye',
        onClick: () => {
          void this.router.navigate(['/usecases/shipment', row.reference]);
        },
      },
    ];
  }
}
