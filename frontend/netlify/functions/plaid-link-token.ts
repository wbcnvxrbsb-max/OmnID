import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { client_user_id } = await req.json();

    if (!client_user_id) {
      return new Response(
        JSON.stringify({ error: "client_user_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id },
      client_name: "OmnID",
      products: [Products.Auth, Products.Transactions, Products.Identity],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return new Response(
      JSON.stringify({ link_token: response.data.link_token }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = {
  path: "/.netlify/functions/plaid-link-token",
};
