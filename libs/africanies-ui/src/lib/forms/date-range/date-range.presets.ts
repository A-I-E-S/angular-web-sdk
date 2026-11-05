/** Inclusive shortcuts shown in the date-range panel. */
export type DateRangePresetId = 'last7Days' | 'thisMonth' | 'thisYear';

/** One shortcut and the inclusive range it applies. */
export interface DateRangePreset {
  id: DateRangePresetId;
  label: string;
  start: string;
  end: string;
  /** True when the span falls outside the field min/max. */
  disabled: boolean;
}

/** Visible names for the three shortcuts. */
export interface DateRangePresetLabels {
  last7Days: string;
  thisMonth: string;
  thisYear: string;
}

/**
 * Last 7 days includes today. This month and this year are the full calendar
 * spans, so a closed field can still read as that month or year.
 * @param today - Calendar day the shortcuts are measured from.
 * @param labels - Visible names for the three shortcuts.
 * @param bounds - Optional inclusive min and max (`YYYY-MM-DD`).
 * @param bounds.min - Earliest allowed start. A shortcut that begins earlier is disabled.
 * @param bounds.max - Latest allowed end. A shortcut that ends later is disabled.
 * @returns The three shortcuts, with any span outside the bounds disabled.
 */
export function buildDateRangePresets(
  today: Date,
  labels: DateRangePresetLabels,
  bounds?: { min?: string; max?: string },
): DateRangePreset[] {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last7Start = new Date(day);
  last7Start.setDate(day.getDate() - 6);
  const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);
  const monthEnd = new Date(day.getFullYear(), day.getMonth() + 1, 0);
  const year = day.getFullYear();

  const spans: Omit<DateRangePreset, 'disabled'>[] = [
    {
      id: 'last7Days',
      label: labels.last7Days,
      start: toIsoDate(last7Start),
      end: toIsoDate(day),
    },
    {
      id: 'thisMonth',
      label: labels.thisMonth,
      start: toIsoDate(monthStart),
      end: toIsoDate(monthEnd),
    },
    {
      id: 'thisYear',
      label: labels.thisYear,
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    },
  ];

  return spans.map((preset) => ({
    ...preset,
    disabled: !fitsBounds(preset.start, preset.end, bounds?.min, bounds?.max),
  }));
}

function fitsBounds(
  start: string,
  end: string,
  min?: string,
  max?: string,
): boolean {
  if (min && start < min) {
    return false;
  }
  if (max && end > max) {
    return false;
  }
  return true;
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
