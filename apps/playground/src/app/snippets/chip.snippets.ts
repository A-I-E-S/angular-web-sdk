/**
 * Playground snippets for Chip.
 */

const CHIP_VARIANTS = `
<aies-chip variant="neutral">Neutral</aies-chip>
<aies-chip variant="success">Delivered</aies-chip>
<aies-chip variant="warning">Pending</aies-chip>
<aies-chip variant="danger">Exception</aies-chip>
<aies-chip variant="export">SFN</aies-chip>
<aies-chip variant="import">STN</aies-chip>
`.trim();

const CHIP_ICON_REMOVE = `
<aies-chip variant="warning" icon="clock">Pending</aies-chip>

<aies-chip
  variant="danger"
  [removable]="true"
  (removed)="clearFilter()"
>
  Exception
</aies-chip>
`.trim();

const CHIP_TABLE = `
<ng-template aiesCellDef="status" let-row>
  <aies-chip [variant]="statusVariant(row.status)">{{ row.status }}</aies-chip>
</ng-template>
`.trim();

export { CHIP_ICON_REMOVE, CHIP_TABLE, CHIP_VARIANTS };
