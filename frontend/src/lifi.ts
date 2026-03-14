import { createConfig, EVM } from "@lifi/sdk";

// Initialize LI.FI SDK for cross-chain swaps
createConfig({
  integrator: "omnid",
  providers: [
    EVM({
      getWalletClient: async () => {
        // Will be set dynamically when executing routes
        throw new Error("Wallet client not set");
      },
    }),
  ],
});
