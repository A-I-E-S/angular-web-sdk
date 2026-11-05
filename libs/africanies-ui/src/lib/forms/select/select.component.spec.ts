import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import type { SelectOption } from './select.types';

@Component({
  standalone: true,
  imports: [SelectComponent],
  template: `
    <africanies-select
      label="Countries"
      [multiple]="true"
      [options]="options"
      [(selected)]="selected"
    />
  `,
})
class MultiSelectHostComponent {
  readonly options: SelectOption<string>[] = [
    { label: 'Nigeria', value: 'NG' },
    { label: 'Ghana', value: 'GH' },
  ];
  readonly selected = signal<SelectOption<string>[]>([
    { label: 'Nigeria', value: 'NG' },
    { label: 'Ghana', value: 'GH' },
  ]);
}

describe('SelectComponent clear all', () => {
  let fixture: ComponentFixture<MultiSelectHostComponent>;
  let host: MultiSelectHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('clears every selected option', () => {
    const clear = clearAllButton(fixture.nativeElement);
    expect(clear).not.toBeNull();
    clear?.click();
    fixture.detectChanges();

    expect(host.selected()).toEqual([]);
    expect(clearAllButton(fixture.nativeElement)).toBeNull();
  });
});

function clearAllButton(root: ParentNode): HTMLButtonElement | null {
  return (
    [...root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Clear all',
    ) ?? null
  );
}
