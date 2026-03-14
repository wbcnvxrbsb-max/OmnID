import type { Lesson } from "./lessons";

export const lessonsPartTwo: Lesson[] = [
  // ─────────────────────────────────────────────
  // MODULE 3: Smart Contracts continued (16-18)
  // ─────────────────────────────────────────────
  {
    id: 16,
    title: "Events & Logging",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "How contracts talk to the outside world",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Loudspeaker Analogy",
        content:
          "Imagine you are at a huge outdoor concert. The band is playing on stage, but the audience is spread across a massive field. Without loudspeakers, only the people right at the front could hear the music. The loudspeakers take what is happening on stage and <strong>broadcast</strong> it so everyone far away can hear it too. Smart contracts on the blockchain have the same problem. Code runs inside the Ethereum Virtual Machine (the \"stage\"), but apps, websites, and wallets sitting outside the blockchain (the \"audience\") need to know what happened. That is where <em>events</em> come in. An event is like a loudspeaker announcement: the contract shouts out a message — \"Hey, a transfer just happened!\" — and anyone listening can pick it up. Events are one of the most important tools for connecting what happens <em>inside</em> a contract to the world <em>outside</em> it.",
      },
      {
        heading: "How Events Work in Solidity",
        content:
          "In Solidity, you define an event with the <strong>event</strong> keyword, and you fire it with the <strong>emit</strong> keyword. Here is a quick example:<br><br><code>event Transfer(address indexed from, address indexed to, uint256 amount);</code><br><br>When something important happens — like tokens moving from one wallet to another — the contract calls <code>emit Transfer(msg.sender, recipient, 100);</code>. That line does not change any data stored on the blockchain. Instead, it writes a <em>log entry</em> that gets tucked into the transaction receipt. Think of a receipt at a grocery store: it does not change the groceries you bought, but it records what happened so you can look it up later. The word <strong>indexed</strong> next to a parameter means you can search for that specific value quickly, like adding a sticky tab to a notebook page so you can flip right to it. You can have up to three indexed parameters per event. Front-end apps use these logs to update your screen in real time — that is how your wallet instantly shows \"You received 5 USDC!\" seconds after the transaction confirms.",
      },
      {
        heading: "Why Not Just Store Everything On-Chain?",
        content:
          "You might wonder: why not just save all this information in a regular variable inside the contract? The answer is <strong>gas cost</strong>. Storing data permanently on the blockchain is expensive — it costs real money in transaction fees. Event logs are much cheaper because they are stored in a special part of the blockchain that contracts themselves cannot read back. It is a write-only bulletin board. The data is still there forever (the blockchain never forgets), but only off-chain programs like websites, analytics dashboards, or indexing services can read it. A popular tool called <strong>The Graph</strong> acts like a search engine for event logs. It listens for events, organizes them into a database, and lets apps query them quickly. Without events and tools like The Graph, building a responsive blockchain app would be painfully slow and expensive — imagine having to scan every single block since the beginning of Ethereum just to find out if someone sent you tokens!",
      },
      {
        heading: "Real-World Examples of Events",
        content:
          "Events are everywhere in the blockchain world, even if you do not see them directly. When you swap tokens on Uniswap, a <code>Swap</code> event fires with details about what was traded. When someone mints an NFT, a <code>Transfer</code> event fires showing the new owner. When a vote is cast in a DAO (Decentralized Autonomous Organization), a <code>VoteCast</code> event is emitted. Block explorers like <strong>Etherscan</strong> use these events to show you a readable history of what a contract has done. If you visit any token contract on Etherscan and click the \"Events\" tab, you will see a long list of every event ever emitted — it is like reading the contract's diary. For our OmnID project, events will be critical. When a verifiable credential is issued, an event announces it. When an age verification passes, another event fires. This lets the front-end app update instantly without having to keep asking the contract \"Did anything change?\" over and over again.",
      },
    ],
    quiz: [
      {
        question:
          "Why are events cheaper than storing data in a contract variable?",
        options: [
          "Events use a different blockchain",
          "Event logs are stored in a write-only area that contracts cannot read back",
          "Events are deleted after 24 hours",
          "Events do not actually save any data",
        ],
        correctIndex: 1,
        explanation:
          "Event logs are stored in a special write-only section of the blockchain. They cost less gas because contracts cannot read them back — only off-chain programs can. The data is still permanent though.",
      },
      {
        question: "What does the 'indexed' keyword do in an event parameter?",
        options: [
          "Makes the parameter invisible to outsiders",
          "Lets you search and filter by that parameter quickly",
          "Stores the parameter in a separate blockchain",
          "Doubles the gas cost of the event",
        ],
        correctIndex: 1,
        explanation:
          "The 'indexed' keyword lets off-chain apps efficiently search and filter event logs by that specific parameter, like a sticky tab in a notebook.",
      },
      {
        question: "What keyword is used to fire an event in Solidity?",
        options: ["fire", "log", "emit", "send"],
        correctIndex: 2,
        explanation:
          "In Solidity, you use the 'emit' keyword followed by the event name and its arguments to fire an event and create a log entry.",
      },
    ],
  },

  {
    id: 17,
    title: "Security Basics",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "The million-dollar mistakes and how to avoid them",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Why Security Is a Huge Deal",
        content:
          "Imagine you build a tree house and invite your friends to store their favorite trading cards inside. One day someone discovers a loose board, climbs in through the gap, and takes all the cards. That is bad enough — but now imagine the tree house is bolted together with special screws that <em>can never be removed</em>. You cannot just patch the hole; you would have to build an entirely new tree house and convince everyone to move their cards. That is what smart contract security feels like. Once a contract is deployed on the blockchain, its code is <strong>immutable</strong> — it cannot be changed. If there is a bug, attackers can exploit it, and the money inside can be drained in minutes. In 2016, a bug in a contract called \"The DAO\" led to <strong>$60 million</strong> being stolen. In 2022, a bridge protocol called Wormhole lost <strong>$320 million</strong> because of a single missed security check. These are not made-up numbers — real people lost real money. That is why smart contract developers treat security the way a pilot treats a pre-flight checklist: you check everything, twice, before taking off.",
      },
      {
        heading: "Reentrancy: The Sneaky Callback Trick",
        content:
          "The most famous smart contract bug is called a <strong>reentrancy attack</strong>. Here is how it works in plain English. Suppose you have a contract that holds money for people, and someone asks to withdraw their balance. The contract sends them the money <em>first</em> and then updates its records to show the balance is now zero. Sounds reasonable, right? But what if the person receiving the money is actually <em>another smart contract</em> with a sneaky trick: every time it receives money, it immediately calls the withdraw function <em>again</em> before the first withdrawal finishes updating the balance. The original contract still thinks the attacker has money because the balance has not been set to zero yet — so it sends money again, and again, and again, draining the vault. This is exactly what happened with The DAO hack. The fix is simple in principle: <strong>update your records before sending money</strong>. This pattern is called \"Checks-Effects-Interactions.\" First <em>check</em> that the request is valid, then <em>update</em> your state (effects), and only <em>then</em> interact with external contracts. Solidity also offers a <code>ReentrancyGuard</code> from the OpenZeppelin library that locks the function so it cannot be called again until the first call finishes.",
      },
      {
        heading: "Overflow, Access Control, and Other Pitfalls",
        content:
          "Reentrancy is not the only danger. Here are a few more common mistakes:<br><br><strong>Integer Overflow/Underflow:</strong> Imagine a score counter that goes from 0 to 255. If you add 1 to 255, it wraps around to 0. Old versions of Solidity had this problem with token balances — attackers could create tokens out of thin air. Modern Solidity (0.8+) automatically checks for this, but older contracts are still vulnerable.<br><br><strong>Missing Access Control:</strong> Some functions should only be callable by the contract owner — like a function that withdraws all funds. If the developer forgets to add a check like <code>require(msg.sender == owner)</code>, <em>anyone</em> can call that function. It is like leaving the key to the safe taped to the front door.<br><br><strong>Front-Running:</strong> On a public blockchain, pending transactions sit in a waiting area called the mempool. Attackers can see your transaction before it is confirmed and submit their own transaction with a higher gas fee to jump ahead of you in line. This is like someone cutting in line at the cafeteria because they offered the lunch lady a bigger tip. Developers use commit-reveal schemes and other techniques to combat this.",
      },
      {
        heading: "How Developers Protect Their Contracts",
        content:
          "Professional smart contract developers use several layers of defense. First, they follow <strong>battle-tested patterns</strong> — the Checks-Effects-Interactions pattern we just discussed, access control modifiers, and pull-over-push payment strategies (letting users withdraw money rather than sending it to them). Second, they use <strong>audited libraries</strong> like OpenZeppelin, which provide pre-built, heavily reviewed code for common tasks like token standards and access control. Third, they get <strong>security audits</strong> from specialized firms. An audit is like having a professional mechanic inspect your car before a road trip — they look for problems you might have missed. Top audit firms include Trail of Bits, OpenZeppelin, and Certora. Fourth, many projects run <strong>bug bounty programs</strong> where they pay hackers to find and report vulnerabilities instead of exploiting them. Some bounties are worth hundreds of thousands of dollars. Finally, there are <strong>formal verification</strong> tools that use math to <em>prove</em> a contract behaves correctly in all possible scenarios. It is expensive and time-consuming, but for contracts holding billions of dollars, it is worth every penny. Security is not a single step — it is a mindset that runs through every line of code you write.",
      },
    ],
    quiz: [
      {
        question: "What is a reentrancy attack?",
        options: [
          "An attack where someone guesses your private key",
          "An attack where a contract calls back into the vulnerable function before it finishes",
          "An attack that shuts down the entire blockchain",
          "An attack that changes the contract's source code",
        ],
        correctIndex: 1,
        explanation:
          "A reentrancy attack happens when an external contract calls back into the vulnerable function before the first execution completes, allowing repeated withdrawals before the balance is updated.",
      },
      {
        question:
          "What is the recommended pattern to prevent reentrancy attacks?",
        options: [
          "Send money first, then update records",
          "Checks-Effects-Interactions: validate, update state, then interact",
          "Never send money from a contract",
          "Use a different programming language",
        ],
        correctIndex: 1,
        explanation:
          "The Checks-Effects-Interactions pattern says: first check conditions, then update your contract's state, and only then interact with external contracts. This prevents reentrancy.",
      },
      {
        question: "Why is smart contract security especially important?",
        options: [
          "Because blockchain transactions are slow",
          "Because smart contracts can be easily updated to fix bugs",
          "Because deployed contracts are immutable — bugs cannot be patched",
          "Because Ethereum has no security features built in",
        ],
        correctIndex: 2,
        explanation:
          "Once deployed, smart contract code is immutable (cannot be changed). If a bug exists, it cannot simply be patched — which is why getting security right before deployment is critical.",
      },
    ],
  },

  {
    id: 18,
    title: "Deploying a Contract",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "From code to live on the blockchain",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Shipping Your Creation to the World",
        content:
          "Think about the process of publishing a book. First you write a draft, then you edit and proofread it, and finally you send it to the printer. Once it is printed and shipped to bookstores, you cannot go back and change the words on the page. Deploying a smart contract is very similar. You write your Solidity code, test it thoroughly, and then send a special transaction to the blockchain that creates a brand-new contract at its own address. From that moment on, the code lives on every node in the network and cannot be altered. Before deploying to the real Ethereum network (called <strong>mainnet</strong>), developers practice on <strong>testnets</strong> — these are practice blockchains that work exactly like the real thing but use fake money. Popular testnets include <strong>Sepolia</strong> and <strong>Holesky</strong>. Using a testnet is like rehearsing your school play on stage before the audience arrives — you get to make mistakes without consequences. You will need a wallet (like MetaMask), some test ETH from a <em>faucet</em> (a website that gives you free test tokens), and a deployment tool.",
      },
      {
        heading: "Development Tools: Hardhat and Foundry",
        content:
          "Two of the most popular tools for developing and deploying smart contracts are <strong>Hardhat</strong> and <strong>Foundry</strong>. Hardhat is a JavaScript-based toolkit that lets you compile your Solidity code, run tests, and deploy contracts all from the command line. It even comes with a built-in local blockchain (called Hardhat Network) so you can test without even connecting to a testnet — it is like having a miniature Ethereum running on your laptop. <strong>Foundry</strong> is a newer, Rust-based toolkit that is blazing fast. It uses Solidity itself for writing tests, which some developers prefer because they do not have to switch between programming languages. Both tools use <em>deployment scripts</em> — small programs that tell the tool which contracts to deploy, in what order, and with what initial settings. For example, a deployment script might say: \"First deploy the token contract, then deploy the exchange contract and tell it the token's address.\" These scripts are crucial because many real-world projects have multiple contracts that need to know about each other. Getting the deployment order wrong is like trying to put on your shoes before your socks.",
      },
      {
        heading: "The Deployment Transaction",
        content:
          "When you deploy a contract, you send a special transaction that has no <strong>to</strong> address. Instead, the transaction's data field contains the contract's compiled <em>bytecode</em> — the machine code that the Ethereum Virtual Machine (EVM) understands. The network sees a transaction with no recipient and knows it is a contract creation. It runs a piece of code called the <strong>constructor</strong>, which sets up the contract's initial state (like setting the owner or total token supply). Then it assigns the contract a brand-new address, calculated from the deployer's address and their transaction count (called a <em>nonce</em>). From that point forward, anyone in the world can interact with your contract by sending transactions to that address. The deployment transaction costs gas, and the amount depends on how large your contract is. A simple storage contract might cost around 200,000 gas, while a complex DeFi protocol contract could cost several million gas. At high gas prices, that can translate to hundreds of dollars on mainnet — another reason to test thoroughly on testnets first!",
      },
      {
        heading: "Verifying and Sharing Your Contract",
        content:
          "After deploying, the blockchain only stores the compiled bytecode — the raw machine instructions. Humans cannot read bytecode. That is why developers <strong>verify</strong> their contracts on block explorers like Etherscan. Verification means uploading your original Solidity source code and proving it compiles to the exact same bytecode that is on-chain. Once verified, anyone can read the source code, understand what the contract does, and trust (or audit) it. This is a key part of blockchain's transparency promise. Etherscan even generates a nice user interface for interacting with verified contracts — you can call functions, read data, and see events without writing a single line of code. Many deployment tools like Hardhat have plugins that verify your contract automatically right after deployment. For OmnID, all of our contracts will be verified so that anyone can inspect how identity and credentials are managed. Sharing the contract address and the verified source code is like handing someone the keys and the blueprint to a house — they can see exactly how it was built and trust that there are no hidden rooms.",
      },
    ],
    quiz: [
      {
        question: "What is a testnet?",
        options: [
          "A network for testing internet speed",
          "A practice blockchain that uses fake money for testing",
          "A private blockchain owned by one company",
          "A tool for writing Solidity code",
        ],
        correctIndex: 1,
        explanation:
          "Testnets are practice blockchains that work just like the real Ethereum network but use fake tokens, allowing developers to test their contracts without risking real money.",
      },
      {
        question:
          "What makes a deployment transaction different from a regular transaction?",
        options: [
          "It costs no gas",
          "It has no 'to' address and its data contains the contract bytecode",
          "It must be signed by multiple people",
          "It can only be sent on testnets",
        ],
        correctIndex: 1,
        explanation:
          "A deployment transaction has no 'to' address. The data field contains the compiled bytecode, and the network recognizes this as a contract creation request.",
      },
      {
        question: "Why do developers verify contracts on Etherscan?",
        options: [
          "To make the contract run faster",
          "To allow anyone to read the source code and trust what the contract does",
          "To get free ETH from Etherscan",
          "Because unverified contracts are automatically deleted",
        ],
        correctIndex: 1,
        explanation:
          "Verification uploads the original Solidity source code and proves it matches the on-chain bytecode. This lets anyone read, understand, and audit the contract — building trust through transparency.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 4: Tokens & DeFi (19-22)
  // ─────────────────────────────────────────────
  {
    id: 19,
    title: "What are Tokens?",
    module: "Tokens & DeFi",
    moduleNumber: 4,
    subtitle: "Arcade tokens with a universal standard",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Arcade Tokens and Digital Tokens",
        content:
          "Have you ever been to an arcade where you trade your dollars for tokens at the front desk? Those tokens only work inside that specific arcade — you can use them to play games, win prizes, and even trade them with friends. But you cannot use Chuck E. Cheese tokens at Dave & Buster's. Now imagine if every arcade in the world agreed on <em>one universal token standard</em>. Any token from any arcade would work everywhere: same size, same shape, same value system. That is basically what happened in the blockchain world. On Ethereum, developers created a shared set of rules called <strong>token standards</strong> that define how digital tokens should behave. Any app, wallet, or exchange that understands the standard can instantly work with any token that follows it. This is incredibly powerful. It means that when someone creates a brand-new token today, it immediately works with thousands of existing wallets, exchanges, and apps — no special integration needed. Tokens on the blockchain are not physical coins or poker chips. They are just numbers in a smart contract's ledger — a mapping that says \"this address owns this many tokens.\" But because everyone agrees on the same rules, those numbers become as tradeable and useful as real-world money.",
      },
      {
        heading: "Tokens vs. Coins: What Is the Difference?",
        content:
          "You will hear people use the words \"coin\" and \"token\" as if they mean the same thing, but there is a technical difference. A <strong>coin</strong> is the native currency of a blockchain. Ether (ETH) is Ethereum's coin. Bitcoin (BTC) is Bitcoin's coin. Coins are built into the blockchain protocol itself — they are used to pay transaction fees and reward validators. A <strong>token</strong>, on the other hand, lives inside a smart contract <em>on top of</em> a blockchain. Tokens are created by regular developers, not by the blockchain itself. USDC, Shiba Inu, Uniswap's UNI — these are all tokens that run on Ethereum. Think of it this way: the blockchain is like a country, the coin is the country's official currency (like the US dollar), and tokens are like gift cards, loyalty points, and coupons that businesses create within that country. They all have value, but only the official currency is baked into the system. One important thing: you always need the native coin to pay gas fees. Even if you are transferring a token like USDC, you still pay the Ethereum transaction fee in ETH. It is like needing stamps (ETH) to mail a package (your token transfer) through the post office (the blockchain).",
      },
      {
        heading: "The ERC System: Ethereum's Rule Books",
        content:
          "The letters <strong>ERC</strong> stand for <em>Ethereum Request for Comments</em>. It is a process where developers propose new standards for how things should work on Ethereum. Think of ERCs like rule books for different types of games. ERC-20 is the rule book for fungible tokens (tokens that are all identical and interchangeable, like dollar bills). ERC-721 is the rule book for non-fungible tokens (NFTs — unique, one-of-a-kind items). ERC-1155 is a rule book that handles <em>both</em> fungible and non-fungible tokens in a single contract. Each ERC defines a set of <strong>functions</strong> that a contract must have. For example, ERC-20 says every fungible token contract must have a <code>transfer</code> function, a <code>balanceOf</code> function, and an <code>approve</code> function, among others. As long as your contract has all the required functions with the right names and behaviors, it is considered ERC-20 compliant — and every wallet and exchange in the ecosystem will know how to interact with it. It is a brilliant system because it lets thousands of independent developers create tokens that all work together seamlessly, without anyone being in charge.",
      },
      {
        heading: "Why Tokens Matter Beyond Money",
        content:
          "When most people hear \"tokens,\" they think of cryptocurrency and trading. But tokens represent so much more than money. <strong>Governance tokens</strong> let holders vote on decisions, like shareholders in a company. If you hold UNI tokens, you can vote on how the Uniswap protocol is run. <strong>Utility tokens</strong> give access to services — like needing a library card to check out books. <strong>Reputation tokens</strong> (sometimes called soulbound tokens) can represent achievements or credentials that cannot be transferred. Imagine a token that proves you completed a course, earned a certification, or contributed to a project. In the OmnID system, tokens play a role in identity and reputation. Your verified credentials could be represented as special tokens that prove things about you without revealing private details. The concept of tokenization — turning real-world things into blockchain tokens — extends to real estate, art, concert tickets, and even carbon credits. Anything that needs to be tracked, owned, transferred, or verified can potentially be represented as a token. This is why understanding tokens is fundamental to understanding the future of the internet.",
      },
    ],
    quiz: [
      {
        question: "What is the difference between a coin and a token?",
        options: [
          "There is no difference — they are the same thing",
          "A coin is the native currency of a blockchain; a token lives in a smart contract on top of it",
          "Tokens are more valuable than coins",
          "Coins can only be used for trading, while tokens are for everything else",
        ],
        correctIndex: 1,
        explanation:
          "A coin (like ETH) is built into the blockchain protocol itself, while a token (like USDC) is created by a smart contract that runs on top of the blockchain.",
      },
      {
        question: "What does ERC stand for?",
        options: [
          "Ethereum Real Currency",
          "Electronic Resource Code",
          "Ethereum Request for Comments",
          "Encrypted Registry Certificate",
        ],
        correctIndex: 2,
        explanation:
          "ERC stands for Ethereum Request for Comments — the process by which developers propose and agree upon new standards for the Ethereum ecosystem.",
      },
      {
        question:
          "Why do token standards make the ecosystem so powerful?",
        options: [
          "They make tokens more expensive",
          "They allow any token to work with any wallet, exchange, or app that supports the standard",
          "They prevent anyone from creating new tokens",
          "They are controlled by a single company",
        ],
        correctIndex: 1,
        explanation:
          "Shared standards mean that any new token following the rules automatically works with thousands of existing wallets, exchanges, and apps — no custom integration needed.",
      },
    ],
  },

  {
    id: 20,
    title: "ERC-20: Fungible Tokens",
    module: "Tokens & DeFi",
    moduleNumber: 4,
    subtitle: "USDC, DAI, and how stablecoins work",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "What Does Fungible Mean?",
        content:
          "Let's start with a word that sounds fancy but is actually simple: <strong>fungible</strong>. Something is fungible if every unit is identical and interchangeable. A dollar bill is fungible — it does not matter which specific dollar bill you have; any dollar is worth the same as any other dollar. If you lend your friend a $5 bill, you do not care if they give you back the <em>exact same</em> bill — any $5 bill will do. Compare that with something <strong>non-fungible</strong>, like a signed baseball card. If you lend someone your autographed Babe Ruth card, you definitely want <em>that specific card</em> back, not just any random baseball card. ERC-20 tokens are the blockchain version of fungible things. Every USDC token is worth exactly the same as every other USDC token. Every UNI token is identical to every other UNI token. This makes them perfect for currencies, loyalty points, voting power, and any use case where one unit equals another. The ERC-20 standard was proposed in 2015 by Fabian Vogelsteller and became the backbone of the entire Ethereum token ecosystem. Today, there are hundreds of thousands of ERC-20 tokens with a combined value in the hundreds of billions of dollars.",
      },
      {
        heading: "Inside an ERC-20 Contract",
        content:
          "Under the hood, an ERC-20 token contract is surprisingly simple. At its core, it is just a <strong>mapping</strong> — a big table that links addresses to balances. Think of it as a spreadsheet: Column A lists wallet addresses, and Column B lists how many tokens each address owns. The ERC-20 standard requires several key functions:<br><br><strong>totalSupply()</strong> — Returns the total number of tokens that exist.<br><strong>balanceOf(address)</strong> — Returns how many tokens a specific address owns.<br><strong>transfer(to, amount)</strong> — Moves tokens from your address to someone else's.<br><strong>approve(spender, amount)</strong> — Gives another address permission to spend your tokens (up to a limit).<br><strong>transferFrom(from, to, amount)</strong> — Lets an approved address move tokens on your behalf.<br><br>The approve + transferFrom combo is used by decentralized exchanges and other apps. When you use Uniswap to swap tokens, you first <em>approve</em> the Uniswap contract to spend your tokens, and then Uniswap calls <em>transferFrom</em> to execute the trade. It is like giving a trusted friend a signed permission slip to pick up your package from the post office.",
      },
      {
        heading: "Stablecoins: Taming the Volatility",
        content:
          "One of the most important uses of ERC-20 tokens is <strong>stablecoins</strong>. Regular cryptocurrencies like ETH can swing 10-20% in a single day — great for traders, terrible for anyone who just wants to save money or pay for things. Stablecoins solve this by keeping their value pegged to a real-world currency, usually the US dollar. <strong>USDC</strong> (USD Coin) is backed 1:1 by real dollars held in bank accounts. For every USDC token in circulation, Circle (the company behind it) holds one actual US dollar in reserve. It is like a digital gift card backed by real cash. <strong>DAI</strong> takes a different approach — it is <em>decentralized</em> and backed by cryptocurrency locked in smart contracts. Users deposit ETH or other tokens as collateral, and the system mints DAI against it. Complex algorithms and incentives keep DAI's price close to $1. There are also <strong>algorithmic stablecoins</strong> that use supply-and-demand mechanics instead of reserves, but these have a troubled history — the Terra/UST crash in 2022 wiped out $40 billion when the algorithm failed. Stablecoins are a bridge between traditional finance and crypto, making it possible to use blockchain for everyday payments without worrying about wild price swings.",
      },
      {
        heading: "ERC-20 Tokens in the Wild",
        content:
          "ERC-20 tokens are the backbone of decentralized finance (DeFi). Here are some real-world examples:<br><br><strong>USDC and USDT</strong> — Stablecoins used for trading, lending, and payments. Combined market cap: over $100 billion.<br><strong>UNI</strong> — The governance token of Uniswap; holders vote on protocol changes.<br><strong>LINK</strong> — The utility token of Chainlink, used to pay oracle operators who bring real-world data to the blockchain.<br><strong>WETH</strong> — \"Wrapped Ether\" is ETH packaged as an ERC-20 token so it can be used seamlessly with other ERC-20 tokens in DeFi protocols.<br><br>Creating your own ERC-20 token is actually one of the easiest smart contract projects. Using OpenZeppelin's library, the entire contract can be less than 10 lines of code. But here is the important thing: <em>creating</em> a token is easy; giving it real <em>value</em> is the hard part. A token's value comes from what it does, what community supports it, and what trust it has earned. Thousands of tokens have been created as scams or jokes with no real purpose. Always research a token before interacting with it — check the contract code, the team behind it, and whether it has been audited.",
      },
    ],
    quiz: [
      {
        question: "What does 'fungible' mean?",
        options: [
          "Rare and one-of-a-kind",
          "Every unit is identical and interchangeable",
          "Can only be used once",
          "Controlled by a central authority",
        ],
        correctIndex: 1,
        explanation:
          "Fungible means every unit is identical and interchangeable — like dollar bills. Any one dollar is worth the same as any other dollar.",
      },
      {
        question:
          "How does USDC maintain its value at $1?",
        options: [
          "An algorithm automatically adjusts the supply",
          "The Ethereum protocol enforces the price",
          "It is backed 1:1 by real US dollars held in bank accounts",
          "Miners agree to only sell it at $1",
        ],
        correctIndex: 2,
        explanation:
          "USDC is backed by real US dollars — for every USDC token, Circle holds one actual dollar in reserve, keeping the value pegged at $1.",
      },
      {
        question:
          "Why does the ERC-20 standard include both 'approve' and 'transferFrom' functions?",
        options: [
          "To make transactions slower and more secure",
          "To let other contracts (like exchanges) move tokens on your behalf after you give permission",
          "To double the gas cost for extra safety",
          "To allow tokens to be transferred between different blockchains",
        ],
        correctIndex: 1,
        explanation:
          "The approve + transferFrom pattern lets you give another address (like a decentralized exchange) permission to move your tokens, enabling automated trading and DeFi interactions.",
      },
    ],
  },

  {
    id: 21,
    title: "NFTs (ERC-721)",
    module: "Tokens & DeFi",
    moduleNumber: 4,
    subtitle: "Unique digital items and why they matter",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Trading Card Analogy",
        content:
          "Imagine you have a collection of Pokemon cards. Each card is different — a holographic Charizard is not the same as a common Pidgey. They are both Pokemon cards, but they have different artwork, stats, and value. You cannot just swap one for the other and call it even. This is what <strong>non-fungible</strong> means: each item is unique and not interchangeable. NFTs — <em>Non-Fungible Tokens</em> — bring this concept to the blockchain. Each NFT has a unique identifier (called a <strong>token ID</strong>) that distinguishes it from every other token in the same collection. Just like each Pokemon card has a different number, each NFT has its own ID. The ERC-721 standard defines the rules for creating and managing these unique tokens on Ethereum. When NFTs exploded in popularity in 2021, people were spending millions on digital art — a piece by the artist Beeple sold for <strong>$69 million</strong> at Christie's auction house. While the hype around expensive JPEGs has cooled, the <em>technology</em> behind NFTs is far more interesting and useful than just digital art. NFTs can represent any unique thing: event tickets, property deeds, academic credentials, game items, and much more.",
      },
      {
        heading: "How ERC-721 Works",
        content:
          "An ERC-721 contract is a lot like an ERC-20 contract, but instead of tracking one balance per address, it tracks <strong>ownership of individual items</strong>. The contract maintains a registry: Token #1 belongs to Alice, Token #2 belongs to Bob, Token #3 belongs to Alice again, and so on. Key functions include:<br><br><strong>ownerOf(tokenId)</strong> — Returns who owns a specific token.<br><strong>transferFrom(from, to, tokenId)</strong> — Transfers a specific token from one address to another.<br><strong>approve(to, tokenId)</strong> — Gives someone permission to transfer a specific token.<br><strong>tokenURI(tokenId)</strong> — Returns a URL pointing to the token's <em>metadata</em> (name, description, image, attributes).<br><br>That last function is important. The actual image or file associated with an NFT is usually <em>not</em> stored on the blockchain — it would be far too expensive. Instead, the contract stores a link (URI) that points to where the data lives, often on a decentralized storage network like <strong>IPFS</strong> (InterPlanetary File System). IPFS uses content-addressing: the link is based on the file's content, so if anyone changes the file, the link breaks. This ensures the metadata stays authentic.",
      },
      {
        heading: "Beyond Art: Real-World Uses for NFTs",
        content:
          "Forget the $69 million art for a moment. The real magic of NFTs is <strong>provable uniqueness and ownership on the internet</strong>. Here are use cases that are actually changing the world:<br><br><strong>Event Tickets:</strong> An NFT ticket cannot be counterfeited and can include rules about resale (like capping the price so scalpers cannot charge 10x). The ticket's history is transparent — you can prove it is real.<br><br><strong>Gaming:</strong> In traditional games, you might earn a rare sword, but it only exists inside that one game, and the company can take it away. With NFT-based game items, <em>you</em> own the sword. You can sell it, trade it, or potentially use it in other games.<br><br><strong>Domain Names:</strong> Ethereum Name Service (ENS) issues domain names like \"alice.eth\" as NFTs. Whoever holds the NFT controls the name.<br><br><strong>Credentials and Certificates:</strong> A university could issue your diploma as an NFT. It is verifiable, cannot be faked, and you carry it in your wallet forever. This connects directly to what OmnID does — using unique tokens to represent identity credentials. The non-fungible nature means your credential is truly <em>yours</em> and nobody else's.",
      },
      {
        heading: "Soulbound Tokens: NFTs That Stay With You",
        content:
          "In 2022, Ethereum co-founder Vitalik Buterin proposed a new concept called <strong>Soulbound Tokens (SBTs)</strong>. These are NFTs that <em>cannot be transferred</em>. Once they are in your wallet, they stay there permanently. The name comes from \"soulbound\" items in World of Warcraft — powerful gear that binds to your character and cannot be traded or given away. Why would you want a token you cannot sell? Because some things should not be tradeable. Think about it: you would not want someone else buying your college diploma and pretending they earned it. You would not want your driver's license to be transferable. SBTs represent <strong>achievements, credentials, reputation, and membership</strong> — things that are personal to you. Imagine a wallet full of SBTs: one proving you graduated high school, one showing you are a certified lifeguard, one marking you as a founding member of a community, and one recording your volunteer hours. Together, they paint a verifiable picture of who you are — a <strong>decentralized identity</strong>. This concept is central to OmnID's mission. Verifiable credentials, age proofs, and reputation scores are not things you should be able to sell on a marketplace. They need to stay bound to <em>you</em>. Soulbound tokens are a key building block for the decentralized identity future.",
      },
    ],
    quiz: [
      {
        question: "What makes an NFT different from an ERC-20 token?",
        options: [
          "NFTs are always more expensive",
          "Each NFT has a unique token ID and is not interchangeable",
          "NFTs can only represent artwork",
          "NFTs do not use smart contracts",
        ],
        correctIndex: 1,
        explanation:
          "Unlike ERC-20 tokens (which are all identical), each NFT has a unique token ID and represents a distinct item. They are non-fungible — not interchangeable.",
      },
      {
        question: "Where is the actual image of an NFT usually stored?",
        options: [
          "Directly on the Ethereum blockchain",
          "On a decentralized storage network like IPFS, linked from the contract via tokenURI",
          "On the NFT creator's personal computer",
          "Inside the wallet that owns the NFT",
        ],
        correctIndex: 1,
        explanation:
          "Storing large files on-chain would be extremely expensive. Instead, the NFT contract stores a URI that points to the metadata and image on decentralized storage like IPFS.",
      },
      {
        question: "What is a Soulbound Token (SBT)?",
        options: [
          "An NFT that is extremely rare and valuable",
          "An NFT that cannot be transferred once received",
          "A token that only works in video games",
          "A token that expires after one year",
        ],
        correctIndex: 1,
        explanation:
          "Soulbound Tokens are non-transferable NFTs. They represent personal things like credentials, achievements, and reputation that should stay bound to you and not be sold.",
      },
    ],
  },

  {
    id: 22,
    title: "DeFi Overview",
    module: "Tokens & DeFi",
    moduleNumber: 4,
    subtitle: "Banking, lending, and trading without banks",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "What If Banks Ran Themselves?",
        content:
          "Imagine if your school's cafeteria ran without any staff. The food is there, the cash register works automatically, and students can buy lunch, make change, and even lend lunch money to each other — all without a single adult behind the counter. The rules are coded into the system, and they execute exactly as written, every time. That is <strong>DeFi</strong> — short for <em>Decentralized Finance</em>. DeFi takes traditional financial services like lending, borrowing, trading, and earning interest, and replaces the banks, brokers, and middlemen with <strong>smart contracts</strong>. No CEO, no branch offices, no bankers' hours. The code is the bank, and it is open 24/7, 365 days a year. Why does this matter? Traditional banks charge fees, can freeze your account, take days to process transfers, and require you to be old enough (and wealthy enough) to participate. DeFi has none of these gatekeepers. Anyone with an internet connection and a crypto wallet can access financial services — whether you are a teenager in Indiana or a farmer in Kenya. The total value locked in DeFi protocols has reached tens of billions of dollars, proving this is not just an experiment — it is a parallel financial system being built in real time.",
      },
      {
        heading: "Decentralized Exchanges (DEXs)",
        content:
          "In traditional finance, if you want to trade stocks, you go through a broker like Fidelity or Robinhood. They match buyers with sellers, take a fee, and control the whole process. A <strong>decentralized exchange (DEX)</strong> does this with smart contracts instead. The most famous DEX is <strong>Uniswap</strong>. But here is the clever part: Uniswap does not use a traditional order book (a list of buyers and sellers). Instead, it uses something called an <strong>Automated Market Maker (AMM)</strong>. Here is how it works in simple terms: people deposit pairs of tokens into <em>liquidity pools</em> — for example, a pool containing both ETH and USDC. When you want to swap ETH for USDC, you send ETH to the pool and receive USDC from it. A mathematical formula determines the exchange rate based on how much of each token is in the pool. The people who deposited tokens into the pool earn a small fee from every trade — like earning interest for providing the cafeteria's cash register with change. This is called <strong>providing liquidity</strong>, and it is one of the ways people earn money in DeFi. Other popular DEXs include <strong>SushiSwap</strong>, <strong>Curve</strong> (optimized for stablecoins), and <strong>PancakeSwap</strong> (on the BNB chain).",
      },
      {
        heading: "Lending and Borrowing",
        content:
          "In the real world, you go to a bank to get a loan. The bank checks your credit score, your income, and a bunch of paperwork before deciding whether to lend you money. In DeFi, lending works differently. Protocols like <strong>Aave</strong> and <strong>Compound</strong> let anyone lend or borrow cryptocurrency using smart contracts. If you have ETH sitting in your wallet doing nothing, you can deposit it into Aave and start earning interest immediately — other people are borrowing that ETH and paying interest for the privilege. But wait — how does borrowing work without credit scores? DeFi uses <strong>over-collateralization</strong>. To borrow $100 worth of USDC, you might need to deposit $150 worth of ETH as collateral. If the value of your collateral drops too low (say ETH's price crashes), the protocol automatically <em>liquidates</em> your collateral — sells it to repay the loan. It is like a pawn shop: you leave something valuable as a guarantee, and if you do not pay back the loan, they keep your stuff. This system is not perfect — requiring $150 to borrow $100 is not great for people who need money. But it works without trusting anyone, and the interest rates are often better than what traditional banks offer.",
      },
      {
        heading: "Risks and the Future of DeFi",
        content:
          "DeFi is exciting, but it comes with real risks. <strong>Smart contract bugs</strong> can lead to millions being stolen, as we learned in the security lesson. <strong>Impermanent loss</strong> can eat into liquidity providers' profits when token prices change. <strong>Rug pulls</strong> happen when dishonest developers create a fake DeFi project, attract deposits, and then drain all the money. And because DeFi is largely unregulated, there is often no one to call if something goes wrong — no customer service, no FDIC insurance, no refunds. Despite these risks, DeFi is evolving rapidly. <strong>Layer 2 solutions</strong> like Arbitrum and Optimism are making DeFi cheaper and faster by processing transactions off the main Ethereum chain. <strong>Real-World Asset (RWA) tokenization</strong> is bringing traditional assets like US Treasury bonds on-chain, creating new ways to earn yield. And <strong>decentralized identity</strong> — exactly what OmnID is building — could eventually enable under-collateralized lending by letting borrowers prove their creditworthiness without revealing personal information. The future of DeFi is not about replacing banks entirely; it is about creating a system where financial services are open, transparent, and accessible to everyone on Earth. That is a goal worth working toward.",
      },
    ],
    quiz: [
      {
        question: "What does DeFi stand for?",
        options: [
          "Defined Finance",
          "Decentralized Finance",
          "Digital File Infrastructure",
          "Delegated Financial Instruments",
        ],
        correctIndex: 1,
        explanation:
          "DeFi stands for Decentralized Finance — financial services like lending, borrowing, and trading that run on smart contracts instead of through banks and brokers.",
      },
      {
        question: "How does an Automated Market Maker (AMM) work?",
        options: [
          "It matches individual buyers and sellers like a stock exchange",
          "Users trade against liquidity pools, and a formula sets the price based on pool ratios",
          "A centralized server calculates the best price",
          "It only works with Bitcoin",
        ],
        correctIndex: 1,
        explanation:
          "AMMs use liquidity pools (token pairs deposited by users) and mathematical formulas to determine exchange rates, rather than matching individual buy and sell orders.",
      },
      {
        question:
          "Why does DeFi lending require over-collateralization?",
        options: [
          "To make more profit for the protocol",
          "Because there are no credit scores — collateral protects lenders if borrowers default",
          "Because Ethereum requires it",
          "To prevent people from borrowing too much money",
        ],
        correctIndex: 1,
        explanation:
          "Without credit scores or identity verification, DeFi has no way to assess a borrower's trustworthiness. Over-collateralization ensures lenders are protected even if the borrower never repays.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 5: Digital Identity & Privacy (23-28)
  // ─────────────────────────────────────────────
  {
    id: 23,
    title: "The Identity Problem",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "Who are you online, and who decides?",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Your Identity in the Real World",
        content:
          "Think about how you prove who you are in everyday life. At school, teachers know you by your face and name. At the doctor's office, your parents show an insurance card. At the airport, you need a passport. Each situation requires a different \"proof,\" and you carry different cards, documents, and IDs for each one. Now here is something interesting: <em>you</em> do not actually control most of these identities. Your school gave you your student ID. The government issued your birth certificate. Your doctor's office assigned you a patient number. If any of these organizations made a mistake, shut down, or decided to revoke your ID, you would have a problem. You are dependent on them. This system mostly works in the physical world because institutions are stable and regulated. But online, things get much messier. Your \"identity\" on the internet is scattered across hundreds of accounts — Gmail, Instagram, Roblox, YouTube, school portals — each one controlled by a different company. You do not own any of them. If Google suspends your Gmail account, you could lose access to dozens of other services that use \"Sign in with Google.\" Your online identity is a house of cards, and you are not the one holding them up.",
      },
      {
        heading: "The Username-Password Problem",
        content:
          "The way we identify ourselves online today is fundamentally broken. The most common system — <strong>usernames and passwords</strong> — was invented in the 1960s for shared computers at MIT. We are still using essentially the same system over 60 years later, and it shows. The average person has over <strong>100 online accounts</strong>. Nobody can remember 100 unique, strong passwords, so people reuse them. Studies show that over 60% of people use the same password for multiple sites. When one site gets hacked, attackers try those passwords everywhere else — a technique called <strong>credential stuffing</strong>. Even with password managers and two-factor authentication (where you get a text message code), the system puts the burden on <em>you</em> to keep yourself safe. Meanwhile, every company you create an account with stores your personal information in their database — your email, name, address, and sometimes much more. You are trusting hundreds of different companies to protect your data. As we will see in the next lesson, they often fail. The core problem is this: on the internet today, <strong>the service decides who you are, not you</strong>. Your identity exists at the mercy of platforms.",
      },
      {
        heading: "Why Blockchain Changes the Game",
        content:
          "Blockchain technology offers a radically different approach to identity: <strong>self-sovereign identity (SSI)</strong>. The word \"sovereign\" means having supreme authority. A self-sovereign identity means <em>you</em> are the ultimate authority over your own identity — not Google, not your school, not the government. Here is how it could work: instead of creating an account on every website (giving them your data), you have a single <strong>digital identity</strong> stored in a wallet you control, anchored to the blockchain. When a website needs to verify something about you — like your age or that you are a real person — you share only the specific proof they need, and nothing more. The website never gets your password because there is no password. They never store your personal data because they never see it. They just verify a cryptographic proof that comes from a trusted source. It is like showing a bouncer a stamp on your hand that says \"over 18\" — they do not need to see your full driver's license with your home address, birthdate, and eye color. This is the vision that projects like OmnID are working to make real. It is not science fiction; the technology exists today. The challenge is getting enough people and services to adopt it.",
      },
      {
        heading: "The Global Identity Gap",
        content:
          "Here is a staggering fact: approximately <strong>850 million people worldwide</strong> have no official form of identification — no birth certificate, no government ID, nothing. Without ID, you cannot open a bank account, enroll in school, vote, travel, or access healthcare in many countries. These are mostly people in developing nations, refugees, and stateless individuals. The traditional identity system has failed them. Blockchain-based identity could help. Because it does not require a government to issue your identity, a <strong>decentralized identifier</strong> can be created by anyone with a smartphone. Humanitarian organizations could issue verifiable credentials (like proof of vaccination or refugee status) that the person carries in their digital wallet. This is not just a theory — the United Nations and organizations like the World Food Programme are already experimenting with blockchain-based identity for refugees. Even in wealthy countries, decentralized identity solves real problems. It can reduce identity theft, simplify tedious verification processes (like proving your age or address over and over), and give individuals control over their personal data. The identity problem is one of the biggest challenges of the digital age, and blockchain may be the key to solving it.",
      },
    ],
    quiz: [
      {
        question: "What is the core problem with online identity today?",
        options: [
          "The internet is too slow for identity verification",
          "Services control your identity — you do not own or control your own online identity",
          "There are not enough social media platforms",
          "Passwords are too long",
        ],
        correctIndex: 1,
        explanation:
          "The fundamental problem is that companies and platforms control your identity online. If they shut down or revoke your account, you lose your identity on that service.",
      },
      {
        question: "What does 'self-sovereign identity' mean?",
        options: [
          "An identity issued by a king or queen",
          "An identity that only works in one country",
          "You are the ultimate authority over your own identity, not any company or government",
          "An identity that cannot be used online",
        ],
        correctIndex: 2,
        explanation:
          "Self-sovereign identity means you control your own identity. You decide what information to share, with whom, and no single organization can take it away from you.",
      },
      {
        question:
          "Approximately how many people worldwide lack official identification?",
        options: [
          "About 1 million",
          "About 50 million",
          "About 850 million",
          "About 5 billion",
        ],
        correctIndex: 2,
        explanation:
          "Approximately 850 million people worldwide have no official form of ID — no birth certificate, no government-issued identification — locking them out of essential services.",
      },
    ],
  },

  {
    id: 24,
    title: "Data Breaches",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "What happens when companies lose your data",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Day Your Data Escapes",
        content:
          "Picture this: you have a secret diary that you keep in your locker at school. One day you find out that someone broke into every locker in the entire school, photocopied every diary, and posted them all on the internet. Every embarrassing thought, every private note — gone, exposed forever. That is essentially what happens in a <strong>data breach</strong>. Companies collect massive amounts of your personal information — names, emails, passwords, phone numbers, social security numbers, medical records, and more. They store all of it in databases. When hackers break into those databases, they steal everything at once. This is not rare — it happens <em>constantly</em>. In 2017, <strong>Equifax</strong> (a credit reporting company) was breached, exposing the personal data of <strong>147 million people</strong> — nearly half the US population. In 2021, <strong>Facebook</strong> had data from <strong>533 million users</strong> leaked. T-Mobile, Yahoo, Marriott, LinkedIn — the list goes on and on. The website <em>Have I Been Pwned</em> tracks breaches, and the average email address appears in at least 2-3 breaches. If you have ever created an account online, your data has very likely been compromised at some point.",
      },
      {
        heading: "How Breaches Happen",
        content:
          "Data breaches happen in several ways, and most of them boil down to human error or cutting corners on security. <strong>Phishing</strong> is one of the most common methods — an employee at a company receives a fake email that looks legitimate, clicks a link, and enters their login credentials on a fake website. The attacker now has an employee's login and can access internal systems. <strong>Software vulnerabilities</strong> are another major cause. Companies use thousands of software packages, and if they do not update them regularly, known bugs can be exploited. The Equifax breach happened because they failed to update a single piece of software that had a known security fix available for <em>months</em>. <strong>Misconfiguration</strong> is surprisingly common too — companies accidentally leave databases exposed on the internet with no password at all. Researchers regularly find open databases containing millions of records just sitting there for anyone to access. And then there are <strong>insider threats</strong> — employees who intentionally steal data, either for profit or revenge. The common thread? Every breach comes back to the centralized model: one company holds a giant pile of data, and that pile is a target. The bigger the pile, the more valuable the target.",
      },
      {
        heading: "What Happens After a Breach",
        content:
          "When your data is stolen, it does not just disappear. It enters a thriving underground economy. Stolen data is sold on <strong>dark web marketplaces</strong> — secret websites that require special software to access. A stolen credit card number might sell for $5-$20. A complete identity package (name, social security number, address, date of birth) can sell for $30-$100. Medical records are the most valuable — up to $1,000 each — because they contain enough information for complete identity theft. Criminals use stolen data for <strong>identity theft</strong> (opening credit cards or bank accounts in your name), <strong>account takeover</strong> (logging into your existing accounts), and <strong>social engineering</strong> (using personal details to trick you or your family). The damage can take <em>years</em> to undo. Victims spend an average of 200 hours and $1,300 out of pocket resolving identity theft. And here is the worst part: once your data is out there, <strong>you cannot take it back</strong>. You can change your password, but you cannot change your social security number or your date of birth. Those are compromised forever. Companies might offer you free credit monitoring after a breach, but that is like offering you a band-aid after setting your house on fire.",
      },
      {
        heading: "The Decentralized Solution",
        content:
          "Data breaches are not just a technology problem — they are a <strong>design problem</strong>. The current system requires companies to collect and store your personal data in order to serve you. Every database is a honeypot, attracting hackers. Decentralized identity flips this model on its head. Instead of giving every website your personal data, you keep it in your own secure wallet and share only <strong>cryptographic proofs</strong>. Want to prove you are over 13 to sign up for a social media site? Instead of entering your birthdate (which gets stored in yet another database), you present a zero-knowledge proof that says \"this person is over 13\" — verified by a trusted source — without revealing your actual birthdate. The website never sees or stores your birthdate, so there is nothing for hackers to steal. Even if the website gets hacked, your personal data was never there. This is a fundamental shift from \"collect everything, protect the pile\" to \"collect nothing, prove what is needed.\" It does not make breaches impossible (hackers could still steal the website's own data), but it dramatically reduces the damage because personal information was never centralized in the first place. This vision is what drives projects like OmnID — building a world where data breaches lose their power because the data was never collected.",
      },
    ],
    quiz: [
      {
        question:
          "In the 2017 Equifax breach, how many people's data was exposed?",
        options: [
          "About 1 million",
          "About 10 million",
          "About 147 million",
          "About 1 billion",
        ],
        correctIndex: 2,
        explanation:
          "The Equifax breach exposed the personal data of approximately 147 million people — nearly half the US population — including social security numbers and addresses.",
      },
      {
        question:
          "Why are data breaches fundamentally a design problem, not just a technology problem?",
        options: [
          "Because hackers are too smart to stop",
          "Because the current system requires companies to collect and centralize personal data, creating attractive targets",
          "Because computers are not powerful enough for security",
          "Because people use the internet too much",
        ],
        correctIndex: 1,
        explanation:
          "The core issue is the design: companies must collect and store personal data centrally, creating 'honeypots' that attract hackers. Decentralized identity eliminates this by not collecting the data in the first place.",
      },
      {
        question:
          "How does decentralized identity reduce the impact of data breaches?",
        options: [
          "It makes websites unhackable",
          "It encrypts all data with unbreakable encryption",
          "Users share cryptographic proofs instead of personal data, so there is nothing sensitive to steal",
          "It deletes all data after 24 hours",
        ],
        correctIndex: 2,
        explanation:
          "With decentralized identity, users share cryptographic proofs rather than actual personal data. Since the website never stores your birthdate, address, or other details, a breach cannot expose information that was never there.",
      },
    ],
  },

  {
    id: 25,
    title: "Decentralized Identifiers (DIDs)",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "Owning your identity on blockchain",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Your Phone Number vs. Your Name",
        content:
          "Think about the difference between your name and your phone number. Your name was given to you by your parents — it is yours for life (unless you choose to change it), and no company controls it. Your phone number, on the other hand, was assigned to you by a phone company. If you switch carriers or stop paying your bill, you might lose that number. Someone else could get it. The phone company is in control. Most of your online identities work like phone numbers — they are assigned and controlled by companies. Your Google account, your Instagram handle, your school email — all of them can be taken away. A <strong>Decentralized Identifier (DID)</strong> works more like your name. It is a globally unique identifier that <em>you</em> create, <em>you</em> own, and <em>you</em> control. No company issues it, and no company can revoke it. A DID looks something like this: <code>did:ethr:0x1234abcd...</code>. The \"did\" part says it is a Decentralized Identifier. The \"ethr\" part says it uses the Ethereum method. And the long string at the end is your unique identifier. DIDs are a <strong>W3C standard</strong> — meaning the World Wide Web Consortium (the same group that standardizes HTML and CSS) has formally defined how they work.",
      },
      {
        heading: "How DIDs Work Under the Hood",
        content:
          "A DID is more than just a string of characters. Each DID is linked to a <strong>DID Document</strong> — a small file (usually in JSON format) that contains important information about the identity. The DID Document includes:<br><br><strong>Public keys:</strong> Cryptographic keys that others can use to verify your signatures or encrypt messages to you.<br><strong>Authentication methods:</strong> How you prove you are the owner of this DID (usually by signing something with your private key).<br><strong>Service endpoints:</strong> Where to reach you — like URLs for your messaging service or credential storage.<br><br>The DID Document is stored or anchored somewhere that anyone can look it up — this could be a blockchain, a distributed network, or even a web server, depending on the <em>DID method</em>. The key insight is that the DID Document is controlled by whoever holds the private key. You can update it, add new keys, or deactivate it — all without asking anyone's permission. Think of a DID as a mailbox you built yourself. The DID is the address on the mailbox, the DID Document is the information inside it (like which keys open it and where to forward mail), and your private key is the only key that can open it. Nobody else can redirect your mail or change your locks.",
      },
      {
        heading: "DID Methods: Many Roads to the Same Destination",
        content:
          "One of the coolest things about DIDs is that they are <em>method-agnostic</em>. Different communities can create different ways of implementing DIDs, and they all follow the same standard. Here are some real DID methods:<br><br><strong>did:ethr</strong> — Uses Ethereum. Your DID is derived from your Ethereum address, and the DID Document is managed by a smart contract called the ERC-1056 Ethereum DID Registry.<br><strong>did:web</strong> — Uses your website's domain. The DID Document is hosted at a specific URL on your web server. Simpler to set up but relies on traditional web hosting.<br><strong>did:key</strong> — The DID is directly derived from a cryptographic key pair. No blockchain or server needed — the DID itself <em>is</em> the key. Super simple but you cannot update it.<br><strong>did:ion</strong> — Uses Bitcoin's blockchain through Microsoft's ION network.<br><br>For OmnID, the <code>did:ethr</code> method is particularly relevant because the project is built on Ethereum. When you create an Ethereum wallet, you essentially already have the building blocks for a DID. Your wallet address can serve as the foundation for your decentralized identity, and smart contracts manage what credentials and attributes are associated with it.",
      },
      {
        heading: "DIDs in Practice",
        content:
          "Let's walk through a real-world scenario. Imagine you are applying for a summer coding camp online. Today, you would fill out a long form: name, email, age, school, parent's contact info, maybe upload a transcript. All that data gets stored in the camp's database. With DIDs, the process could look like this:<br><br>1. You connect your DID wallet to the camp's website.<br>2. The camp asks: \"Are you between 12 and 17? Are you enrolled in a school? Do you have a parent's permission?\"<br>3. Your wallet presents <strong>verifiable credentials</strong> (which we will cover in the next lesson) that prove each of these things — without revealing your exact age, your school's name, or your parent's personal info.<br>4. The camp verifies the proofs, admits you, and stores <em>nothing</em> except \"Student DID xyz was admitted.\"<br><br>No database full of kids' personal information sitting there waiting to be breached. No forms to fill out. No passwords to create. Just you, your wallet, and cryptographic proofs that you meet the requirements. This is the power of DIDs — they are the foundation layer that makes everything else in decentralized identity possible. Your DID is <em>you</em> on the internet, controlled by <em>you</em>, forever.",
      },
    ],
    quiz: [
      {
        question: "What does a DID Document contain?",
        options: [
          "Your full name, address, and social security number",
          "Public keys, authentication methods, and service endpoints",
          "A list of all websites you have visited",
          "Your credit score and bank balance",
        ],
        correctIndex: 1,
        explanation:
          "A DID Document contains public keys (for verification and encryption), authentication methods (how to prove ownership), and service endpoints (where to reach you). It does NOT contain personal data like your name or address.",
      },
      {
        question: "Who controls a Decentralized Identifier?",
        options: [
          "The government that issued it",
          "The blockchain network",
          "Whoever holds the private key associated with it",
          "The W3C standards committee",
        ],
        correctIndex: 2,
        explanation:
          "A DID is controlled by whoever holds the associated private key. No company, government, or organization can revoke or modify it without that key.",
      },
      {
        question:
          "What is the main advantage of the did:key method?",
        options: [
          "It is the most secure method available",
          "It works without any blockchain or server — the DID itself is derived from the key",
          "It can store the most data",
          "It is the only method recognized by governments",
        ],
        correctIndex: 1,
        explanation:
          "The did:key method derives the DID directly from a cryptographic key pair, requiring no blockchain or server. It is the simplest method, though it cannot be updated after creation.",
      },
    ],
  },

  {
    id: 26,
    title: "Verifiable Credentials",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "Digital sealed envelopes from trusted sources",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Sealed Envelope",
        content:
          "Imagine your school gives you a sealed envelope with your report card inside. The envelope has the school's official stamp on the seal. When you hand it to someone — say, a summer program you are applying to — they can see the seal is intact and trust that the school really wrote what is inside. They do not have to call the school to check. The seal proves it is authentic and has not been tampered with. A <strong>Verifiable Credential (VC)</strong> is the digital version of that sealed envelope. It is a tamper-proof digital document that contains claims about you — like \"this person is over 18\" or \"this person has a high school diploma\" or \"this person passed a background check\" — and it is <strong>digitally signed</strong> by the organization that issued it. Anyone who receives the credential can verify the digital signature instantly without contacting the issuer. The three players in this system are:<br><br><strong>Issuer:</strong> The trusted organization that creates and signs the credential (like your school).<br><strong>Holder:</strong> You — the person who stores and presents the credential.<br><strong>Verifier:</strong> The person or service that checks the credential is authentic.",
      },
      {
        heading: "The Three-Party Model",
        content:
          "The Issuer-Holder-Verifier model is the backbone of the Verifiable Credentials system, and it mirrors how trust works in the real world — just digitally and more efficiently.<br><br>The <strong>Issuer</strong> is an entity that others trust. A university issues degrees. A DMV issues driver's licenses. A hospital issues vaccination records. In the VC world, the issuer creates a credential, fills it with claims (\"Jane Doe graduated with a B.S. in Computer Science on June 2025\"), and signs it with their private key.<br><br>The <strong>Holder</strong> receives the credential and stores it in their <em>digital wallet</em>. This is crucial: the credential lives with YOU, not on the issuer's server. If the university's database gets hacked or the university shuts down, your credential is safe in your wallet. You choose when and with whom to share it.<br><br>The <strong>Verifier</strong> is anyone who needs to check the credential. An employer checking your degree, a bar checking your age, an airline checking your passport. The verifier does not need to contact the issuer. They just check the digital signature against the issuer's public key (which is in the issuer's DID Document). If the signature is valid, the credential is authentic. The whole process takes milliseconds and requires no phone calls, no faxes, no waiting for someone to respond to an email.",
      },
      {
        heading: "What Goes Inside a Verifiable Credential",
        content:
          "A Verifiable Credential is a structured data format — usually JSON — that contains several key pieces:<br><br><strong>@context:</strong> A reference to the VC standard, so software knows how to interpret the document.<br><strong>type:</strong> What kind of credential it is (e.g., \"UniversityDegreeCredential\" or \"AgeVerificationCredential\").<br><strong>issuer:</strong> The DID of the organization that created it.<br><strong>issuanceDate:</strong> When the credential was issued.<br><strong>expirationDate:</strong> When it expires (optional — some credentials, like a degree, might never expire, while a driver's license does).<br><strong>credentialSubject:</strong> The actual claims — the \"meat\" of the credential. This is where the data lives: your DID, plus whatever is being attested (your degree, your age verification, your test results).<br><strong>proof:</strong> The digital signature from the issuer, proving authenticity.<br><br>One of the most powerful features is that you can create a <strong>Verifiable Presentation</strong> — a package that selectively reveals only certain credentials or even certain <em>parts</em> of credentials. Need to prove you graduated from college but do not want to reveal your GPA? You can present just the graduation claim and nothing else. This selective disclosure is a game-changer for privacy.",
      },
      {
        heading: "Verifiable Credentials and OmnID",
        content:
          "In the OmnID ecosystem, Verifiable Credentials are the core mechanism for proving things about yourself. Here are some examples of how they could be used:<br><br><strong>Age Verification:</strong> Instead of uploading a photo of your ID to every website that asks, you get a VC from a trusted issuer that says \"over 13\" or \"over 18.\" You present this credential whenever needed, and the website never sees your birthdate, address, or photo.<br><br><strong>Education Records:</strong> Your school issues a VC for each course you complete. When you apply for a college or job, you present these credentials from your wallet. The verifier can instantly confirm they are real.<br><br><strong>Reputation:</strong> As you participate in communities, volunteer, or contribute to projects, organizations can issue reputation credentials. Over time, these build up in your wallet to create a rich, verifiable picture of who you are and what you have accomplished.<br><br>The beauty of this system is <strong>portability</strong>. Your credentials are not locked in any one platform. If you switch schools, change countries, or grow up and change careers, your credentials come with you. They are in your wallet, signed by the original issuers, and verifiable forever. No more lost transcripts, expired logins, or \"we do not have your records in our system.\" Your credentials belong to <em>you</em>.",
      },
    ],
    quiz: [
      {
        question:
          "Who are the three parties in the Verifiable Credentials model?",
        options: [
          "Buyer, Seller, and Bank",
          "Issuer, Holder, and Verifier",
          "Developer, User, and Admin",
          "Government, Company, and Individual",
        ],
        correctIndex: 1,
        explanation:
          "The three parties are the Issuer (creates and signs the credential), the Holder (stores and presents it), and the Verifier (checks its authenticity).",
      },
      {
        question:
          "What is a Verifiable Presentation?",
        options: [
          "A PowerPoint slideshow about blockchain",
          "A package that selectively reveals only certain credentials or parts of credentials",
          "A public announcement of your identity",
          "A video call where you show your ID to a camera",
        ],
        correctIndex: 1,
        explanation:
          "A Verifiable Presentation lets you selectively share only specific credentials or specific claims within credentials, enabling privacy by revealing only what is needed.",
      },
      {
        question:
          "Where are Verifiable Credentials stored?",
        options: [
          "On the issuing organization's server",
          "On a centralized government database",
          "In the holder's digital wallet",
          "On the Ethereum mainnet blockchain",
        ],
        correctIndex: 2,
        explanation:
          "Verifiable Credentials are stored in the holder's own digital wallet. The holder controls them and decides when and with whom to share them.",
      },
    ],
  },

  {
    id: 27,
    title: "Why Privacy Matters",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "Surveillance, data brokers, and your rights",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Glass House Thought Experiment",
        content:
          "Imagine you had to live in a house made entirely of glass. Everyone walking by can see what you eat for breakfast, what you watch on TV, what homework you are working on, and when you go to bed. You are not doing anything wrong, but you would feel <em>uncomfortable</em>, right? You would act differently. Maybe you would not dance in the living room or sing in the shower. This is called the <strong>chilling effect</strong> — when people change their behavior because they know they are being watched. Now consider this: you already live in a kind of glass house online. Your search history reveals what you are curious about. Your location data shows everywhere you go. Your messages show who you talk to and what you say. Your browsing habits reveal your interests, fears, health concerns, and political views. Companies collect this data every second of every day. Even if you think, \"I have nothing to hide,\" privacy is not about hiding bad behavior. Privacy is about having the <strong>freedom to be yourself</strong> without someone watching, judging, or profiting from your every move. It is a fundamental human right recognized by the United Nations.",
      },
      {
        heading: "The Data Broker Industry",
        content:
          "There is a multi-billion dollar industry that most people have never heard of: <strong>data brokers</strong>. These are companies that collect, buy, and sell personal information about you — often without your knowledge or explicit consent. Companies like Acxiom, Oracle Data Cloud, and LexisNexis gather data from hundreds of sources: public records, social media, shopping habits, app usage, location data, and more. They combine it into detailed profiles that can include your name, address, income estimate, health conditions, purchasing habits, political leaning, and even what they call \"life event triggers\" (like getting married, having a baby, or going through a divorce). These profiles are sold to advertisers, insurance companies, employers, landlords, and anyone willing to pay. A single person's data profile might sell for just a few cents to a few dollars, but multiply that by hundreds of millions of people and it becomes a massive industry — estimated at over <strong>$200 billion per year</strong>. The unsettling part? You have almost no control over this. Most data collection is buried in privacy policies that nobody reads (the average privacy policy is 4,000 words long). By using most apps and websites, you silently agree to let them collect and share your data.",
      },
      {
        heading: "Surveillance and Power",
        content:
          "Privacy is not just a personal preference — it is a matter of <strong>power</strong>. When someone has detailed information about you, they have power over you. Advertisers use your data to manipulate your purchasing decisions. Social media algorithms use your behavior to keep you scrolling (and seeing more ads). In some countries, governments use surveillance to monitor citizens, suppress free speech, and persecute minorities. China's social credit system tracks citizens' behavior and punishes those who step out of line — like restricting travel for people with low scores. Even in democracies, surveillance overreach is a real concern. Edward Snowden's 2013 revelations showed that the US government was collecting phone records and internet data on millions of ordinary citizens. For young people, the stakes are especially high. The data collected about you <em>now</em> — your interests at 12, the things you searched at 14, the opinions you posted at 16 — could follow you for the rest of your life. Future employers, colleges, or governments might judge you based on a digital footprint you created as a kid. This is why building privacy-preserving technology <em>today</em> is so urgent. The data being collected now cannot be un-collected later.",
      },
      {
        heading: "Privacy Laws and Blockchain Solutions",
        content:
          "Governments are starting to fight back with privacy laws. The European Union's <strong>GDPR</strong> (General Data Protection Regulation) gives citizens the right to access, correct, and delete their data. California's <strong>CCPA</strong> (California Consumer Privacy Act) gives similar rights to Californians. These laws have forced companies to add cookie consent banners, privacy settings, and data deletion tools. But laws alone are not enough. They are hard to enforce, vary from country to country, and companies find creative ways around them. Technology needs to change too, and that is where blockchain comes in. Decentralized identity and verifiable credentials can build privacy into the <em>architecture</em> of the internet — not as an afterthought or an opt-in setting, but as the default. <strong>Zero-knowledge proofs</strong> (which we cover in the next lesson) let you prove facts without revealing data. <strong>End-to-end encryption</strong> ensures only you and your intended recipient can read messages. <strong>Decentralized storage</strong> means no single company holds all your data. The goal is not to hide from the law or enable crime — it is to build a digital world where privacy is respected by design, where you share data by <em>choice</em> rather than by default, and where power over personal information belongs to the individual, not to corporations. This is the world OmnID is helping to build.",
      },
    ],
    quiz: [
      {
        question: "What is the 'chilling effect'?",
        options: [
          "When cold weather slows down internet speeds",
          "When people change their behavior because they know they are being watched",
          "When blockchain transactions freeze during high traffic",
          "When privacy laws are too strict for companies to operate",
        ],
        correctIndex: 1,
        explanation:
          "The chilling effect is when people self-censor or change their natural behavior because they know or suspect they are being observed — even if they are doing nothing wrong.",
      },
      {
        question: "What do data brokers do?",
        options: [
          "They protect your personal data from hackers",
          "They collect, buy, and sell personal information about people, often without their knowledge",
          "They help you manage your passwords",
          "They provide free internet access to underserved communities",
        ],
        correctIndex: 1,
        explanation:
          "Data brokers are companies that gather personal data from many sources, compile it into detailed profiles, and sell those profiles to advertisers, insurers, employers, and others.",
      },
      {
        question: "What does GDPR stand for?",
        options: [
          "Global Digital Privacy Registry",
          "General Data Protection Regulation",
          "Government Data Processing Rules",
          "General Decentralized Protocol Requirement",
        ],
        correctIndex: 1,
        explanation:
          "GDPR stands for General Data Protection Regulation — a European Union law that gives citizens rights over their personal data, including the right to access, correct, and delete it.",
      },
    ],
  },

  {
    id: 28,
    title: "Zero Knowledge Proofs",
    module: "Digital Identity & Privacy",
    moduleNumber: 5,
    subtitle: "Proving something without revealing it",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Magic Cave",
        content:
          "Here is a famous thought experiment from cryptography, simplified for us. Imagine a cave shaped like a ring, with one entrance that splits into two paths — left and right — that meet at a locked door deep inside. Only someone who knows the secret password can open that door. Your friend claims to know the password. How can they prove it without telling you what the password is? Here is the trick: your friend goes into the cave while you wait outside. You do not see which path they take. Then you shout \"Come out the left side!\" or \"Come out the right side!\" If your friend <em>does</em> know the password, they can always come out whichever side you ask — if they took the wrong path, they just open the door and walk through. If they do <em>not</em> know the password, they have only a 50% chance of coming out the correct side. After repeating this 20 times, and your friend succeeds every time, you become extremely confident they know the password — even though they <strong>never told you what it is</strong>. This is the essence of a <strong>Zero Knowledge Proof (ZKP)</strong>: proving you know something without revealing the thing itself.",
      },
      {
        heading: "How ZKPs Work (Simplified)",
        content:
          "In the digital world, Zero Knowledge Proofs use advanced mathematics (think really hard algebra and number theory) to achieve the same result as the cave trick. A ZKP has three properties:<br><br><strong>Completeness:</strong> If you are telling the truth, the proof will always work. An honest prover can always convince the verifier.<br><strong>Soundness:</strong> If you are lying, you almost certainly cannot produce a valid proof. A dishonest prover has virtually zero chance of fooling the verifier.<br><strong>Zero Knowledge:</strong> The verifier learns absolutely nothing beyond the fact that the statement is true. They gain no additional information.<br><br>There are two main types of ZKPs used in blockchain today. <strong>zk-SNARKs</strong> (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) produce tiny proofs that are very fast to verify. They are used by projects like Zcash for private transactions and by Layer 2 networks like zkSync. <strong>zk-STARKs</strong> (the 'T' stands for Transparent) are newer, do not require a trusted setup, and are resistant to quantum computers, but produce larger proofs. StarkNet uses these. Both types let you prove computational statements — like \"I know a secret that produces this hash\" or \"These transactions are all valid\" — without revealing the underlying data.",
      },
      {
        heading: "ZKPs for Identity and Privacy",
        content:
          "Zero Knowledge Proofs are the <em>perfect</em> technology for identity verification. Think about how many times you over-share personal information:<br><br>Buying something age-restricted? You show your entire ID with your name, address, and exact birthdate — when all the store needs to know is \"over 18.\"<br><br>Applying for an apartment? You hand over tax returns, bank statements, and employment letters — when all the landlord needs to know is \"income above $3,000/month.\"<br><br>With ZKPs, you can prove each of these facts without revealing any extra information. Here is how it would work for age verification:<br><br>1. A trusted authority (like the DMV) issues you a verifiable credential containing your birthdate.<br>2. When a website asks \"Are you over 18?\", your wallet generates a zero-knowledge proof that says: \"I have a valid credential from the DMV, and the birthdate in it confirms I am over 18.\"<br>3. The website verifies the proof and lets you in — without ever seeing your birthdate, name, or any other personal detail.<br><br>This is not theoretical — it is happening now. Companies like Polygon ID and Worldcoin use ZKPs for identity verification. OmnID uses this same principle for age verification and reputation proofs.",
      },
      {
        heading: "ZK Rollups: Scaling Blockchain with Zero Knowledge",
        content:
          "Zero Knowledge Proofs are not just useful for privacy — they are also revolutionizing how blockchains <strong>scale</strong>. Remember how Ethereum can be slow and expensive because every node has to verify every transaction? <strong>ZK Rollups</strong> bundle hundreds or thousands of transactions together, execute them off the main chain, and then produce a single zero-knowledge proof that all the transactions are valid. This proof gets posted to Ethereum mainnet. The result is dramatic: instead of Ethereum processing 15 transactions per second, ZK Rollups can handle <strong>thousands</strong> of transactions per second while inheriting Ethereum's security. The proofs are tiny and cheap to verify on-chain, even though they represent vast amounts of computation off-chain. Projects building ZK Rollups include <strong>zkSync</strong> (by Matter Labs), <strong>StarkNet</strong> (by StarkWare), <strong>Polygon zkEVM</strong>, and <strong>Scroll</strong>. These are not future technology — they are live today, processing millions of transactions. The combination of ZKPs for privacy (proving identity claims without revealing data) and ZKPs for scaling (making blockchain fast and cheap) makes zero-knowledge technology one of the most important innovations in the entire blockchain ecosystem. It is the technology that could make blockchain practical for billions of people — fast enough, cheap enough, and private enough for everyday use.",
      },
    ],
    quiz: [
      {
        question:
          "What are the three properties of a Zero Knowledge Proof?",
        options: [
          "Speed, Security, and Simplicity",
          "Completeness, Soundness, and Zero Knowledge",
          "Encryption, Decryption, and Verification",
          "Public, Private, and Shared",
        ],
        correctIndex: 1,
        explanation:
          "A ZKP must be Complete (truthful proofs always work), Sound (false proofs almost certainly fail), and Zero Knowledge (the verifier learns nothing beyond the truth of the statement).",
      },
      {
        question:
          "How do ZK Rollups help blockchain scale?",
        options: [
          "They make each computer in the network faster",
          "They delete old transactions to make room for new ones",
          "They bundle many transactions off-chain and post a single proof of validity on-chain",
          "They remove the need for consensus entirely",
        ],
        correctIndex: 2,
        explanation:
          "ZK Rollups execute hundreds or thousands of transactions off the main chain, then produce a single compact zero-knowledge proof of validity that gets posted to Ethereum, dramatically increasing throughput.",
      },
      {
        question:
          "In the age verification example, what does the website learn when you use a ZKP?",
        options: [
          "Your exact birthdate",
          "Your name and address",
          "Only that you are over 18 — nothing else",
          "The contents of your entire credential",
        ],
        correctIndex: 2,
        explanation:
          "With a Zero Knowledge Proof, the website learns only that you are over 18 — it never sees your birthdate, name, address, or any other personal information from your credential.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 6: OmnID Deep Dive (29-30)
  // ─────────────────────────────────────────────
  {
    id: 29,
    title: "How OmnID Works",
    module: "OmnID Deep Dive",
    moduleNumber: 6,
    subtitle: "Full protocol walkthrough with live demo",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The OmnID Vision",
        content:
          "Over the past 28 lessons, you have learned about blockchains, wallets, smart contracts, tokens, decentralized identity, verifiable credentials, and zero-knowledge proofs. Now it is time to see how all of these pieces come together in <strong>OmnID</strong> — a real protocol for decentralized identity on the blockchain. OmnID's mission is simple but powerful: let people <strong>prove things about themselves without giving away their personal data</strong>. Want to prove you are old enough to sign up for a platform? Done — without revealing your birthdate. Want to show you have a good reputation in a community? Done — without exposing every detail of your history. Want to verify you hold a real credential from a real institution? Done — without the verifier ever contacting the institution. The protocol achieves this through four main smart contracts that work together like instruments in an orchestra. Each one has a specific job, and together they create a complete identity verification system. Let's walk through each contract and understand what it does, how it connects to the others, and why it matters.",
      },
      {
        heading: "IdentityRegistry and CredentialRegistry",
        content:
          "The <strong>IdentityRegistry</strong> contract is the foundation of the whole system. Think of it as the \"phone book\" of OmnID — but instead of listing names and phone numbers, it maps Ethereum addresses to <em>decentralized identifiers (DIDs)</em>. When you register with OmnID, the IdentityRegistry records that your wallet address is associated with your DID. It also stores metadata like when you registered and whether your identity is currently active. This contract enforces rules: each address can only have one identity, and only you (or a designated recovery address) can modify your entry. It is your anchor in the OmnID ecosystem.<br><br>The <strong>CredentialRegistry</strong> contract manages the lifecycle of verifiable credentials. When a trusted issuer (like a school, government agency, or verification service) wants to issue a credential, they register it through this contract. The CredentialRegistry stores the credential's hash (a fingerprint that proves it has not been tampered with), the issuer's DID, the subject's DID, the credential type, and its expiration date. Crucially, it does <em>not</em> store the credential's actual content — that stays in your wallet. The registry just records that a credential was issued and provides a way for anyone to verify it is legitimate. Issuers can also <em>revoke</em> credentials through this contract if needed (for example, if a certification expires or a credential was issued by mistake).",
      },
      {
        heading: "AgeVerifier: ZKPs in Action",
        content:
          "The <strong>AgeVerifier</strong> contract is where zero-knowledge proofs come to life in OmnID. This is the contract that lets you prove you are over a certain age <em>without</em> revealing your actual birthdate. Here is the flow:<br><br>1. You have a verifiable credential in your wallet that contains your birthdate, issued by a trusted source (like a government ID service).<br>2. When a website or app requires age verification, your OmnID wallet generates a <strong>zero-knowledge proof</strong> that says: \"The birthdate in my credential proves I am over [required age], and the credential was issued by [trusted issuer].\"<br>3. This proof is submitted to the AgeVerifier contract on-chain.<br>4. The AgeVerifier verifies the ZKP mathematically. If the proof is valid, it records that your DID has been age-verified for that threshold (e.g., \"over 13\" or \"over 18\").<br>5. Any app can then check the AgeVerifier: \"Has this DID been verified as over 18?\" The answer is yes or no — no personal data involved.<br><br>The actual birthdate never touches the blockchain. The ZKP proves the mathematical fact without revealing the underlying data. This is a dramatic improvement over today's system where every website gets a copy of your full ID.",
      },
      {
        heading: "ReputationAggregator: Your On-Chain Resume",
        content:
          "The <strong>ReputationAggregator</strong> contract ties everything together by computing and storing reputation scores based on your credentials, activity, and history within the OmnID ecosystem. Think of it as an on-chain resume that gets automatically updated as you earn new credentials and participate in communities.<br><br>The ReputationAggregator pulls data from the CredentialRegistry and other sources to calculate a composite reputation score. Different credentials carry different weights — a university degree might contribute more to your \"education\" reputation than a short online course. Active community participation might boost your \"community\" reputation. Completing identity verification through the AgeVerifier adds to your \"trust\" reputation.<br><br>Importantly, the reputation score is <strong>public</strong> (anyone can check it), but the underlying credentials are <strong>private</strong> (only you can see the details). A potential employer or community moderator can see that your trust score is high without knowing <em>why</em> it is high. If they need more detail, they can request specific credentials from you — and you choose whether to share them.<br><br>This system creates a portable, verifiable, privacy-preserving reputation that follows you across the internet. No more starting from zero every time you join a new platform. Your OmnID reputation is <em>yours</em>, backed by real credentials, and cryptographically verifiable by anyone.",
      },
      {
        heading: "Putting It All Together",
        content:
          "Let's trace a complete user journey through OmnID to see all four contracts in action:<br><br><strong>Step 1 — Registration:</strong> You create an Ethereum wallet and register your DID through the <strong>IdentityRegistry</strong>. Your on-chain identity is born.<br><br><strong>Step 2 — Credential Issuance:</strong> Your school issues a verifiable credential proving your enrollment. The credential hash is recorded in the <strong>CredentialRegistry</strong>, while the actual credential goes into your wallet.<br><br><strong>Step 3 — Age Verification:</strong> A social media platform requires age verification. Your wallet generates a ZKP, and the <strong>AgeVerifier</strong> confirms you meet the age threshold without revealing your birthdate.<br><br><strong>Step 4 — Reputation Building:</strong> As you earn more credentials and pass verifications, the <strong>ReputationAggregator</strong> updates your reputation score. New platforms you join can instantly see you are a trustworthy, verified individual.<br><br>Every step preserves your privacy, puts you in control of your data, and works without any central authority. That is the power of combining blockchain, smart contracts, verifiable credentials, and zero-knowledge proofs. It is not just theory — it is real code running on a real blockchain, solving a real problem.",
      },
    ],
    quiz: [
      {
        question:
          "What does the IdentityRegistry contract do?",
        options: [
          "Stores users' passwords and personal data",
          "Maps Ethereum addresses to decentralized identifiers (DIDs)",
          "Processes cryptocurrency payments",
          "Creates new Ethereum wallets for users",
        ],
        correctIndex: 1,
        explanation:
          "The IdentityRegistry is the foundation of OmnID, mapping Ethereum wallet addresses to decentralized identifiers (DIDs) and managing identity lifecycle.",
      },
      {
        question:
          "How does the AgeVerifier contract work without seeing your birthdate?",
        options: [
          "It guesses your age based on your wallet activity",
          "It asks a government database to confirm your age",
          "It verifies a zero-knowledge proof that mathematically confirms age without revealing the actual birthdate",
          "It requires you to upload a photo of your ID",
        ],
        correctIndex: 2,
        explanation:
          "The AgeVerifier uses zero-knowledge proofs to mathematically verify that a credential confirms the user meets an age threshold, without the contract ever seeing the actual birthdate.",
      },
      {
        question:
          "What is the ReputationAggregator's role in the OmnID protocol?",
        options: [
          "It replaces the need for credentials entirely",
          "It computes reputation scores from credentials and activity while keeping credential details private",
          "It stores all user data in a centralized database",
          "It processes token transfers between users",
        ],
        correctIndex: 1,
        explanation:
          "The ReputationAggregator calculates composite reputation scores from credentials and on-chain activity. The score is public, but the underlying credential details remain private — only the holder can reveal them.",
      },
    ],
  },

  {
    id: 30,
    title: "Building the Future",
    module: "OmnID Deep Dive",
    moduleNumber: 6,
    subtitle: "Your roadmap, next steps, and the grant pitch",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Look How Far You Have Come",
        content:
          "Take a moment to appreciate what you have accomplished. Thirty lessons ago, words like \"blockchain,\" \"smart contract,\" and \"zero-knowledge proof\" might have sounded like science fiction. Now you can explain how blocks are chained together with cryptographic hashes, how miners and validators secure the network, how Solidity functions handle state changes, how ERC-20 and ERC-721 tokens work, why data breaches happen and how decentralized identity prevents them, and how zero-knowledge proofs let you prove facts without revealing secrets. You understand a technology that most adults — including many professionals in tech and finance — do not fully grasp. That is not a small thing. The blockchain and Web3 space is one of the fastest-growing fields in technology, and the knowledge you now have puts you <strong>years ahead</strong> of your peers. Whether you become a developer, an entrepreneur, a policy maker, or something entirely different, understanding how trust, identity, and value work on the internet will be one of the most valuable skills of the 21st century. You are not just learning about the future — you are preparing to <em>build it</em>.",
      },
      {
        heading: "Your Learning Roadmap: Where to Go Next",
        content:
          "This course was the foundation. Here is a roadmap for continuing your journey, organized by interest:<br><br><strong>If you want to code smart contracts:</strong><br>Start with <em>CryptoZombies</em> (cryptozombies.io) — a free, interactive tutorial that teaches Solidity through a game where you build zombie characters. Then move to <em>Speedrun Ethereum</em> (speedrunethereum.com) for project-based learning with Scaffold-ETH. Practice on testnets and join hackathons (many are free and beginner-friendly).<br><br><strong>If you want to understand DeFi deeper:</strong><br>Read the Uniswap and Aave whitepapers (they are surprisingly readable). Try using DeFi protocols on testnets. Follow DeFi Llama (defillama.com) to track the ecosystem.<br><br><strong>If you are passionate about digital identity:</strong><br>Explore the W3C DID and Verifiable Credentials specifications. Look into Polygon ID, Ceramic Network, and Spruce for hands-on tools. The Decentralized Identity Foundation (identity.foundation) has excellent resources.<br><br><strong>If you want to explore zero-knowledge proofs:</strong><br>Start with the <em>ZK Book</em> by RareSkills. Play with Circom (a language for writing ZK circuits). Try Noir by Aztec for a more modern approach.<br><br>No matter which path you choose, the most important thing is to <strong>build things</strong>. Reading is great, but there is no substitute for writing code, deploying contracts, and breaking things on testnets.",
      },
      {
        heading: "The OmnID Grant Pitch",
        content:
          "Everything you have learned in this course connects to a bigger vision: making OmnID a reality. Here is the grant pitch — the case for why OmnID deserves funding and support:<br><br><strong>The Problem:</strong> Over 850 million people lack official identification. Even those with IDs face constant data breaches, privacy violations, and identity theft. The current system of centralized databases and password-based authentication is fundamentally broken.<br><br><strong>The Solution:</strong> OmnID is a decentralized identity protocol built on Ethereum that lets individuals own, control, and selectively share their identity credentials using zero-knowledge proofs. No centralized data storage. No passwords. No over-sharing of personal information.<br><br><strong>The Technology:</strong> Four smart contracts — IdentityRegistry, CredentialRegistry, AgeVerifier, and ReputationAggregator — work together to provide registration, credential management, privacy-preserving verification, and portable reputation. All built on open standards (W3C DIDs and Verifiable Credentials) and auditable code.<br><br><strong>The Impact:</strong> OmnID can enable age verification without exposing personal data, portable academic and professional credentials, privacy-preserving reputation systems, and identity access for the unbanked and undocumented. This is not just a technology project — it is a step toward a more equitable, private, and user-controlled internet.",
      },
      {
        heading: "The Web3 Generation",
        content:
          "Here is something that might surprise you: the biggest innovations in technology often come from <strong>young people</strong>. Vitalik Buterin published the Ethereum whitepaper when he was 19. Mark Zuckerberg built Facebook at 19. Steve Jobs started Apple at 21. The pattern is clear — young people who understand new technology early have a massive advantage. You are 12, and you already understand concepts that many professional developers are only now learning. The blockchain space is full of opportunity precisely <em>because</em> it is so new. The identity solutions being built today will become the foundation of the internet for the next 50 years. The DeFi protocols being developed will reshape global finance. The privacy tools being created will determine whether the future is one of surveillance or self-sovereignty. And the people who understand these technologies deeply — who can build them, improve them, and advocate for them — will have an outsized impact on how it all turns out. That could be you. You do not have to have all the answers today. You do not have to build the next big protocol tomorrow. But by continuing to learn, experiment, and ask questions, you are putting yourself on a path that very few people your age are on. The future of the internet is being written right now, in smart contracts and cryptographic proofs. You now have the knowledge to read it, understand it, and — when you are ready — to help write the next chapter. <strong>Welcome to Web3. The future is yours to build.</strong>",
      },
    ],
    quiz: [
      {
        question:
          "What is the best way to continue learning after this course?",
        options: [
          "Only read whitepapers and never write code",
          "Wait until you are older to start building",
          "Build things — write code, deploy contracts, and experiment on testnets",
          "Memorize all the ERC standards by number",
        ],
        correctIndex: 2,
        explanation:
          "The most effective way to learn is by building. Reading is important, but there is no substitute for hands-on experience — writing code, deploying to testnets, and learning from mistakes.",
      },
      {
        question:
          "What are the four main smart contracts in the OmnID protocol?",
        options: [
          "TokenFactory, ExchangeRouter, GovernanceVault, StakingPool",
          "IdentityRegistry, CredentialRegistry, AgeVerifier, ReputationAggregator",
          "UserManager, DataStore, ProofEngine, ScoreKeeper",
          "WalletProxy, BridgeRelay, OracleNode, ConsensusModule",
        ],
        correctIndex: 1,
        explanation:
          "OmnID's four core contracts are IdentityRegistry (maps addresses to DIDs), CredentialRegistry (manages credential lifecycle), AgeVerifier (ZKP-based age checks), and ReputationAggregator (computes reputation scores).",
      },
      {
        question:
          "Why is learning about blockchain and Web3 especially valuable for young people?",
        options: [
          "Because blockchain will replace the entire internet next year",
          "Because young people who understand new technology early can help shape its future",
          "Because you need blockchain knowledge to use the internet",
          "Because all future jobs will require cryptocurrency",
        ],
        correctIndex: 1,
        explanation:
          "The blockchain space is new and rapidly evolving. Young people who understand it early are positioned to shape how identity, finance, and privacy work on the internet for decades to come.",
      },
    ],
  },
];
