"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { placeOrderAction, type PlaceOrderActionResult } from "@/lib/actions/checkout";
import { applyCartChanges } from "@/lib/cart";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import {
  validateCheckout,
  type CheckoutFieldErrors,
  type CheckoutFieldName,
} from "@/lib/validation/checkout";
import type { CartProduct } from "@/types/cart";
import type { PaymentMethod } from "@/types/order";

import { useCart } from "./cart-provider";
import type { CartItemView } from "./use-resolved-cart";

type FormValues = Record<CheckoutFieldName, string>;

type FormState = {
  values: FormValues;
  errors: CheckoutFieldErrors;
  /** A form-level problem (network, empty cart, ...). */
  alert: string | null;
  placed: boolean;
};

const EMPTY_VALUES: FormValues = {
  customer_name: "",
  customer_email: "",
  contact_number: "",
  delivery_address: "",
  payment_method: "",
  notes: "",
};

const INITIAL_STATE: FormState = { values: EMPTY_VALUES, errors: {}, alert: null, placed: false };

const FIELD_ORDER: CheckoutFieldName[] = [
  "customer_name",
  "customer_email",
  "contact_number",
  "delivery_address",
  "payment_method",
  "notes",
];

const FAILURE_MESSAGES: Record<"empty_cart" | "invalid_items" | "server_error" | "network", string> = {
  empty_cart: "Your cart is empty, so there was nothing to order.",
  invalid_items:
    "Something in your cart couldn't be read. Remove the item that looks wrong and try again. Your cart hasn't been changed.",
  server_error: "We couldn't place your order just now. Nothing was saved and your cart is unchanged. Please try again.",
  network:
    "We couldn't reach the store. Check your connection and try again. Nothing was saved and your cart is unchanged.",
};

type CheckoutFormProps = {
  /** Lines with current product data, as shown in the summary. */
  items: (CartItemView & { product: CartProduct })[];
  /** False while prices are being checked; ordering waits for fresh prices. */
  ready: boolean;
  /** place_order said the cart changed: show these notices and re-check prices. */
  onCartChanged: (notices: string[]) => void;
  /** The order was saved; called just before the cart is cleared. */
  onPlaced: () => void;
};

