import Stripe from "stripe";

// Lazily initialized server-side Stripe client. Using a getter (instead of a
// top-level `new Stripe(...)`) keeps the build safe when STRIPE_SECRET_KEY is
// not yet set, while still failing fast with a clear message at request time.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local.");
    }
    _stripe = new Stripe(secretKey);
  }
  return _stripe;
}
