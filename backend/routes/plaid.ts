import { Router } from "express";
import type { Request, Response } from "express";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";

const router = Router();

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

// POST /api/plaid/link-token
router.post("/api/plaid/link-token", async (req: Request, res: Response) => {
  try {
    const { client_user_id } = req.body;

    if (!client_user_id) {
      res.status(400).json({ error: "client_user_id is required" });
      return;
    }

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id },
      client_name: "OmnID",
      products: [Products.Auth, Products.Transactions, Products.Identity],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    res.json({ link_token: response.data.link_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// POST /api/plaid/exchange
router.post("/api/plaid/exchange", async (req: Request, res: Response) => {
  try {
    const { public_token } = req.body;

    if (!public_token) {
      res.status(400).json({ error: "public_token is required" });
      return;
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
    res.json({ accounts, transactions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
