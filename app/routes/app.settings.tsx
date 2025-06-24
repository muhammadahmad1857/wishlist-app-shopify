import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  TextField,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { authenticate } from "../shopify.server";

// Import Prisma db
import db from "../db.server";

// Type for Settings (matching your Prisma 'settings' table)
type Settings = {
  id?: number; // optional if Prisma auto-generates
  name: string;
  description: string;
  shop: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  let settings = await db.settings.findFirst({
    where: {
      shop: session.shop,
    },
  });

  if (!settings) {
    settings = { name: "", description: "", shop: session.shop, id: 1234 };
  }

  return json(settings);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const { session } = await authenticate.admin(request);

  const name = data.name as string;
  const description = data.description as string;

  // update database
  await db.settings.upsert({
    where: { shop: session.shop },
    update: {
      name,
      description,
      shop: session.shop,
    },
    create: {
      name,
      description,
      shop: session.shop,
    },
  });

  return json({ name, description, shop: session.shop });
};

export default function SettingsPage() {
  const settings = useLoaderData<Settings>(); // Type the loader data

  const [formState, setFormState] = useState<Settings>(settings);

  const handleChange = (field: keyof Settings, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Page>
      <ui-title-bar title="Settings" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Update app settings and preferences.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="POST">
              <BlockStack gap="400">
                <TextField
                  label="App Name"
                  value={formState.name}
                  name="name"
                  onChange={(value) => handleChange("name", value)}
                  autoComplete="off"
                />
                <TextField
                  label="Description"
                  value={formState.description}
                  name="description"
                  onChange={(value) => handleChange("description", value)}
                  autoComplete="off"
                  multiline
                />
                <Button submit>Save</Button>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
