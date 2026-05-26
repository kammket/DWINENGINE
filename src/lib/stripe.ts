import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  premium_monthly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
    name: "Premium Monthly",
    amount: 1900, // $19/mo in cents
    currency: "usd",
    interval: "month" as const,
    features: [
      "Unlimited calculators",
      "AI reflections (50/month)",
      "Future scenario simulations",
      "Trend analytics",
      "Historical reports",
      "Priority support",
    ],
  },
  premium_annual: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL!,
    name: "Premium Annual",
    amount: 15900, // $159/yr in cents
    currency: "usd",
    interval: "year" as const,
    features: [
      "Everything in Monthly",
      "Save 30% annually",
      "12-month trend reports",
      "Early access to features",
    ],
  },
  enterprise_monthly: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    name: "Enterprise Monthly",
    amount: 9900, // $99/mo per seat
    currency: "usd",
    interval: "month" as const,
    features: [
      "Everything in Premium",
      "Team analytics dashboard",
      "Workforce burnout monitoring",
      "HR sustainability reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
};

export async function createCheckoutSession(
  userId: string,
  email: string | null | undefined,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const payload: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  };

  // Stripe rejects empty/invalid customer_email values.
  if (email && email.includes("@")) {
    payload.customer_email = email;
  }

  return stripe.checkout.sessions.create(payload);
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
