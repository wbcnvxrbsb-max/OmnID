import { http, createConfig } from "wagmi";
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  avalanche,
  bsc,
  base,
  baseSepolia,
  hardhat,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    avalanche,
    bsc,
    base,
    baseSepolia,
    hardhat,
  ],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
