/**
 * Playground snippets for Chip.
 */

const CHIP_VARIANTS = `
<africanies-chip variant="neutral">Neutral</africanies-chip>
<africanies-chip variant="success">Delivered</africanies-chip>
<africanies-chip variant="warning">Pending</africanies-chip>
<africanies-chip variant="danger">Exception</africanies-chip>
<africanies-chip variant="export">SFN</africanies-chip>
<africanies-chip variant="import">STN</africanies-chip>
`.trim();

const CHIP_ICON_REMOVE = `
<africanies-chip variant="warning" icon="clock">Pending</africanies-chip>

<africanies-chip
  variant="danger"
  [removable]="true"
  (removed)="clearFilter()"
>
  Exception
</africanies-chip>
`.trim();

const CHIP_TABLE = `
<ng-template africaniesCellDef="status" let-row>
  <africanies-chip [variant]="statusVariant(row.status)">{{ row.status }}</africanies-chip>
</ng-template>
`.trim();

export { CHIP_ICON_REMOVE, CHIP_TABLE, CHIP_VARIANTS };
