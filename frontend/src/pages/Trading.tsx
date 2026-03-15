import { useState, useEffect, useCallback } from "react";
import { pushActivity } from "../activity";
import { fetchCryptoPrices, CHAIN_NATIVE_SYMBOL, type CryptoPrice } from "../api/crypto-prices";
import { getTokenBalances, type TokenBalance } from "../api/token-balances";
import { getConnectedPaymentMethods, fundingLabel } from "../funding";
import type { PaymentMethod } from "../data/sandbox-payments";
import {
  getQuote,
  getTokens,
  getChains,
  executeRoute,
  convertQuoteToRoute,
  createConfig,
  EVM,
} from "@lifi/sdk";
import { ChainType } from "@lifi/types";
import type { Token, ExtendedChain, Route } from "@lifi/types";
import {
  hasWallet,
  createNewWallet,
  importWallet,
  getAddress,
  getMnemonic,
  makeWalletClient,
  getNativeBalances,
  deleteWallet,
  SUPPORTED_CHAINS,
  CHAIN_META,
  type ChainBalance,
} from "../wallet";
import StocksTrading from "../components/StocksTrading";

// LI.FI only supports mainnet chains — exclude testnets from trading
const TRADING_CHAIN_IDS = SUPPORTED_CHAINS.map((c) => c.id).filter((id) => id !== 84532);
const SUPPORTED_CHAIN_IDS = TRADING_CHAIN_IDS;


type Tab = "crypto" | "stocks";
type SwapStep = "idle" | "quoting" | "configure" | "executing" | "done" | "error";

