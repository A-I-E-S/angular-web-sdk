import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { AIES_SDK_CONFIG, AuthTokenService } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';
import {
  AlertComponent,
  ButtonComponent,
  TextareaComponent,
  ToastService,
} from '@aies/aies-ui';

/** Same end-aligned placement as {@link ActionMenuComponent}. */
const TOKEN_PANEL_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 6,
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -6,
  },
];

/**
 * Playground-only control to paste a bearer token for live SDK HTTP calls.
 *
 * Panel uses CDK connected overlay (same pattern as action menu / select) so it
 * is not clipped by header overflow and gets an opaque surface token.
 */
@Component({
  selector: 'app-playground-access-token',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AlertComponent,
    ButtonComponent,
    TextareaComponent,
    AiesIconComponent,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
  ],
  template: `
    <span class="inline-flex" cdkOverlayOrigin #triggerOrigin="cdkOverlayOrigin">
      <button
        aies-button
        type="button"
        variant="secondary"
        size="sm"
        class="gap-1.5"
        [attr.aria-expanded]="panelOpen()"
        aria-controls="pg-access-token-panel"
        (click)="togglePanel()"
      >
        <span
          class="size-1.5 shrink-0 rounded-full"
          [class]="
            hasToken()
              ? 'bg-export shadow-[0_0_0_2px] shadow-export/25'
              : 'bg-warning shadow-[0_0_0_2px] shadow-warning/25'
          "
          aria-hidden="true"
        ></span>
        {{ hasToken() ? 'Connected' : 'API token' }}
        <aies-icon
          name="chevron-down"
          [size]="12"
          class="shrink-0 text-neutral-500 transition-transform duration-200 dark:text-neutral-400"
          [class.rotate-180]="panelOpen()"
          aria-hidden="true"
        />
      </button>
    </span>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="triggerOrigin"
      [cdkConnectedOverlayOpen]="panelOpen()"
      [cdkConnectedOverlayPositions]="panelPositions"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="closePanel()"
      (overlayOutsideClick)="closePanel()"
      (detach)="closePanel()"
    >
      <div
        id="pg-access-token-panel"
        class="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white shadow-xl outline-none dark:border-white/15 dark:bg-ink-950"
        role="dialog"
        aria-labelledby="pg-access-token-title"
        aria-describedby="pg-access-token-desc"
        tabindex="-1"
        (keydown.escape)="closePanel()"
      >
        <div
          class="flex items-start justify-between gap-3 border-b border-border px-4 py-3 dark:border-white/10"
        >
          <div class="flex min-w-0 items-start gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background-welcome text-ink dark:bg-white/10 dark:text-white"
            >
              <aies-icon name="key" [size]="16" />
            </div>
            <div class="min-w-0">
              <h2
                id="pg-access-token-title"
                class="m-0 text-body-sm font-semibold text-ink dark:text-white"
              >
                API access
              </h2>
              <p
                class="m-0 mt-0.5 truncate font-mono text-caption text-neutral-500 dark:text-neutral-400"
                [title]="apiBaseUrl()"
              >
                {{ apiBaseUrl() }}
              </p>
            </div>
          </div>
          <button
            aies-button
            type="button"
            variant="ghost"
            size="sm"
            class="shrink-0 self-start"
            aria-label="Close"
            (click)="closePanel()"
          >
            <aies-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="flex flex-col gap-4 p-4">
          @if (hasToken()) {
            <aies-alert
              variant="success"
              title="Token active"
              [message]="connectedMessage()"
              [dismissible]="false"
            />
          } @else {
            <aies-alert
              variant="warning"
              title="Not connected"
              message="Live SDK calls (filter catalogs, user profile, …) need a bearer token from the test API."
              [dismissible]="false"
            />
          }

          <div id="pg-access-token-desc" class="flex flex-col gap-3">
            <aies-textarea
              label="Access token"
              hint="Paste access_token from login/register. Stored in localStorage as aies.accessToken."
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
              [rows]="3"
              [(value)]="draft"
            />

            <p class="m-0 text-caption text-neutral-500 dark:text-neutral-400">
              Sent as
              <span class="pg-code">Authorization: Bearer …</span>
              on outbound HTTP via the SDK interceptor.
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-2 border-t border-border bg-background-welcome px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <button
            aies-button
            type="button"
            variant="ghost"
            size="sm"
            [disabled]="!hasToken()"
            (click)="clear()"
          >
            Clear token
          </button>
          <button
            aies-button
            type="button"
            variant="primary"
            size="sm"
            [disabled]="draft().trim() === ''"
            (click)="save()"
          >
            Save &amp; connect
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class PlaygroundAccessTokenComponent {
  private readonly auth = inject(AuthTokenService);
  private readonly sdkConfig = inject(AIES_SDK_CONFIG);
  private readonly toast = inject(ToastService);

  protected readonly panelPositions = TOKEN_PANEL_POSITIONS;
  protected readonly panelOpen = signal(false);
  protected readonly draft = signal('');

  protected readonly hasToken = computed(() => this.auth.token() != null);

  protected readonly apiBaseUrl = computed(() => this.sdkConfig.baseUrl);

  protected readonly connectedMessage = computed(() => {
    const token = this.auth.token();
    if (!token) {
      return '';
    }
    const suffix = token.length <= 4 ? '••••' : `••••${token.slice(-4)}`;
    return `Requests include your saved token (${suffix}). Replace below to update.`;
  });

  protected togglePanel(): void {
    this.panelOpen.update((open) => !open);
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }

  protected save(): void {
    this.auth.set(this.draft());
    this.draft.set('');
    this.closePanel();
    this.toast.success(
      'SDK HTTP calls will include your bearer token.',
      'Connected',
    );
  }

  protected clear(): void {
    this.auth.clear();
    this.draft.set('');
    this.toast.info(
      'Live catalog and profile calls may fail until you connect again.',
      'Token cleared',
    );
  }
}
