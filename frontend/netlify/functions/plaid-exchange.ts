import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

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
    const { public_token } = await req.json();

    if (!public_token) {
      return new Response(
        JSON.stringify({ error: "public_token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = exchangeResponse.data.access_token;

    // Fetch account info
    const authResponse = await plaidClient.authGet({
      access_token: accessToken,
    });

    const accounts = authResponse.data.accounts.map((account) => ({
      account_id: account.account_id,
      name: account.name,
      official_name: account.official_name,
      type: account.type,
      subtype: account.subtype,
      mask: account.mask,
      balances: {
        available: account.balances.available,
        current: account.balances.current,
        currency: account.balances.iso_currency_code ?? "USD",
      },
    }));

    // Fetch recent transactions using transactions/sync
    let transactions: Array<{
      transaction_id: string;
      name: string;
      amount: number;
      date: string;
      category: string[];
      merchant_name: string | null;
    }> = [];

    try {
      const syncResponse = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      transactions = syncResponse.data.added.map((txn) => ({
        transaction_id: txn.transaction_id,
        name: txn.name,
        amount: txn.amount,
        date: txn.date,
        category: txn.category ?? [],
        merchant_name: txn.merchant_name ?? null,
      }));
    } catch {
      // Transactions may not be immediately available in sandbox;
      // return empty array rather than failing the whole request
      transactions = [];
    }

    // Return sanitized data (no access_token sent to frontend)
    return new Response(
      JSON.stringify({ accounts, transactions }),
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
  path: "/.netlify/functions/plaid-exchange",
};
