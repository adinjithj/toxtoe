import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  // 1. Verify the Stripe signature to confirm this event is genuine.
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${
          err instanceof Error ? err.message : "unknown error"
        }`,
      },
      { status: 400 }
    );
  }

  // 2. We only care about completed checkouts.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  const productId = String(checkoutSession.metadata?.productId ?? "");
  const userId = String(checkoutSession.metadata?.userId ?? "");
  const checkoutSessionId = checkoutSession.id;
  const amountPaid = checkoutSession.amount_total;
  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : undefined;

  if (!productId || !userId) {
    console.error("checkout.session.completed missing metadata", { checkoutSessionId });
    return NextResponse.json(
      { error: "Webhook missing purchase metadata." },
      { status: 400 }
    );
  }

  // 3. Idempotency: Stripe may deliver the same event more than once.
  const existing = await prisma.purchase.findUnique({
    where: { stripeCheckoutSessionId: checkoutSessionId },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ received: true });
  }

  // 4. Record the completed purchase.
  try {
    await prisma.purchase.create({
      data: {
        userId,
        productId,
        status: "COMPLETED",
        amountPaid: amountPaid ?? 0,
        currency: "usd",
        stripeCheckoutSessionId: checkoutSessionId,
        stripePaymentIntentId: paymentIntentId,
      },
    });

    revalidatePath("/");
  } catch (err) {
    // Log and return 200 so Stripe stops retrying. A divergent state (e.g. the
    // product was deleted between checkout and this webhook) is an ops alert,
    // not a reason to keep replaying the event.
    console.error("Failed to record completed purchase:", err);
  }

  return NextResponse.json({ received: true });
}
