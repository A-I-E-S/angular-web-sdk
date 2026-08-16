import type {
  CurrencyModel,
  CurrencyPaymentMethodPivotModel,
} from '../currency/currency.model';

/**
 * Payment-method shapes from utility read endpoints.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names match the wire (snake_case). Mapping in `@aies/aies-core`
 * preserves those keys.
 */

/**
 * Currency nested on {@link PaymentMethodModel} — currency fields plus the
 * join pivot (no nested `payment_methods`).
 */
export interface PaymentMethodCurrencyModel
  extends Omit<CurrencyModel, 'payment_methods'> {
  /** Join keys for this payment method. */
  pivot: CurrencyPaymentMethodPivotModel;
}

/**
 * Payment processor record from `GET /payment_method/read/{id|all}`.
 */
export interface PaymentMethodModel {
  /** Numeric payment-method id. */
  id: number;

  /** Display name (e.g. `"Squad"`, `"Stripe"`). */
  name: string;

  /** Backend model class path (e.g. `"App\\Models\\Stripe"`). */
  model: string;

  /** Whether the method is available. */
  active: boolean;

  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;

  /** Currencies this processor accepts. */
  currencies: PaymentMethodCurrencyModel[];
}
