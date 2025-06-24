import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import db from "../db.server";
export function withCors(request: Request, response: Response): Response {
  const origin = request.headers.get("Origin") || "*";

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
// Type for Wishlist item (adjust fields based on your DB schema)
type WishlistItem = {
  id: number;
  customerId: string | null;
  productId: string | null;
  shop: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!customerId || !shop || !productId) {
    const response = json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET",
    });
    return withCors(request, response);
  }

  const wishlist: WishlistItem[] = await db.wishlist.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: productId,
    },
  });

  const response = json({
    ok: true,
    message: "Success",
    data: wishlist,
  });

  return withCors(request, response);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const customerId = data.customerId as string | undefined;
  const productId = data.productId as string | undefined;
  const shop = data.shop as string | undefined;
  const _action = data._action as string | undefined;

  if (!customerId || !productId || !shop || !_action) {
    return json({
      message:
        "Missing data. Required data: customerId, productId, shop, _action",
      method: _action,
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      await db.wishlist.create({
        data: {
          customerId,
          productId,
          shop,
        },
      });

      response = json({
        message: "Product added to wishlist",
        method: _action,
        wishlisted: true,
      });
      return withCors(request, response);

    case "PATCH":
      // No logic yet, just dummy response
      response = json({
        message: "Success",
        method: "PATCH",
      });
      return withCors(request, response);

    case "DELETE":
      await db.wishlist.deleteMany({
        where: {
          customerId,
          shop,
          productId,
        },
      });

      response = json({
        message: "Product removed from your wishlist",
        method: _action,
        wishlisted: false,
      });
      return withCors(request, response);

    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
};
