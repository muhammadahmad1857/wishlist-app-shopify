import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { authenticate, BILLING_PLAN_KEYS } from "../shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { billing } = await authenticate.admin(request);

  const billingCheck = await billing.require({
    //@ts-ignore
    plans: [BILLING_PLAN_KEYS.MONTHLY], // ✅ Key (string) used here
    //@ts-ignore
    onFailure: async () => billing.request({ plan: BILLING_PLAN_KEYS.MONTHLY }), // ✅ Same key here
  });

  const subscription = billingCheck.appSubscriptions[0];

  await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true, // set false in production
    prorate: true,
  });

  return redirect("/app/pricing");
};
