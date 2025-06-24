import { type LoaderFunction } from "@remix-run/node";
import { authenticate, BILLING_PLAN_KEYS } from "../shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const { shop } = session;
  const myShop = shop.replace(".myshopify.com", "");

  await billing.require({
    //@ts-ignore
    plans: [BILLING_PLAN_KEYS.MONTHLY],
    onFailure: async () =>
      billing.request({
        //@ts-ignore
        plan: BILLING_PLAN_KEYS.MONTHLY,
        isTest: true,
        returnUrl: `https://admin.shopify.com/store/${myShop}/apps/${process.env.APP_NAME}/app/pricing`,
      }),
  });

  // App logic
  return null;
};
