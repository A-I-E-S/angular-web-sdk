import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { computed, inject, Injectable, Injector, signal } from '@angular/core';

import type { AiesHttpToastHandler } from '@aies/aies-core';

import {
  TOAST_DURATION_MS,
  toastFingerprint,
  type ToastItem,
  type ToastShowOptions,
  type ToastVariant,
} from './toast.types';
import { ToastHostComponent } from './toast-host.component';

const MAX_VISIBLE = 4;

/**
 * Imperative toast stack for AIES apps.
 *
 * - **danger** — persistent until the user closes it
 * - **warning** — longer auto-dismiss (8s)
 * - **info / success** — shorter auto-dismiss (4.5s)
 * - Identical toasts collapse with a count; close removes the outermost copy,
 *   with Expand / Close all when stacked
 *
 * Also implements {@link AiesHttpToastHandler} for {@link withToast} HTTP tagging.
 *
 * Prefer {@link provideAiesToasts} at bootstrap so the host overlay mounts once.
 */
@Injectable()
export class ToastService implements AiesHttpToastHandler {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  private readonly itemsSignal = signal<ToastItem[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly fingerprints = new Map<string, string>();
  private hostAttached = false;
  private seq = 0;

  /** Live stack (newest first). */
  readonly items = this.itemsSignal.asReadonly();

  /** True when any group has more than one collapsed copy. */
  readonly hasStacks = computed(() =>
    this.itemsSignal().some((t) => t.count > 1),
  );

  /**
   * True when every stacked group (count &gt; 1) is expanded.
   * Used to swap the host control to “Collapse all”.
   */
  readonly allStacksExpanded = computed(() => {
    const stacks = this.itemsSignal().filter((t) => t.count > 1);
    return stacks.length > 0 && stacks.every((t) => t.expanded);
  });

  /**
   * Ensures the fixed toast host is attached (idempotent).
   * Called from {@link provideAiesToasts}.
   */
  ensureHost(): void {
    if (this.hostAttached || typeof document === 'undefined') {
      return;
    }
    const ref = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay
        .position()
        .global()
        .top('1rem')
        .right('1rem'),
      panelClass: [
        'aies-toast-panel',
        'pointer-events-none',
        'z-[1000]',
        '!w-[min(100vw-2rem,24rem)]',
        'max-w-[min(100vw-2rem,24rem)]',
      ],
    });
    ref.attach(new ComponentPortal(ToastHostComponent, null, this.injector));
    this.hostAttached = true;
  }

  /**
   * Push a toast (or bump count if an identical one is already open).
   *
   * @param options - Message + optional variant / duration / title.
   * @returns Toast id (stable across collapse bumps).
   */
  show(options: ToastShowOptions): string {
    this.ensureHost();
    const variant: ToastVariant = options.variant ?? 'info';
    const message = options.message.trim();
    if (!message) {
      return '';
    }
    const title = options.title?.trim() || undefined;
    const durationMs =
      options.durationMs === undefined
        ? TOAST_DURATION_MS[variant]
        : options.durationMs;

    const fp = toastFingerprint(variant, title, message);
    const existingId = this.fingerprints.get(fp);
    if (existingId) {
      const current = this.itemsSignal();
      const hit = current.find((t) => t.id === existingId);
      if (hit) {
        const bumped: ToastItem = {
          ...hit,
          count: hit.count + 1,
          createdAt: Date.now(),
          durationMs,
        };
        this.itemsSignal.set([
          bumped,
          ...current.filter((t) => t.id !== existingId),
        ]);
        this.armTimer(bumped);
        return existingId;
      }
    }

    const id = `aies-toast-${++this.seq}`;
    const item: ToastItem = {
      id,
      message,
      title,
      variant,
      durationMs,
      icon: options.icon,
      count: 1,
      expanded: false,
      createdAt: Date.now(),
    };
    this.fingerprints.set(fp, id);
    let next = [item, ...this.itemsSignal()];
    if (next.length > MAX_VISIBLE) {
      const dropped = next.slice(MAX_VISIBLE);
      next = next.slice(0, MAX_VISIBLE);
      for (const d of dropped) {
        this.teardown(d.id, false);
      }
    }
    this.itemsSignal.set(next);
    this.armTimer(item);
    return id;
  }

  /**
   * Timed info toast.
   *
   * @param message - Body copy.
   * @param title - Optional heading.
   * @returns Toast id.
   */
  info(message: string, title?: string): string {
    return this.show({ variant: 'info', message, title });
  }

  /**
   * Timed success toast.
   *
   * @param message - Body copy.
   * @param title - Optional heading.
   * @returns Toast id.
   */
  success(message: string, title?: string): string {
    return this.show({ variant: 'success', message, title });
  }

  /**
   * Longer timed warning toast.
   *
   * @param message - Body copy.
   * @param title - Optional heading.
   * @returns Toast id.
   */
  warning(message: string, title?: string): string {
    return this.show({ variant: 'warning', message, title });
  }

  /**
   * Persistent error toast — user must dismiss.
   *
   * @param message - Body copy.
   * @param title - Optional heading.
   * @returns Toast id.
   */
  error(message: string, title?: string): string {
    return this.show({ variant: 'danger', message, title });
  }

  /**
   * Close the outermost copy in a stack (decrement count), or remove the toast
   * when only one remains.
   *
   * @param id - From {@link show}.
   */
  dismissOne(id: string): void {
    const item = this.itemsSignal().find((t) => t.id === id);
    if (!item) {
      return;
    }
    if (item.count <= 1) {
      this.teardown(id, true);
      return;
    }
    const nextCount = item.count - 1;
    const next: ToastItem = {
      ...item,
      count: nextCount,
      expanded: item.expanded && nextCount > 1,
      createdAt: Date.now(),
    };
    this.itemsSignal.update((list) =>
      list.map((t) => (t.id === id ? next : t)),
    );
    this.armTimer(next);
  }

  /**
   * Remove an entire toast group (all stacked copies).
   *
   * @param id - From {@link show}.
   */
  dismiss(id: string): void {
    this.teardown(id, true);
  }

  /**
   * Expand a collapsed stack so every copy is visible.
   *
   * @param id - From {@link show}.
   */
  expand(id: string): void {
    this.itemsSignal.update((list) =>
      list.map((t) =>
        t.id === id && t.count > 1 ? { ...t, expanded: true } : t,
      ),
    );
  }

  /**
   * Collapse an expanded stack back to a single card with a count.
   *
   * @param id - From {@link show}.
   */
  collapse(id: string): void {
    this.itemsSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, expanded: false } : t)),
    );
  }

  /** Expand every stacked group (count &gt; 1). */
  expandAll(): void {
    this.itemsSignal.update((list) =>
      list.map((t) => (t.count > 1 ? { ...t, expanded: true } : t)),
    );
  }

  /** Collapse every expanded group. */
  collapseAll(): void {
    this.itemsSignal.update((list) =>
      list.map((t) => ({ ...t, expanded: false })),
    );
  }

  /** Dismiss every open toast. */
  clear(): void {
    for (const id of [...this.timers.keys()]) {
      this.clearTimer(id);
    }
    this.fingerprints.clear();
    this.itemsSignal.set([]);
  }

  /**
   * Pause auto-dismiss while hovered / focused (timed toasts only).
   *
   * @param id - Toast id.
   */
  pause(id: string): void {
    this.clearTimer(id);
  }

  /**
   * Resume auto-dismiss after pause (timed toasts only).
   *
   * @param id - Toast id.
   */
  resume(id: string): void {
    const item = this.itemsSignal().find((t) => t.id === id);
    if (item) {
      this.armTimer(item);
    }
  }

  private armTimer(item: ToastItem): void {
    this.clearTimer(item.id);
    if (item.durationMs == null || item.durationMs <= 0) {
      return;
    }
    const ms = item.durationMs;
    // Timed stacks dismiss one copy at a time so the pile peels down.
    this.timers.set(
      item.id,
      setTimeout(() => this.dismissOne(item.id), ms),
    );
  }

  private teardown(id: string, updateList: boolean): void {
    this.clearTimer(id);
    for (const [fp, toastId] of this.fingerprints) {
      if (toastId === id) {
        this.fingerprints.delete(fp);
        break;
      }
    }
    if (updateList) {
      this.itemsSignal.update((list) => list.filter((t) => t.id !== id));
    }
  }

  private clearTimer(id: string): void {
    const t = this.timers.get(id);
    if (t) {
      clearTimeout(t);
      this.timers.delete(id);
    }
  }
}
