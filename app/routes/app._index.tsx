import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  EmptyState,
  DataTable,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useLoaderData } from "@remix-run/react";
import { formatDistanceToNow, parseISO } from "date-fns";

// Define Wishlist type according to your Prisma schema
type WishlistItem = {
  id: number;
  customerId?: string | null;
  productId?: string | null;
  shop?: string | null;
  createdAt: Date; // assuming it's an ISO string; adjust if Date type
};

export const loader: LoaderFunction = async ({ request }) => {
  const auth = await authenticate.admin(request);
  const shop = auth.session.shop;

  const wishlistData: WishlistItem[] = await db.wishlist.findMany({
    where: { shop },
    orderBy: { id: "asc" },
  });

  return json(wishlistData);
};

export const action: ActionFunction = async ({ request }) => {
  // You haven't implemented any action yet — safe placeholder
  return json({ message: "No action implemented" });
};

export default function Index() {
  const wishlistData = useLoaderData<WishlistItem[]>();

  const wishlistArray = wishlistData.map((item) => {
    const createdAt = formatDistanceToNow(parseISO(item.createdAt), {
      addSuffix: true,
    });
    return [item.customerId, item.productId, createdAt];
  });

  return (
    <Page title="Wishlist overview dashboard">
      <ui-title-bar title="Overview" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              {wishlistData.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Customer ID", "Product ID", "Created At"]}
                  rows={wishlistArray}
                />
              ) : (
                <EmptyState
                  heading="Manage your wishlist products here"
                  action={{
                    content: "Learn more",
                    url: "https://kognifi.ai",
                    external: true,
                  }}
                  secondaryAction={{
                    content: "Visit Us",
                    url: "https://kognifi.ai",
                    external: true,
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>You don't have any products in your wishlist yet.</p>
                </EmptyState>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
