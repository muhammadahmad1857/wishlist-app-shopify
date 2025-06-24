import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Heart, Mail, Smartphone } from "lucide-react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
   <h1 className={styles.heading}>Turn Shopper Dreams into Sales</h1>
<p className={styles.text}>
  The ultimate Shopify wishlist app to help customers save favorites and return later to buy.
</p>

{showForm && (
  <Form className={styles.form} method="post" action="/auth/login">
    <label className={styles.label}>
      <span>Enter your Shopify domain</span>
      <input className={styles.input} type="text" name="shop" placeholder="e.g. my-store.myshopify.com" />
    </label>
    <button className={styles.button} type="submit">
      Connect Store
    </button>
  </Form>
)}

<ul className={styles.list}>
  <li>
    <Heart className={styles.icon} />
    <div>
      <strong>Save for later</strong><br />
      Let customers bookmark products they love — no need to add to cart immediately.
    </div>
  </li>
  <li>
    <Mail className={styles.icon} />
    <div>
      <strong>Email reminders</strong><br />
      Automatically remind customers when their wishlist items are in stock or on sale.
    </div>
  </li>
  <li>
    <Smartphone className={styles.icon} />
    <div>
      <strong>Sync across devices</strong><br />
      Wishlists are tied to accounts and available on all their devices.
    </div>
  </li>
</ul>

      </div>
    </div>
  );
}