export default function Trading() {
  // ─── Wallet state ───
  const [walletReady, setWalletReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(null);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [newMnemonic, setNewMnemonic] = useState<string | null>(null);
  const [importMode, setImportMode] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importError, setImportError] = useState("");
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [balances, setBalances] = useState<Record<number, ChainBalance>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>({});
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  // ─── Tab ───
  const [tab, setTab] = useState<Tab>("crypto");

  // ─── LI.FI data ───
  const [lifiChains, setLifiChains] = useState<ExtendedChain[]>([]);
  const [tokens, setTokens] = useState<Record<number, Token[]>>({});
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  // ─── Swap form ───
  const [fromChainId, setFromChainId] = useState(1);
  const [toChainId, setToChainId] = useState(137);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [swapStep, setSwapStep] = useState<SwapStep>("idle");
  const [quote, setQuote] = useState<Route | null>(null);
  const [swapError, setSwapError] = useState("");
  const [txHash, setTxHash] = useState("");

  // ─── Token browser ───
  const [browseChainId, setBrowseChainId] = useState<number | "all">("all");
  const [browseSearch, setBrowseSearch] = useState("");

  // ─── Transfer form ───
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferChainId, setTransferChainId] = useState(84532);
  const [transferSending, setTransferSending] = useState(false);
  const [transferResult, setTransferResult] = useState<{ hash?: string; error?: string } | null>(null);

  // ─── Funding sources ───
  const [fundingSources, setFundingSources] = useState<PaymentMethod[]>([]);
  const [selectedFundingId, setSelectedFundingId] = useState<string | null>(null);
  useEffect(() => {
    setFundingSources(getConnectedPaymentMethods());
    const onStorage = () => setFundingSources(getConnectedPaymentMethods());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // ─── Check for existing wallet on mount ───
  useEffect(() => {
    if (hasWallet()) {
      const addr = getAddress();
      if (addr) {
        setWalletAddress(addr);
        setWalletReady(true);
      }
    }
  }, []);

  // ─── Load balances + crypto prices when wallet is ready ───
  useEffect(() => {
    if (!walletReady || !walletAddress) return;
    setLoadingBalances(true);
    const symbols = [...new Set(Object.values(CHAIN_NATIVE_SYMBOL))];
    Promise.all([
      getNativeBalances(walletAddress),
      fetchCryptoPrices(symbols),
      getTokenBalances(walletAddress),
    ]).then(([b, prices, tBals]) => {
      setBalances(b);
      setCryptoPrices(prices);
      setTokenBalances(tBals);
      setLoadingBalances(false);
    });
  }, [walletReady, walletAddress]);

  function refreshBalances() {
    if (!walletAddress) return;
    setLoadingBalances(true);
    const symbols = [...new Set(Object.values(CHAIN_NATIVE_SYMBOL))];
    Promise.all([
      getNativeBalances(walletAddress),
      fetchCryptoPrices(symbols),
      getTokenBalances(walletAddress),
    ]).then(([b, prices, tBals]) => {
      setBalances(b);
      setCryptoPrices(prices);
      setTokenBalances(tBals);
      setLoadingBalances(false);
    });
  }

  // ─── Initialize LI.FI SDK with our wallet ───
  useEffect(() => {
    if (!walletReady) return;
    createConfig({
      integrator: "omnid",
      providers: [
        EVM({
          getWalletClient: async () => makeWalletClient(SUPPORTED_CHAINS[0]),
          switchChain: async (chainId) => {
            const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
            if (!chain) throw new Error(`Unsupported chain ${chainId}`);
            return makeWalletClient(chain);
          },
        }),
      ],
    });
    setSdkReady(true);
  }, [walletReady]);

  // ─── Load chains + tokens from LI.FI ───
  useEffect(() => {
    async function load() {
      try {
        setLoadingTokens(true);
        const [chainsRes, tokensRes] = await Promise.all([
          getChains({ chainTypes: [ChainType.EVM] }),
          getTokens({ chains: SUPPORTED_CHAIN_IDS }),
        ]);
        setLifiChains(chainsRes.filter((c) => SUPPORTED_CHAIN_IDS.includes(c.id)));
        setTokens(tokensRes.tokens as Record<number, Token[]>);
        const ethTokens = (tokensRes.tokens as Record<number, Token[]>)[1] ?? [];
        const usdc = ethTokens.find((t) => t.symbol === "USDC");
        const polyTokens = (tokensRes.tokens as Record<number, Token[]>)[137] ?? [];
        const polyUsdc = polyTokens.find((t) => t.symbol === "USDC");
        if (usdc) setFromToken(usdc);
        if (polyUsdc) setToToken(polyUsdc);
      } catch (e) {
        console.error("Failed to load LI.FI data:", e);
      } finally {
        setLoadingTokens(false);
      }
    }
    load();
  }, []);

  // ─── Wallet handlers ───
  function handleCreateWallet() {
    const mnemonic = createNewWallet();
    setNewMnemonic(mnemonic);
    setCreatingWallet(true);
  }

  function handleConfirmSeed() {
    setCreatingWallet(false);
    setNewMnemonic(null);
    const addr = getAddress();
    if (addr) {
      setWalletAddress(addr);
      setWalletReady(true);
      pushActivity("Created OmnID crypto wallet", "WL", "bg-indigo-600");
    }
  }

  function handleImportWallet() {
    setImportError("");
    try {
      importWallet(importInput.trim());
      const addr = getAddress();
      if (!addr) throw new Error("Invalid");
      setWalletAddress(addr);
      setWalletReady(true);
      setImportMode(false);
      setImportInput("");
      pushActivity("Imported crypto wallet", "WL", "bg-indigo-600");
    } catch {
      setImportError("Invalid seed phrase. Check your words and try again.");
    }
  }

  async function handleTransfer() {
    if (!walletAddress || !transferTo.match(/^0x[0-9a-fA-F]{40}$/) || !transferAmount) return;
    setTransferSending(true);
    setTransferResult(null);
    try {
      const chain = SUPPORTED_CHAINS.find((c) => c.id === transferChainId);
      if (!chain) throw new Error("Invalid chain");
      const { parseEther } = await import("viem");
      const client = makeWalletClient(chain);
      const hash = await client.sendTransaction({
        to: transferTo as `0x${string}`,
        value: parseEther(transferAmount),
        chain,
      });
      setTransferResult({ hash });
      pushActivity(`Sent ${transferAmount} ETH to ${transferTo.slice(0, 8)}...`, "TX", "bg-omn-accent");
      setTransferAmount("");
      // Refresh balances
      if (walletAddress) {
        getNativeBalances(walletAddress).then(setBalances);
      }
    } catch (e: any) {
      setTransferResult({ error: e?.message ?? "Transfer failed" });
    } finally {
      setTransferSending(false);
    }
  }

  function handleDeleteWallet() {
    deleteWallet();
    setWalletReady(false);
    setWalletAddress(null);
    setSdkReady(false);
    setBalances({});
  }

  // ─── Get quote ───
  const handleGetQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || !walletAddress) return;
    setSwapStep("quoting");
    setSwapError("");
    try {
      const result = await getQuote({
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: (Number(fromAmount) * 10 ** fromToken.decimals).toFixed(0),
        fromAddress: walletAddress,
        slippage: 0.03,
      });
      setQuote(convertQuoteToRoute(result));
      setSwapStep("configure");
    } catch (e: any) {
      setSwapError(e?.message ?? "Failed to get quote");
      setSwapStep("error");
    }
  }, [fromToken, toToken, fromAmount, fromChainId, toChainId, walletAddress]);

  // ─── Execute swap ───
  async function handleExecuteSwap() {
    if (!quote || !sdkReady) return;
    setSwapStep("executing");
    setSwapError("");
    try {
      await executeRoute(quote, {
        updateRouteHook(updatedRoute) {
          setQuote(updatedRoute);
          const step = updatedRoute.steps[0];
          if (step?.execution?.process) {
            const proc = step.execution.process[step.execution.process.length - 1];
            if (proc?.txHash) setTxHash(proc.txHash);
          }
        },
      });
      setSwapStep("done");
      pushActivity(`Swapped ${fromAmount} ${fromToken?.symbol ?? ""} → ${toToken?.symbol ?? ""}`, "SW", "bg-amber-600");
      refreshBalances();
    } catch (e: any) {
      setSwapError(e?.message ?? "Swap failed");
      setSwapStep("error");
    }
  }

  // ─── Helpers ───
  // Gas check — user must have native tokens on source chain
  const sourceGas = balances[fromChainId];
  const hasGas = sourceGas && sourceGas.balance > 0n;
  const gasSymbol = SUPPORTED_CHAINS.find((c) => c.id === fromChainId)?.nativeCurrency.symbol ?? "ETH";

  const toTokens = (tokens[toChainId] ?? []).slice(0, 50);
  const estimatedOutput =
    quote?.toAmountMin
      ? (Number(quote.toAmountMin) / 10 ** (toToken?.decimals ?? 18)).toFixed(6)
      : null;
  const estimatedGas = quote?.gasCostUSD ? `$${Number(quote.gasCostUSD).toFixed(2)}` : null;
  const hasAnyBalance = Object.values(balances).some((b) => b.balance > 0n);

  return (
    <div>
      <h1 className="text-3xl font-bold text-omn-heading mb-2">Trading</h1>
      <p className="text-omn-text mb-6">
        Your built-in Web3 wallet — trade real tokens across 7 chains
      </p>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("crypto")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "crypto"
              ? "bg-omn-primary text-white"
              : "bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading"
          }`}
        >
          Crypto (Live)
        </button>
        <button
          onClick={() => setTab("stocks")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "stocks"
              ? "bg-omn-primary text-white"
              : "bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading"
          }`}
        >
          Stocks
        </button>
      </div>

      {/* ═══ CRYPTO TAB ═══ */}
      {tab === "crypto" && (
        <div>
          {/* ── No wallet yet ── */}
          {!walletReady && !creatingWallet && (
            <div className="max-w-lg mx-auto">
              <div className="bg-omn-surface border border-omn-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-omn-primary to-omn-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white font-bold">W</span>
                </div>
                <h2 className="text-xl font-bold text-omn-heading mb-2">Create Your OmnID Wallet</h2>
                <p className="text-sm text-omn-text mb-6">
                  Your keys, your crypto. No MetaMask needed — OmnID generates a real blockchain wallet stored on your device.
                </p>
                <button
                  onClick={handleCreateWallet}
                  className="w-full px-6 py-3 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg font-medium transition-colors mb-3"
                >
                  Create New Wallet
                </button>
                <button
                  onClick={() => setImportMode(!importMode)}
                  className="w-full px-6 py-3 bg-omn-surface border border-omn-border text-omn-text hover:text-omn-heading rounded-lg text-sm transition-colors"
                >
                  {importMode ? "Cancel Import" : "Import Existing Wallet"}
                </button>

                {importMode && (
                  <div className="mt-4 text-left">
                    <label className="text-xs text-omn-text block mb-2">
                      Enter your 12-word seed phrase
                    </label>
                    <textarea
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      rows={3}
                      placeholder="word1 word2 word3 ..."
                      className="w-full px-4 py-3 bg-omn-bg border border-omn-border rounded-lg text-sm text-omn-heading font-mono focus:outline-none focus:border-omn-primary resize-none"
                    />
                    {importError && (
                      <p className="text-xs text-omn-danger mt-1">{importError}</p>
                    )}
                    <button
                      onClick={handleImportWallet}
                      disabled={!importInput.trim()}
                      className="mt-2 w-full px-4 py-2 bg-omn-accent hover:bg-omn-accent/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Import Wallet
                    </button>
                  </div>
                )}

                <div className="mt-6 bg-omn-bg rounded-lg p-3 text-left">
                  <p className="text-xs text-omn-text">
                    <strong className="text-omn-heading">How it works:</strong> OmnID generates a 12-word seed phrase that derives your private key using BIP-39 standard. Your wallet works on all 7 chains with one address. The seed phrase never leaves your device.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Seed phrase backup ── */}
          {creatingWallet && newMnemonic && (
            <div className="max-w-lg mx-auto">
              <div className="bg-omn-surface border border-omn-border rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-omn-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl text-omn-accent">!</span>
                  </div>
                  <h2 className="text-xl font-bold text-omn-heading mb-1">Back Up Your Seed Phrase</h2>
                  <p className="text-sm text-omn-text">
                    Write these 12 words down in order. This is the <strong className="text-omn-heading">only way</strong> to recover your wallet.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {newMnemonic.split(" ").map((word, i) => (
                    <div
                      key={i}
                      className="bg-omn-bg border border-omn-border rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <span className="text-xs text-omn-text w-5 text-right">{i + 1}.</span>
                      <span className="text-sm font-mono text-omn-heading">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-omn-danger/10 border border-omn-danger/20 rounded-lg p-3 mb-6">
                  <p className="text-xs text-omn-danger">
                    Never share your seed phrase. Anyone with these words can access your wallet and take your funds.
                  </p>
                </div>

                <button
                  onClick={handleConfirmSeed}
                  className="w-full px-6 py-3 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg font-medium transition-colors"
                >
                  I've Written It Down
                </button>
              </div>
            </div>
          )}

          {/* ── Wallet active ── */}
          {walletReady && walletAddress && (
            <>
              {/* Wallet card */}
              <div className="bg-gradient-to-br from-omn-primary/10 to-omn-accent/10 border border-omn-border rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-omn-heading">
                        Omn<span className="text-omn-accent">ID</span> Wallet
                      </span>
                      <span className="w-2 h-2 bg-omn-success rounded-full animate-pulse" />
                      <span className="text-xs text-omn-success font-medium">Live</span>
                    </div>
                    <p className="text-sm font-mono text-omn-text">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(walletAddress)}
                      className="text-xs text-omn-primary hover:text-omn-primary-light mt-0.5"
                    >
                      Copy full address
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      className="px-3 py-1.5 text-xs bg-omn-surface border border-omn-border rounded-lg text-omn-text hover:text-omn-heading transition-colors"
                    >
                      {showSeedPhrase ? "Hide" : "Show"} Seed Phrase
                    </button>
                    <button
                      onClick={refreshBalances}
                      disabled={loadingBalances}
                      className="px-3 py-1.5 text-xs bg-omn-surface border border-omn-border rounded-lg text-omn-text hover:text-omn-heading transition-colors disabled:opacity-50"
                    >
                      {loadingBalances ? "..." : "Refresh"}
                    </button>
                  </div>
                </div>

                {/* Seed phrase reveal */}
                {showSeedPhrase && (
                  <div className="bg-omn-bg border border-omn-border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {(getMnemonic() ?? "").split(" ").map((word, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-[10px] text-omn-text w-4 text-right">{i + 1}.</span>
                          <span className="text-xs font-mono text-omn-heading">{word}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-omn-danger">Keep this secret. Anyone with these words controls your wallet.</p>
                  </div>
                )}

                {/* Chain balances */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SUPPORTED_CHAINS.map((chain) => {
                    const meta = CHAIN_META[chain.id];
                    const bal = balances[chain.id];
                    const numBal = bal ? Number(bal.formatted) : 0;
                    const display = bal
                      ? numBal < 0.0001 && numBal > 0
                        ? "<0.0001"
                        : numBal.toFixed(4)
                      : "0.0000";
                    const nativeSym = CHAIN_NATIVE_SYMBOL[chain.id];
                    const price = nativeSym ? cryptoPrices[nativeSym] : undefined;
                    const usdValue = price && numBal > 0 ? numBal * price.usd : 0;
                    const chainTokens = tokenBalances.filter((t) => t.chainId === chain.id);
                    return (
                      <div key={chain.id} className="bg-omn-surface/50 border border-omn-border/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-omn-border/30">
                          <div className={`w-6 h-6 ${meta?.color ?? "bg-gray-600"} rounded-md flex items-center justify-center text-white text-[9px] font-bold`}>
                            {meta?.icon?.slice(0, 2)}
                          </div>
                          <span className="text-xs font-medium text-omn-heading truncate">{meta?.name}</span>
                        </div>
                        {/* Native token */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-omn-text">{bal?.symbol ?? chain.nativeCurrency.symbol}</span>
                          <div className="text-right">
                            <span className="text-xs font-mono text-omn-heading">
                              {loadingBalances ? "..." : display}
                            </span>
                            {price && numBal > 0 && (
                              <span className="text-[10px] font-mono text-omn-success ml-1.5">${usdValue.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        {/* ERC-20 tokens */}
                        {chainTokens.map((t) => {
                          const tNum = Number(t.formatted);
                          const tDisplay = tNum < 0.0001 ? "<0.0001" : tNum.toFixed(4);
                          return (
                            <div key={t.symbol} className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-omn-text">{t.symbol}</span>
                              <span className="text-xs font-mono text-omn-heading">{tDisplay}</span>
                            </div>
                          );
                        })}
                        {chainTokens.length === 0 && numBal === 0 && !loadingBalances && (
                          <p className="text-[10px] text-omn-text/50 italic">No tokens</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!hasAnyBalance && !loadingBalances && (
                  <p className="text-xs text-omn-text mt-3">
                    Send tokens to your address above to start trading. You need gas (native tokens) on the source chain to execute swaps.
                  </p>
                )}
              </div>

              {/* Live badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs px-2 py-0.5 bg-omn-primary/20 text-omn-primary rounded-full">Powered by LI.FI</span>
                <span className="text-xs text-omn-text">
                  {lifiChains.length} chains · {Object.values(tokens).reduce((s, t) => s + t.length, 0)} tokens
                </span>
              </div>

              {loadingTokens ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-omn-text">Loading tokens from LI.FI...</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Swap Card */}
                  <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-omn-heading mb-4">Cross-Chain Swap</h2>

                    {/* From */}
                    <div className="bg-omn-bg rounded-lg p-4 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-omn-text">From</span>
                        <select
                          value={fromChainId}
                          onChange={(e) => {
                            const id = Number(e.target.value);
                            setFromChainId(id);
                            setFromToken((tokens[id] ?? [])[0] ?? null);
                          }}
                          className="text-xs bg-omn-surface border border-omn-border rounded px-2 py-1 text-omn-heading focus:outline-none focus:border-omn-primary"
                        >
                          {SUPPORTED_CHAIN_IDS.map((id) => (
                            <option key={id} value={id}>{CHAIN_META[id]?.name ?? `Chain ${id}`}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={fromToken?.address ?? ""}
                          onChange={(e) => {
                            const t = (tokens[fromChainId] ?? []).find((t) => t.address === e.target.value);
                            if (t) setFromToken(t);
                          }}
                          className="flex-1 bg-omn-surface border border-omn-border rounded-lg px-3 py-2 text-sm text-omn-heading focus:outline-none focus:border-omn-primary"
                        >
                          {(tokens[fromChainId] ?? []).slice(0, 50).map((t) => (
                            <option key={t.address} value={t.address}>
                              {t.symbol} — {t.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.0"
                          className="w-32 px-3 py-2 bg-omn-surface border border-omn-border rounded-lg text-sm font-mono text-omn-heading focus:outline-none focus:border-omn-primary"
                        />
                      </div>
                    </div>

                    {/* Swap direction arrow */}
                    <div className="flex justify-center -my-1 relative z-10">
                      <button
                        onClick={() => {
                          const tmpChain = fromChainId;
                          const tmpToken = fromToken;
                          setFromChainId(toChainId);
                          setToChainId(tmpChain);
                          setFromToken(toToken);
                          setToToken(tmpToken);
                        }}
                        className="w-8 h-8 bg-omn-surface border border-omn-border rounded-full flex items-center justify-center text-omn-primary hover:bg-omn-primary/10 transition-colors"
                      >
                        {"\u2195"}
                      </button>
                    </div>

                    {/* To */}
                    <div className="bg-omn-bg rounded-lg p-4 mt-2 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-omn-text">To</span>
                        <select
                          value={toChainId}
                          onChange={(e) => {
                            const id = Number(e.target.value);
                            setToChainId(id);
                            setToToken((tokens[id] ?? [])[0] ?? null);
                          }}
                          className="text-xs bg-omn-surface border border-omn-border rounded px-2 py-1 text-omn-heading focus:outline-none focus:border-omn-primary"
                        >
                          {SUPPORTED_CHAIN_IDS.map((id) => (
                            <option key={id} value={id}>{CHAIN_META[id]?.name ?? `Chain ${id}`}</option>
                          ))}
                        </select>
                      </div>
                      <select
                        value={toToken?.address ?? ""}
                        onChange={(e) => {
                          const t = (tokens[toChainId] ?? []).find((t) => t.address === e.target.value);
                          if (t) setToToken(t);
                        }}
                        className="w-full bg-omn-surface border border-omn-border rounded-lg px-3 py-2 text-sm text-omn-heading focus:outline-none focus:border-omn-primary"
                      >
                        {toTokens.map((t) => (
                          <option key={t.address} value={t.address}>
                            {t.symbol} — {t.name}
                          </option>
                        ))}
                      </select>
                      {estimatedOutput && swapStep === "configure" && (
                        <p className="mt-2 text-sm font-mono text-omn-success">
                          ~ {estimatedOutput} {toToken?.symbol}
                        </p>
                      )}
                    </div>

                    {/* Quote details */}
                    {swapStep === "configure" && quote && (
                      <div className="bg-omn-bg rounded-lg p-3 mb-4 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-omn-text">Route</span>
                          <span className="text-omn-heading">{quote.steps.map((s) => s.tool).join(" → ")}</span>
                        </div>
                        {estimatedGas && (
                          <div className="flex justify-between">
                            <span className="text-omn-text">Gas cost</span>
                            <span className="text-omn-accent font-mono">{estimatedGas}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-omn-text">Slippage</span>
                          <span className="text-omn-heading">3%</span>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {swapStep === "error" && swapError && (
                      <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-lg p-3 mb-4">
                        <p className="text-xs text-omn-danger">{swapError}</p>
                      </div>
                    )}

                    {/* Gas warning + funding option */}
                    {!hasGas && !loadingBalances && (
                      <div className="bg-omn-accent/10 border border-omn-accent/30 rounded-lg p-3 mb-4">
                        <p className="text-xs text-omn-accent font-medium">No {gasSymbol} on {CHAIN_META[fromChainId]?.name}</p>
                        {fundingSources.length > 0 ? (
                          <>
                            <p className="text-[10px] text-omn-text mt-1 mb-2">Fund gas + purchase from a payment method:</p>
                            <div className="space-y-1">
                              {fundingSources.map((fs) => (
                                <button key={fs.id} onClick={() => setSelectedFundingId(fs.id)}
                                  className={`w-full flex items-center gap-2 p-1.5 rounded-lg border transition-colors text-left ${selectedFundingId === fs.id ? "border-omn-primary bg-omn-primary/5" : "border-omn-border/50 hover:border-omn-primary/50"}`}>
                                  <div className={`w-5 h-5 ${fs.color} rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0`}>{fs.icon}</div>
                                  <span className="text-[10px] text-omn-heading flex-1">{fundingLabel(fs)}</span>
                                  {selectedFundingId === fs.id && <span className="text-omn-primary text-[10px]">{"\u2713"}</span>}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-[10px] text-omn-text mt-0.5">
                            Send {gasSymbol} to your wallet, or connect a payment method on the Payments page to fund purchases.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {(swapStep === "idle" || swapStep === "error") && (
                        <button
                          onClick={handleGetQuote}
                          disabled={!fromToken || !toToken || !fromAmount || Number(fromAmount) <= 0 || !hasGas}
                          className="flex-1 px-6 py-3 bg-omn-primary hover:bg-omn-primary-light text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {hasGas ? "Get Quote" : `Need ${gasSymbol} for gas`}
                        </button>
                      )}
                      {swapStep === "quoting" && (
                        <div className="flex-1 px-6 py-3 bg-omn-primary/50 text-white rounded-lg text-center">
                          <span className="animate-pulse">Fetching best route...</span>
                        </div>
                      )}
                      {swapStep === "configure" && (
                        <>
                          <button
                            onClick={() => { setSwapStep("idle"); setQuote(null); }}
                            className="px-4 py-3 bg-omn-surface border border-omn-border rounded-lg text-sm text-omn-text hover:text-omn-heading transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleExecuteSwap}
                            className="flex-1 px-6 py-3 bg-omn-success hover:bg-omn-success/80 text-white rounded-lg transition-colors font-medium"
                          >
                            Swap {fromAmount} {fromToken?.symbol} → {toToken?.symbol}
                          </button>
                        </>
                      )}
                      {swapStep === "executing" && (
                        <div className="flex-1 text-center py-3">
                          <div className="animate-spin w-6 h-6 border-2 border-omn-primary border-t-transparent rounded-full mx-auto mb-2" />
                          <p className="text-sm text-omn-heading">Executing on-chain...</p>
                          {txHash && (
                            <p className="text-xs text-omn-accent font-mono mt-1 truncate">tx: {txHash}</p>
                          )}
                        </div>
                      )}
                      {swapStep === "done" && (
                        <div className="flex-1 text-center py-3">
                          <div className="w-10 h-10 bg-omn-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xl text-omn-success">{"\u2713"}</span>
                          </div>
                          <p className="text-sm text-omn-heading font-medium">Swap Complete</p>
                          {txHash && (
                            <p className="text-xs text-omn-accent font-mono mt-1 truncate">tx: {txHash}</p>
                          )}
                          <button
                            onClick={() => { setSwapStep("idle"); setQuote(null); setFromAmount(""); setTxHash(""); }}
                            className="mt-3 px-4 py-1.5 bg-omn-primary text-white rounded-lg text-xs"
                          >
                            New Swap
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    {/* Supported Chains */}
                    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-omn-heading mb-3">Supported Chains</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {SUPPORTED_CHAIN_IDS.map((id) => {
                          const meta = CHAIN_META[id];
                          const chain = lifiChains.find((c) => c.id === id);
                          const tokenCount = (tokens[id] ?? []).length;
                          return (
                            <div key={id} className="flex items-center gap-2 p-2 bg-omn-bg rounded-lg">
                              <div className={`w-7 h-7 ${meta?.color ?? "bg-gray-600"} rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                {meta?.icon?.slice(0, 2) ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-omn-heading font-medium truncate">{chain?.name ?? meta?.name}</p>
                                <p className="text-[10px] text-omn-text">{tokenCount} tokens</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Send / Transfer */}
                    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-omn-heading mb-1">Send Crypto</h2>
                      <p className="text-xs text-omn-text mb-4">Transfer native tokens to any address</p>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-omn-text mb-1 block">Chain</label>
                          <select
                            value={transferChainId}
                            onChange={(e) => setTransferChainId(Number(e.target.value))}
                            className="w-full text-sm bg-omn-bg border border-omn-border rounded-lg px-3 py-2 text-omn-heading focus:outline-none focus:border-omn-primary"
                          >
                            {SUPPORTED_CHAINS.map((c) => {
                              const meta = CHAIN_META[c.id];
                              const bal = balances[c.id];
                              return (
                                <option key={c.id} value={c.id}>
                                  {meta?.name ?? c.name} {bal ? `(${Number(bal.formatted).toFixed(4)} ${bal.symbol})` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-omn-text mb-1 block">Recipient Address</label>
                          <input
                            type="text"
                            value={transferTo}
                            onChange={(e) => setTransferTo(e.target.value.trim())}
                            placeholder="0x..."
                            className="w-full text-sm bg-omn-bg border border-omn-border rounded-lg px-3 py-2 text-omn-heading font-mono focus:outline-none focus:border-omn-primary"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-omn-text mb-1 block">Amount ({SUPPORTED_CHAINS.find((c) => c.id === transferChainId)?.nativeCurrency.symbol ?? "ETH"})</label>
                          <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.01"
                            step="0.001"
                            min="0"
                            className="w-full text-sm bg-omn-bg border border-omn-border rounded-lg px-3 py-2 text-omn-heading font-mono focus:outline-none focus:border-omn-primary"
                          />
                        </div>

                        <button
                          onClick={handleTransfer}
                          disabled={transferSending || !transferTo.match(/^0x[0-9a-fA-F]{40}$/) || !transferAmount || Number(transferAmount) <= 0}
                          className="w-full py-2.5 bg-gradient-to-r from-omn-primary to-omn-accent text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-omn-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {transferSending ? "Sending..." : "Send"}
                        </button>

                        {transferResult?.hash && (
                          <div className="bg-omn-success/10 border border-omn-success/30 rounded-lg p-3">
                            <p className="text-xs text-omn-success font-medium mb-1">Transaction sent!</p>
                            <a
                              href={`https://${transferChainId === 84532 ? "sepolia.basescan.org" : transferChainId === 1 ? "etherscan.io" : transferChainId === 137 ? "polygonscan.com" : transferChainId === 42161 ? "arbiscan.io" : "basescan.org"}/tx/${transferResult.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-omn-accent hover:text-omn-primary break-all"
                            >
                              {transferResult.hash} {"\u2197"}
                            </a>
                          </div>
                        )}

                        {transferResult?.error && (
                          <div className="bg-omn-danger/10 border border-omn-danger/30 rounded-lg p-3">
                            <p className="text-xs text-omn-danger">{transferResult.error}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-omn-surface border border-omn-border rounded-xl p-6">
                      <h2 className="text-sm font-semibold text-omn-heading mb-2">How It Works</h2>
                      <div className="space-y-2 text-xs text-omn-text">
                        <p><strong className="text-omn-heading">1.</strong> OmnID generates a BIP-39 seed phrase on your device</p>
                        <p><strong className="text-omn-heading">2.</strong> Your private key derives one address that works on all chains</p>
                        <p><strong className="text-omn-heading">3.</strong> LI.FI finds the best route across 20+ DEXs and 15+ bridges</p>
                        <p><strong className="text-omn-heading">4.</strong> OmnID signs the transaction locally — your key never leaves your device</p>
                      </div>
                      <div className="mt-3 bg-omn-bg rounded-lg p-2">
                        <p className="text-[10px] text-omn-text">
                          Gas fees pay blockchain validators to process your transaction. Each chain uses its native token for gas (ETH on Ethereum/Arbitrum/Optimism/Base, POL on Polygon, AVAX on Avalanche, BNB on BNB Chain).
                        </p>
                      </div>
                    </div>

                    {/* Danger zone */}
                    <div className="bg-omn-surface border border-omn-border rounded-xl p-4">
                      <button
                        onClick={handleDeleteWallet}
                        className="text-xs text-omn-danger hover:text-omn-danger/80 transition-colors"
                      >
                        Delete Wallet
                      </button>
                      <p className="text-[10px] text-omn-text mt-1">
                        Removes your wallet from this device. You can recover it with your seed phrase.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ═══ TOKEN BROWSER ═══ */}
                <div className="bg-omn-surface border border-omn-border rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-omn-heading">Browse Tokens</h2>
                      <p className="text-xs text-omn-text">All tokens across all chains — tap any to buy</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={String(browseChainId)}
                        onChange={(e) => setBrowseChainId(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="text-xs bg-omn-bg border border-omn-border rounded-lg px-3 py-1.5 text-omn-heading focus:outline-none focus:border-omn-primary"
                      >
                        <option value="all">All Chains</option>
                        {SUPPORTED_CHAIN_IDS.map((id) => (
                          <option key={id} value={id}>{CHAIN_META[id]?.name ?? `Chain ${id}`} ({(tokens[id] ?? []).length})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={browseSearch}
                        onChange={(e) => setBrowseSearch(e.target.value)}
                        placeholder="Search tokens..."
                        className="text-xs bg-omn-bg border border-omn-border rounded-lg px-3 py-1.5 text-omn-heading focus:outline-none focus:border-omn-primary w-48"
                      />
                    </div>
                  </div>

                  {(() => {
                    const chainIds = browseChainId === "all" ? SUPPORTED_CHAIN_IDS : [browseChainId];
                    const q = browseSearch.toLowerCase();
                    const filtered = chainIds.flatMap((cid) =>
                      (tokens[cid] ?? [])
                        .filter((t) => !q || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
                        .map((t) => ({ ...t, chainId: cid }))
                    ).slice(0, 100);

                    if (filtered.length === 0) {
                      return <p className="text-xs text-omn-text text-center py-6">No tokens found.</p>;
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-omn-border text-omn-text text-left">
                              <th className="pb-2 font-medium">Token</th>
                              <th className="pb-2 font-medium">Chain</th>
                              <th className="pb-2 font-medium">Address</th>
                              <th className="pb-2 font-medium text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-omn-border/50">
                            {filtered.map((t, i) => {
                              const meta = CHAIN_META[t.chainId];
                              return (
                                <tr key={`${t.chainId}-${t.address}-${i}`} className="hover:bg-omn-bg/50">
                                  <td className="py-2">
                                    <div className="flex items-center gap-2">
                                      {t.logoURI ? (
                                        <img src={t.logoURI} alt="" className="w-5 h-5 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                      ) : (
                                        <div className="w-5 h-5 bg-omn-primary/20 rounded-full flex items-center justify-center text-[8px] text-omn-primary font-bold">{t.symbol.slice(0, 2)}</div>
                                      )}
                                      <div>
                                        <span className="text-omn-heading font-medium">{t.symbol}</span>
                                        <span className="text-omn-text ml-1 hidden sm:inline">{t.name}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2">
                                    <div className="flex items-center gap-1">
                                      <div className={`w-4 h-4 ${meta?.color ?? "bg-gray-600"} rounded flex items-center justify-center text-white text-[7px] font-bold`}>
                                        {meta?.icon?.slice(0, 2)}
                                      </div>
                                      <span className="text-omn-text">{meta?.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-2 font-mono text-omn-text">
                                    {t.address.slice(0, 6)}...{t.address.slice(-4)}
                                  </td>
                                  <td className="py-2 text-right">
                                    <button
                                      onClick={() => {
                                        setFromChainId(t.chainId);
                                        setFromToken((tokens[t.chainId] ?? []).find((tk) => tk.address === t.address) ?? t);
                                        setSwapStep("idle");
                                        setQuote(null);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className="px-2 py-1 bg-omn-primary/20 text-omn-primary rounded text-[10px] font-medium hover:bg-omn-primary/30 transition-colors"
                                    >
                                      Buy
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {filtered.length >= 100 && (
                          <p className="text-[10px] text-omn-text text-center mt-3">Showing first 100 results — narrow your search to see more</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══ STOCKS TAB ═══ */}
      {tab === "stocks" && <StocksTrading />}
    </div>
  );
}
