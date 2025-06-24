import {
  Page,
  Box,
  Button,
  Card,
  CalloutCard,
  Text,
  Grid,
  Divider,
  BlockStack,
  ExceptionList,
} from "@shopify/polaris";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
import { MobileIcon } from "@shopify/polaris-icons";

type Plan = {
  title: string;
  description: string;
  price: string;
  action: string;
  name: string;
  url: string;
  features: string[];
};

type LoaderData = {
  billing: any; // you can refine this with Shopify Billing types if desired
  plan: {
    name: string;
    id?: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { billing } = await authenticate.admin(request);

  try {
    const billingCheck = await billing.require({
      //@ts-ignore
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
      onFailure: () => {
        throw new Error("No active plan");
      },
    });

    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
    return json<LoaderData>({ billing, plan: subscription });
  } catch (error: any) {
    if (error.message === "No active plan") {
      console.log("Shop does not have any active plans.");
      return json<LoaderData>({ billing, plan: { name: "Free" } });
    }
    throw error;
  }
}

const planData: Plan[] = [
  {
    title: "Free",
    description: "Free plan with basic features",
    price: "0",
    action: "Upgrade to pro",
    name: "Free",
    url: "/app/upgrade",
    features: [
      "100 wishlist per day",
      "500 Products",
      "Basic customization",
      "Basic support",
      "Basic analytics",
    ],
  },
  {
    title: "Pro",
    description: "Pro plan with advanced features",
    price: "10",
    name: "Monthly subscription",
    action: "Upgrade to pro",
    url: "/app/upgrade",
    features: [
      "Unlimted wishlist per day",
      "10000 Products",
      "Advanced customization",
      "Priority support",
      "Advanced analytics",
    ],
  },
];

export default function PricingPage() {
  const { plan } = useLoaderData<LoaderData>();

  return (
    <Page>
      <ui-title-bar title="Pricing" />
      <CalloutCard
        title="Change your plan"
        illustration="https://cdn.shopify.com/s/files/1/0583/6465/7734/files/tag.png?v=1705280535"
        primaryAction={{
          content: "Cancel Plan",
          url: "/app/cancel",
        }}
      >
        {plan.name === "Monthly subscription" ? (
          <p>You're currently on the Pro plan. All features are unlocked.</p>
        ) : (
          <p>
            You're currently on the Free plan. Upgrade to Pro to unlock more
            features.
          </p>
        )}
      </CalloutCard>

      <Box paddingBlock="400">
        <Divider />
      </Box>

      <Grid>
        {planData.map((planItem, index) => (
          <Grid.Cell
            key={index}
            columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
          >
            <Card
              background={
                planItem.name === plan.name
                  ? "bg-surface-success"
                  : "bg-surface"
              }
            >
              <Box padding="400">
                <Text as="h3" variant="headingMd">
                  {planItem.title}
                </Text>
                <Text as="p" variant="bodyMd">
                  {planItem.description}
                  <br />
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {planItem.price === "0" ? "" : `$${planItem.price}`}
                  </Text>
                </Text>

                <Box paddingBlock="200">
                  <Divider />
                </Box>

                <BlockStack gap="100">
                  {planItem.features.map((feature, featureIndex) => (
                    <ExceptionList
                      key={featureIndex}
                      items={[
                        {
                          icon: MobileIcon,
                          description: feature,
                        },
                      ]}
                    />
                  ))}
                </BlockStack>

                <Box paddingBlock="200">
                  <Divider />
                </Box>

                {planItem.name === "Monthly subscription" ? (
                  plan.name !== "Monthly subscription" ? (
                    <Button variant="primary" url={planItem.url}>
                      {planItem.action}
                    </Button>
                  ) : (
                    <Text as="p" variant="bodyMd">
                      You're currently on this plan
                    </Text>
                  )
                ) : null}
              </Box>
            </Card>
          </Grid.Cell>
        ))}
      </Grid>
    </Page>
  );
}
