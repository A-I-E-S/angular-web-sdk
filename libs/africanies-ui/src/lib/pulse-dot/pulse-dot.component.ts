import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Red pulsing dot for live / unread data (e.g. WebSocket updates).
 * Prefer `@if (active) { <africanies-pulse-dot /> }` at the call site when
 * inactive should take no space; {@link active} still hides the dot when false.
 */
@Component({
  selector: 'africanies-pulse-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <span
        class="africanies-pulse-dot"
        role="status"
        [attr.aria-label]="label()"
      ></span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .africanies-pulse-dot {
      position: relative;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background: #b4233c;
      box-shadow: 0 0 0 0 rgba(180, 35, 60, 0.55);
      animation: africanies-pulse-dot 2s ease-out infinite;
    }

    @keyframes africanies-pulse-dot {
      0% {
        box-shadow: 0 0 0 0 rgba(180, 35, 60, 0.55);
      }
      70% {
        box-shadow: 0 0 0 0.45rem rgba(180, 35, 60, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(180, 35, 60, 0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .africanies-pulse-dot {
        animation: none;
      }
    }
  `,
})
export class PulseDotComponent {
  /** When false, renders nothing. */
  readonly active = input(true, { transform: booleanAttribute });
  /** Accessible label for screen readers. */
  readonly label = input('New updates available');
}
