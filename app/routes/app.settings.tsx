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
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import {ActionFunctionArgs, json} from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react";
export const loader = async () => {
  let settings = {
    name: "App Name",
    description: "My App",
  };
  return json(settings);
};
export default function Settings() {
  const settings = useLoaderData<typeof loader>();
  const [formState, setFormState] = useState(settings);

  const handleChange = (field: "name" | "description", value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    console.log(`${field} changed to:`, value);
  };

  return (
    <Page>
      <TitleBar title="Settings" />

      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                App Configuration
              </Text>
              <Text as="p" variant="bodyMd">
                Configure your wishlist app settings such as name and
                description.
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
                <div style={{ display: "flex", justifyContent: "flex-end", }}>
                <Button fullWidth={false} variant="primary" submit={true}>
                  Save
                </Button></div>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("Form data received:", formData);
  const settings = Object.fromEntries(formData);
  console.log("Settings submitted:", settings);

  return json({ success: true, message: "Settings saved successfully!" });
};

