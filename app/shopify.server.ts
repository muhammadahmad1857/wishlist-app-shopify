import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Billing Plan Identifiers
export const MONTHLY_PLAN = "Monthly subscription";
export const ANNUAL_PLAN = "Annual subscription";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY as string,
  apiSecretKey: process.env.SHOPIFY_API_SECRET as string,
  apiVersion: ApiVersion.January25,
  scopes: (process.env.SCOPES || "").split(","),
  appUrl: process.env.SHOPIFY_APP_URL as string,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore, // Public Shopify App Store
  isEmbeddedApp: true,

  billing: {
    [MONTHLY_PLAN]: {
      amount: 10,
      currencyCode: "USD",
      //@ts-ignore

      interval: BillingInterval.Every30Days,
    },
    [ANNUAL_PLAN]: {
      amount: 100,
      currencyCode: "USD",
      //@ts-ignore
      interval: BillingInterval.Annual,
    },
  },

  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },

  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },

  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const BILLING_PLAN_KEYS = {
  MONTHLY: "Monthly subscription",
  ANNUAL: "Annual subscription",
} as const;