export function CheckoutForm({ items, ready, onCartChanged, onPlaced }: CheckoutFormProps) {
  const router = useRouter();
  const cart = useCart();

  /**
   * Runs in the browser on submit. useActionState runs submissions one at a
   * time, and the submit button is disabled while one is pending.
   */
  async function submit(_previous: FormState, formData: FormData): Promise<FormState> {
    const values = Object.fromEntries(
      FIELD_ORDER.map((field) => [field, String(formData.get(field) ?? "")]),
    ) as FormValues;

    // 1. Quick check in the browser for inline errors. The server checks again.
    const check = validateCheckout(values);
    if (!check.ok) return { values, errors: check.errors, alert: null, placed: false };
    if (!ready) {
      return { values, errors: {}, alert: "Still checking current prices. Try again in a moment.", placed: false };
    }

    // 2. Send the prices the customer was shown, so the database can spot changes.
    let result: PlaceOrderActionResult;
    try {
      result = await placeOrderAction({
        fields: values,
        items: items.map(({ line, product }) => ({
          productId: line.productId,
          quantity: line.quantity,
          expectedUnitPriceCents: product.priceCents,
        })),
      });
    } catch {
      return { values, errors: {}, alert: FAILURE_MESSAGES.network, placed: false };
    }

    // 3. Only a confirmed save clears the cart and shows the confirmation.
    if (result.ok) {
      onPlaced();
      router.replace(`/orders/${result.orderId}`);
      cart.clear();
      return { values, errors: {}, alert: null, placed: true };
    }

    switch (result.code) {
      case "invalid_fields":
        return { values, errors: result.errors, alert: null, placed: false };
      case "cart_changed": {
        // Nothing was saved. Fix the cart, show what changed, and wait for
        // the customer to review and press Place order again.
        const update = applyCartChanges(cart.lines, result.changes);
        cart.replace(update.lines);
        onCartChanged(update.notices);
        return { values, errors: {}, alert: null, placed: false };
      }
      default:
        // empty_cart, invalid_items, server_error: keep the cart untouched.
        return { values, errors: {}, alert: FAILURE_MESSAGES[result.code], placed: false };
    }
  }

  const [state, formAction] = useActionState(submit, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  // Move focus to the first field with an error so it's seen and announced.
  useEffect(() => {
    const first = FIELD_ORDER.find((field) => state.errors[field]);
    if (!first) return;
    const target = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    target?.focus();
  }, [state.errors]);

  const { values, errors } = state;

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6" aria-describedby="checkout-required-note">
      <p id="checkout-required-note" className="text-caption text-muted-foreground">
        All fields are required except notes.
      </p>

      {state.alert && (
        <div role="alert" className="rounded-card border border-destructive/30 bg-destructive-soft p-4 text-destructive">
          {state.alert}
        </div>
      )}

      <TextField name="customer_name" label="Full name" autoComplete="name" values={values} errors={errors} />
      <TextField
        name="customer_email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        values={values}
        errors={errors}
      />
      <TextField
        name="contact_number"
        label="Contact number"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        hint="For example, +63 917 000 1234"
        values={values}
        errors={errors}
      />

      <div className="space-y-2">
        <Label htmlFor="delivery_address">Delivery address</Label>
        <Textarea
          id="delivery_address"
          name="delivery_address"
          autoComplete="street-address"
          rows={3}
          defaultValue={values.delivery_address}
          aria-invalid={Boolean(errors.delivery_address)}
          aria-describedby={errors.delivery_address ? "delivery_address-error" : undefined}
        />
        <FieldError name="delivery_address" errors={errors} />
      </div>

      <fieldset
        className="space-y-2"
        aria-describedby={errors.payment_method ? "payment_method-error" : undefined}
      >
        <legend className="mb-2 text-sm font-medium">Payment method</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method: PaymentMethod) => (
            <label
              key={method}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-input bg-card px-4 py-3",
                "has-checked:border-foreground has-checked:bg-accent",
                "has-focus-visible:ring-3 has-focus-visible:ring-ring",
                errors.payment_method && "border-destructive",
              )}
            >
              <input
                type="radio"
                name="payment_method"
                value={method}
                defaultChecked={values.payment_method === method}
                className="size-4 accent-ink"
              />
              <span className="font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
            </label>
          ))}
        </div>
        <p className="text-caption text-muted-foreground">Selection only. Nothing is charged in this demo store.</p>
        <FieldError name="payment_method" errors={errors} />
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          maxLength={500}
          placeholder="Anything the courier should know"
          defaultValue={values.notes}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? "notes-error" : undefined}
        />
        <FieldError name="notes" errors={errors} />
      </div>

      <SubmitButton disabled={!ready || state.placed} />
    </form>
  );
}

type TextFieldProps = {
  name: CheckoutFieldName;
  label: string;
  values: FormValues;
  errors: CheckoutFieldErrors;
  hint?: string;
} & Pick<React.ComponentProps<"input">, "type" | "autoComplete" | "inputMode">;

function TextField({ name, label, values, errors, hint, ...inputProps }: TextFieldProps) {
  const describedBy = [hint && `${name}-hint`, errors[name] && `${name}-error`].filter(Boolean).join(" ");
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        // After a failed submit, React resets the form to these defaults,
        // which are the values the customer just typed.
        defaultValue={values[name]}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && (
        <p id={`${name}-hint`} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError name={name} errors={errors} />
    </div>
  );
}

function FieldError({ name, errors }: { name: CheckoutFieldName; errors: CheckoutFieldErrors }) {
  if (!errors[name]) return null;
  return (
    <p id={`${name}-error`} className="text-caption font-medium text-destructive">
      {errors[name]}
    </p>
  );
}

/** Disabled while saving, so the order can't be sent twice. */
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending || disabled} aria-disabled={pending || disabled}>
      {pending ? "Placing your order…" : "Place order"}
    </Button>
  );
}
