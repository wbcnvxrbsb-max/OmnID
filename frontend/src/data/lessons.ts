export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  heading: string;
  content: string; // Can include simple HTML: <strong>, <em>, <code>
}

export interface Lesson {
  id: number;
  title: string;
  module: string;
  moduleNumber: number;
  subtitle: string;
  estimatedMinutes: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export const lessonsPartOne: Lesson[] = [
  // ─── LESSON 1 ───────────────────────────────────────────────
  {
    id: 1,
    title: "What is Blockchain?",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "A Google Doc everyone can read but nobody can erase",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Imagine a Shared Notebook",
        content:
          "Imagine you and every student in your school share a giant Google Doc. Every time something important happens \u2014 someone trades a Pok\u00e9mon card, someone borrows a dollar for lunch, or the class votes on a pizza topping \u2014 it gets written down in this document. Here is the cool part: <strong>everyone can see every entry</strong>, but absolutely nobody can go back and erase or change what was already written. Not you, not the teacher, not even the principal. That is basically what a blockchain is. It is a <em>shared digital record</em> that is copied across thousands of computers all over the world. Every computer keeps an identical copy, and they all work together to make sure nobody sneaks in and changes the history. Think about why this is powerful: if you keep a diary under your bed, someone could sneak in and rip out a page. But if a thousand people all have identical copies of your diary, ripping out one page would not fool anyone \u2014 the other 999 copies still have the original. That is the superpower of blockchain: <strong>trust through transparency</strong>. Nobody has to trust a single person or company, because everybody can verify the truth for themselves.",
      },
      {
        heading: "What Makes It a \"Chain\" of \"Blocks\"?",
        content:
          "So why the funny name? A blockchain is literally a <em>chain of blocks</em>. Each <strong>block</strong> is like one page in that shared notebook. It holds a batch of records \u2014 maybe a few hundred transactions \u2014 plus a timestamp and a special code that links it to the previous page. Once a page (block) is full, a brand-new page is started and chained to the old one. That chain goes all the way back to the very first block ever created, which people call the <strong>genesis block</strong>. Because every block contains a reference to the block before it, changing one old block would break the chain \u2014 like removing a link from a metal chain makes the whole thing fall apart. This is why blockchain data is called <em>immutable</em>, which is just a fancy word meaning it cannot be changed after the fact. Picture a line of dominoes where each domino is glued to the next one. You cannot pull one out of the middle without everyone noticing. That is the chain part of blockchain. The chain structure is what gives the technology its incredible security and reliability.",
      },
      {
        heading: "Why Should You Care?",
        content:
          "You might be thinking, \"Okay, cool, a fancy shared notebook. Why does this matter to me?\" Great question. Blockchain is the technology behind <strong>cryptocurrency</strong> like Bitcoin, but it can do way more than just money. People are using blockchains to prove who owns digital artwork, to make voting more transparent, to track where your food came from, and even to build entire apps that no single company controls. Imagine a world where you do not need to trust a big company to keep your data safe because the math and the network do that job for you. That is what blockchain is building toward. Over the next few lessons, you will learn exactly how the pieces fit together \u2014 how blocks are locked with secret codes, how computers agree on the truth, and why nobody is in charge. By the end of this module, you will understand blockchain well enough to explain it to your friends and family. Ready? Let us dive in.",
      },
      {
        heading: "Key Vocabulary",
        content:
          "Before we move on, let us lock in a few key words you will see again and again. <strong>Blockchain</strong>: a shared digital ledger (record book) that is stored on many computers and cannot be altered once written. <strong>Block</strong>: a single batch of recorded data, like one page in the notebook. <strong>Genesis block</strong>: the very first block in any blockchain \u2014 block number zero. <strong>Immutable</strong>: unable to be changed after it has been recorded. <strong>Ledger</strong>: just a formal word for a record book that tracks transactions. <strong>Node</strong>: one of the many computers that stores a copy of the blockchain and helps keep it running. You do not need to memorize all of these right now. Think of this list as a mini-dictionary you can come back to whenever you see an unfamiliar term. As we go through the course, each lesson will introduce a handful of new words, and by the end you will have an impressive Web3 vocabulary.",
      },
    ],
    quiz: [
      {
        question: "What is a blockchain most similar to?",
        options: [
          "A private diary only you can read",
          "A shared Google Doc that nobody can erase",
          "A text message that disappears after reading",
          "A single computer storing a secret file",
        ],
        correctIndex: 1,
        explanation:
          "A blockchain is like a shared document that everyone can see and verify, but nobody can go back and change what has already been written.",
      },
      {
        question: "What is the very first block in a blockchain called?",
        options: [
          "The origin block",
          "Block zero",
          "The genesis block",
          "The starter block",
        ],
        correctIndex: 2,
        explanation:
          "The first block ever created in a blockchain is called the genesis block. It is the starting point of the entire chain.",
      },
      {
        question: "What does \"immutable\" mean?",
        options: [
          "Very fast",
          "Invisible to others",
          "Cannot be changed once recorded",
          "Only readable by one person",
        ],
        correctIndex: 2,
        explanation:
          "Immutable means something cannot be changed or altered after it has been created. Blockchain data is immutable.",
      },
    ],
  },

  // ─── LESSON 2 ───────────────────────────────────────────────
  {
    id: 2,
    title: "How Do Blocks Work?",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "Hashing, linking, and why you can't cheat",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "What Is Inside a Block?",
        content:
          "Think of a block as a shipping box at a warehouse. Before the box is sealed and sent, workers stuff it with a packing list, the actual items, and a tracking sticker. A blockchain block is similar. Inside every block you will find three main things. First, the <strong>transaction data</strong> \u2014 the actual records, like \"Alice sent 2 coins to Bob.\" A single block can hold hundreds or even thousands of these transactions. Second, a <strong>timestamp</strong> that records exactly when the block was created, just like the date printed on a shipping label. Third, and most important, a unique digital fingerprint called a <strong>hash</strong>. We will explain hashing in the next section, but for now just know that this fingerprint is what makes every block one of a kind. The block also stores the hash of the <em>previous</em> block, which is what links them together into a chain. If you change even one tiny detail inside a block \u2014 like switching \"2 coins\" to \"200 coins\" \u2014 the hash completely changes, and the chain breaks. That is how the network instantly spots cheaters.",
      },
      {
        heading: "Hashing: The Magic Fingerprint Machine",
        content:
          "Imagine you have a magic blender. You throw in any amount of text \u2014 a single word or an entire book \u2014 press the button, and out comes a smoothie that is always exactly the same size. If you put in the exact same ingredients again, you get the <em>exact same smoothie</em>. But change even one letter and the smoothie looks completely different. That magic blender is a <strong>hash function</strong>. In blockchains, the most common one is called <strong>SHA-256</strong> (Secure Hash Algorithm, 256-bit). It takes any input and produces a fixed-length string of 64 characters that looks like random gibberish, for example: <code>a3f2b8c1...</code>. Here is what makes hashing so useful: you cannot reverse it. You cannot take the smoothie and figure out the original ingredients. You can only go one direction \u2014 input to hash. This means nobody can look at a hash and work backward to tamper with the data. The only way to check is to run the same data through the hash function and see if the outputs match. It is like a tamper-proof seal on a bottle \u2014 once it is set, you can tell immediately if someone messed with it.",
      },
      {
        heading: "How Blocks Link Together",
        content:
          "Now here is where it gets really clever. Every block stores two hashes: <strong>its own hash</strong> and the <strong>hash of the block that came right before it</strong>. This is the link in the chain. Imagine a conga line at a dance. Each person holds on to the person in front of them. If someone in the middle disappears, the line breaks and everyone notices. Blocks work the same way. Block 5 contains the hash of Block 4. Block 4 contains the hash of Block 3. And so on, all the way back to the genesis block. If a hacker tried to change a transaction inside Block 3, that block's hash would change. But Block 4 still has the <em>old</em> hash of Block 3 recorded inside it, so now they do not match. The network sees the mismatch and rejects the fake version. To actually cheat, the hacker would have to recalculate the hashes of Block 3, <em>and</em> Block 4, <em>and</em> Block 5, and every single block after that \u2014 all before the rest of the network adds a new block. On a big blockchain like Bitcoin, that is practically impossible.",
      },
      {
        heading: "Why You Cannot Cheat the Chain",
        content:
          "Let us put it all together with a quick scenario. Say someone named Mallory wants to cheat by changing an old transaction to give herself extra coins. She would need to: 1) change the data in the old block, 2) recalculate that block's hash, 3) recalculate every following block's hash because each one depends on the previous, and 4) do all of that faster than thousands of other computers that are constantly adding new blocks. It is like trying to rewrite every copy of a textbook in every library in the world at the same time, before anyone prints a new edition. <strong>Mathematically and practically, it just cannot be done.</strong> This property is what makes blockchain so trustworthy. You do not have to trust any individual person \u2014 you trust the math. The combination of hashing and linking makes the whole system incredibly secure. Even the most powerful supercomputers in the world cannot fake a blockchain that has been running for years. That is a level of security that no company, no bank, and no government filing cabinet has ever been able to offer on its own.",
      },
    ],
    quiz: [
      {
        question: "What is a hash?",
        options: [
          "A type of cryptocurrency",
          "A unique digital fingerprint created from input data",
          "A secret password to unlock a block",
          "A fee you pay to use the blockchain",
        ],
        correctIndex: 1,
        explanation:
          "A hash is a unique digital fingerprint generated by running data through a hash function. It always produces the same output for the same input.",
      },
      {
        question:
          "What happens if someone changes the data inside an old block?",
        options: [
          "Nothing, the blockchain automatically accepts changes",
          "Only that one block is affected",
          "The block's hash changes and breaks the chain",
          "The blockchain shuts down completely",
        ],
        correctIndex: 2,
        explanation:
          "Changing data in a block changes its hash, which breaks the link to the next block. The network detects the mismatch and rejects the tampered version.",
      },
      {
        question: "Each block stores the hash of which other block?",
        options: [
          "The next block in the chain",
          "The previous block in the chain",
          "A random block in the chain",
          "The genesis block only",
        ],
        correctIndex: 1,
        explanation:
          "Each block stores the hash of the block that came immediately before it. This is what creates the chain and makes the data tamper-proof.",
      },
    ],
  },

  // ─── LESSON 3 ───────────────────────────────────────────────
  {
    id: 3,
    title: "Mining & Consensus",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "How millions of computers agree on the truth",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Problem: Who Gets to Add the Next Block?",
        content:
          "Imagine your whole class wants to decide what game to play at recess. If one bossy kid just picks the game every time, that is not really fair. But if everyone shouts their answer at once, it is chaos. You need a system \u2014 maybe you vote, or maybe you take turns. Blockchains face the exact same problem. Thousands of computers all over the world want to add the next block of transactions. But only <strong>one</strong> block can be added at a time, and everyone has to agree that it is valid. The process for reaching that agreement is called <strong>consensus</strong>. Without consensus, different computers might have different versions of the truth, and the whole system falls apart. There are several ways to reach consensus, but the most famous one \u2014 the one Bitcoin uses \u2014 is called <strong>Proof of Work</strong>. It turns adding a block into a competition, kind of like a massive math race. The winner gets to add the next block and earns a reward. Let us see how that race works.",
      },
      {
        heading: "Proof of Work: The Mining Race",
        content:
          "Here is how the race works. Every computer (called a <strong>miner</strong>) grabs a bunch of unconfirmed transactions floating around the network, bundles them into a candidate block, and then starts guessing. Specifically, each miner tries to find a special number called a <strong>nonce</strong> (number used once) that, when combined with the block data and run through the hash function, produces a hash that starts with a certain number of zeros. It is like a lock where you have to try millions of combinations until you find the one that clicks. The first miner to find a valid nonce shouts, \"I got it!\" and broadcasts the solution to the entire network. Other miners quickly check the answer \u2014 checking is easy, even though finding it was hard. If the answer checks out, the network accepts the new block, the winning miner receives a <strong>block reward</strong> (brand-new cryptocurrency), and everyone moves on to the next round. This competition happens roughly every 10 minutes on Bitcoin. The difficulty adjusts automatically so that no matter how many miners join, it still takes about 10 minutes.",
      },
      {
        heading: "Other Ways to Agree: Proof of Stake",
        content:
          "Proof of Work is powerful, but it uses a <em>lot</em> of electricity because all those computers are running at full speed trying to guess the nonce. That is why many newer blockchains use a different method called <strong>Proof of Stake</strong>. Instead of a math race, Proof of Stake works more like a raffle. Participants lock up (\"stake\") some of their own cryptocurrency as a deposit. The more you stake, the more raffle tickets you get. The network randomly picks a winner to create the next block. If the winner tries to cheat \u2014 like including fake transactions \u2014 they lose their staked coins. That risk of losing money keeps everyone honest. Ethereum, the second-biggest blockchain, switched from Proof of Work to Proof of Stake in 2022 in an upgrade called <strong>The Merge</strong>. This cut its energy use by over 99 percent. Both systems accomplish the same goal \u2014 getting the network to agree on one version of the truth \u2014 but they do it in very different ways. Proof of Work relies on computing power; Proof of Stake relies on financial incentive.",
      },
      {
        heading: "Why Consensus Matters",
        content:
          "So why go through all this trouble? Because <strong>consensus is the heart of blockchain security</strong>. Without it, anyone could add fake blocks and steal coins. Consensus makes sure that every single computer on the network is on the same page \u2014 literally. It answers three critical questions: Which transactions are valid? In what order did they happen? And which version of the ledger is the real one? Think of it like the official scoreboard at a basketball game. Thousands of fans might be keeping their own tallies, but if there is a disagreement, the official scoreboard is what counts. In blockchain, the consensus mechanism <em>is</em> the official scoreboard, and it is maintained by the entire network instead of a single referee. This is what allows people who have never met and may not trust each other to exchange value \u2014 money, contracts, property records \u2014 without any middleman. The consensus mechanism replaces the need for a bank, a lawyer, or any central authority. It is one of the most important inventions in computer science in the last 20 years.",
      },
    ],
    quiz: [
      {
        question: "What is 'consensus' in blockchain?",
        options: [
          "A type of cryptocurrency",
          "The process by which the network agrees on valid data",
          "A tool used to mine Bitcoin",
          "A way to create a new wallet",
        ],
        correctIndex: 1,
        explanation:
          "Consensus is the process by which all the computers in the network agree on which transactions are valid and in what order they happened.",
      },
      {
        question: "In Proof of Work, what does a miner try to find?",
        options: [
          "A secret password hidden in a block",
          "The private key of another user",
          "A nonce that produces a hash with certain properties",
          "The location of the genesis block",
        ],
        correctIndex: 2,
        explanation:
          "Miners try to find a nonce (a special number) that, when hashed with the block data, produces a hash starting with the required number of zeros.",
      },
      {
        question: "How does Proof of Stake differ from Proof of Work?",
        options: [
          "It uses a math race to select block creators",
          "Participants lock up cryptocurrency instead of solving puzzles",
          "It does not require any computers",
          "It only works on Bitcoin",
        ],
        correctIndex: 1,
        explanation:
          "In Proof of Stake, participants lock up their own cryptocurrency as collateral rather than competing in an energy-intensive math race.",
      },
    ],
  },

  // ─── LESSON 4 ───────────────────────────────────────────────
  {
    id: 4,
    title: "Decentralization",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "Why no single person is in charge",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Centralized vs Decentralized: A Pizza Analogy",
        content:
          "Imagine there is only <em>one</em> pizza shop in your entire city. If that shop closes, nobody gets pizza. If the owner decides to double the prices, you have no choice but to pay up or go without. That is a <strong>centralized</strong> system \u2014 one person or company controls everything. Now imagine there are hundreds of pizza shops, and they all share the same recipe. If one closes, no big deal \u2014 the others keep serving pizza. No single owner can jack up prices because you will just go next door. <strong>That is decentralization.</strong> In the digital world, most services you use today are centralized. Instagram is run by Meta. YouTube is run by Google. Your bank is run by one company. If their servers go down, the service is gone. If they change the rules, you have to accept it. Blockchain flips this model. Instead of one company running the show, <strong>thousands of independent computers</strong> (nodes) all over the world share the job. No single company, government, or person is in charge. The network runs itself according to rules built into the software.",
      },
      {
        heading: "Why Decentralization Is Powerful",
        content:
          "Decentralization gives you three superpowers. The first is <strong>resilience</strong>. Because the blockchain is copied across thousands of nodes, there is no single point of failure. Even if a huge chunk of nodes went offline \u2014 say, if an entire country lost power \u2014 the blockchain would keep running on the remaining nodes. Try doing that with a regular website. The second superpower is <strong>censorship resistance</strong>. In a centralized system, the person in charge can delete your account, freeze your money, or change the rules whenever they want. On a decentralized blockchain, no single authority can do that. Your transactions are validated by the network, not by a company. The third superpower is <strong>transparency</strong>. On a public blockchain, anyone can look up any transaction ever made. You can verify things for yourself instead of trusting a company's word. Think about that: a financial system where you can actually check the math yourself. These three properties \u2014 resilience, censorship resistance, and transparency \u2014 are the main reasons people get excited about decentralization.",
      },
      {
        heading: "Nodes: The Backbone of the Network",
        content:
          "We keep mentioning <strong>nodes</strong>, so let us make sure you understand what they are. A node is simply a computer that stores a copy of the blockchain and follows the network rules. Some nodes are powerful machines in data centers; others are regular laptops run by volunteers in their bedrooms. The more nodes a blockchain has, the more decentralized and secure it is. Bitcoin has tens of thousands of nodes spread across every continent. Nodes do a few important jobs. <strong>Full nodes</strong> store the entire history of the blockchain and validate every new transaction and block. They are the strict librarians who check that every rule is followed. <strong>Light nodes</strong> store only a portion of the data and rely on full nodes for the rest \u2014 they are like students who check out specific books instead of reading the whole library. When a new block is proposed, full nodes verify it independently. If the block breaks any rules \u2014 like trying to spend coins that do not exist \u2014 the node rejects it. Because thousands of nodes are all checking independently, it is nearly impossible for a bad block to slip through.",
      },
      {
        heading: "Is Decentralization Always Better?",
        content:
          "Here is a fair question: if decentralization is so great, why is not everything decentralized? The honest answer is that decentralization comes with trade-offs. Decentralized systems can be <strong>slower</strong> than centralized ones because thousands of computers need to agree before anything is finalized. Visa can process thousands of credit-card transactions per second; Bitcoin handles about seven. Decentralized systems can also be <strong>harder to upgrade</strong>. When a company wants to update its app, it just pushes an update. When a blockchain wants to change its rules, the whole community of node operators has to agree, which can take months or even years of debate. And if they disagree strongly enough, the chain can <strong>fork</strong> \u2014 split into two separate blockchains with different rules (that is actually how Bitcoin Cash was born). So decentralization is not magic. It is a <em>design choice</em> that trades speed and simplicity for security, resilience, and fairness. Different projects make different trade-offs depending on their goals. The key takeaway is understanding <strong>why</strong> decentralization matters so you can evaluate each project on its own merits.",
      },
    ],
    quiz: [
      {
        question: "What is the best analogy for a centralized system?",
        options: [
          "Hundreds of pizza shops sharing a recipe",
          "A single pizza shop that controls all pizza in the city",
          "A blockchain with thousands of nodes",
          "A group of students voting on a game",
        ],
        correctIndex: 1,
        explanation:
          "A centralized system is like a single pizza shop \u2014 one entity controls everything, creating a single point of failure.",
      },
      {
        question: "Which is NOT a benefit of decentralization?",
        options: [
          "Resilience against failures",
          "Censorship resistance",
          "Faster transaction speeds",
          "Transparency",
        ],
        correctIndex: 2,
        explanation:
          "Decentralized systems are actually typically slower than centralized ones because many computers must agree before a transaction is finalized.",
      },
      {
        question: "What is a 'node' in a blockchain network?",
        options: [
          "A type of cryptocurrency coin",
          "A computer that stores a copy of the blockchain and validates data",
          "A single transaction in a block",
          "The person who invented Bitcoin",
        ],
        correctIndex: 1,
        explanation:
          "A node is a computer that stores a copy of the blockchain, validates new transactions and blocks, and helps keep the network running.",
      },
    ],
  },

  // ─── LESSON 5 ───────────────────────────────────────────────
  {
    id: 5,
    title: "Public vs Private Blockchains",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "Open playgrounds vs gated clubs",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Two Flavors of Blockchain",
        content:
          "Think about the difference between a public park and a private backyard. A public park is open to <em>everyone</em> \u2014 anyone can walk in, sit on a bench, or play on the swings. A private backyard has a fence and a gate; only people the owner invites can come in. Blockchains come in two similar flavors. A <strong>public blockchain</strong> (also called a permissionless blockchain) is open to the entire world. Anyone can join the network, run a node, send transactions, or view the ledger. Bitcoin and Ethereum are both public blockchains. You do not need to ask permission or fill out an application \u2014 you just download the software and participate. A <strong>private blockchain</strong> (also called a permissioned blockchain) is controlled by a specific organization or group. Only approved participants can join, read data, or submit transactions. Think of it like a company intranet versus the open internet. Both types use the same core technology \u2014 blocks, hashes, and chains \u2014 but they differ in who is allowed to participate and who makes the rules.",
      },
      {
        heading: "Public Blockchains: Open to All",
        content:
          "Public blockchains are the ones that get the most attention, and for good reason. Their openness is their greatest strength. Because <strong>anyone</strong> can verify the data, public blockchains are incredibly transparent. You can go to a website like Etherscan right now and look up every single transaction that has ever happened on Ethereum. This transparency builds trust without needing a middleman. Public blockchains are also <strong>censorship-resistant</strong>. Since no single entity controls the network, nobody can block your transactions or freeze your account (as long as you follow the network rules). This is especially important for people living in countries with unstable governments or strict financial controls. The trade-offs? Public blockchains can be <strong>slower</strong> because every node in the world needs to process every transaction. They also offer <strong>less privacy</strong> by default \u2014 while your real name is not attached to your address, all your transactions are visible to anyone who looks. Some people use that openness to trace activity, which is both a feature and a concern depending on your perspective.",
      },
      {
        heading: "Private Blockchains: Controlled Access",
        content:
          "Private blockchains are popular with big companies, banks, and governments. Why? Because these organizations often need the <em>benefits</em> of blockchain \u2014 tamper-proof records, shared data, automated processes \u2014 but they do not want the whole world reading their business. Imagine a group of hospitals that need to share patient records securely. They want the records to be trustworthy and hard to tamper with, but they definitely do not want random strangers browsing private medical data. A private blockchain lets the hospitals share a ledger among themselves without exposing it to the public. Private blockchains are typically <strong>much faster</strong> than public ones because they have fewer participants who need to reach consensus. They also offer <strong>more control</strong> \u2014 the organization running the chain can set rules about who can join, what data is visible, and how upgrades happen. The downside is that private blockchains are <strong>less decentralized</strong>. If one company controls who can participate, you are back to trusting that company. Critics argue that a private blockchain is not much different from a fancy shared database. That debate is still ongoing in the tech world.",
      },
      {
        heading: "Hybrid and Consortium Blockchains",
        content:
          "There is also a middle ground. A <strong>consortium blockchain</strong> is run by a group of organizations rather than one company or the whole world. For example, ten major banks might run a consortium blockchain together to settle payments between them faster. No single bank controls the chain, but it is not open to random people either. Then there are <strong>hybrid blockchains</strong> that combine public and private features. Some data might be public (like proof that a transaction happened) while the details remain private (like the exact amount or the parties involved). This gives organizations flexibility \u2014 they can prove honesty to the outside world without revealing everything. The key takeaway is that \"blockchain\" is not one-size-fits-all. The right choice depends on the use case. Need maximum transparency and censorship resistance? Go public. Need speed, privacy, and control? Go private. Want a balance? Consider a consortium or hybrid. Understanding these options will help you evaluate blockchain projects you encounter in the future, because not every blockchain is built for the same purpose.",
      },
    ],
    quiz: [
      {
        question: "Which best describes a public blockchain?",
        options: [
          "Only approved companies can use it",
          "Anyone in the world can join, transact, and verify data",
          "It is controlled by a single government",
          "It requires a membership fee to access",
        ],
        correctIndex: 1,
        explanation:
          "A public blockchain is open and permissionless \u2014 anyone can join the network, send transactions, run a node, and view the ledger.",
      },
      {
        question: "Why might a hospital prefer a private blockchain?",
        options: [
          "They want everyone to see patient records",
          "They need tamper-proof records without exposing data publicly",
          "Private blockchains are always free to use",
          "Private blockchains do not use hashing",
        ],
        correctIndex: 1,
        explanation:
          "Hospitals handle sensitive patient data. A private blockchain gives them tamper-proof shared records without exposing private information to the public.",
      },
      {
        question: "What is a consortium blockchain?",
        options: [
          "A blockchain run by one company",
          "A blockchain open to everyone",
          "A blockchain run by a group of organizations together",
          "A blockchain that does not use blocks",
        ],
        correctIndex: 2,
        explanation:
          "A consortium blockchain is managed by multiple organizations working together, rather than being controlled by one entity or open to everyone.",
      },
    ],
  },

  // ─── LESSON 6 ───────────────────────────────────────────────
  {
    id: 6,
    title: "Real-World Blockchain Uses",
    module: "Blockchain Fundamentals",
    moduleNumber: 1,
    subtitle: "Beyond cryptocurrency",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Blockchain Is Not Just About Money",
        content:
          "When most people hear \"blockchain,\" they immediately think of Bitcoin and crypto trading. But that is like saying the internet is only for email. Cryptocurrency was the <em>first</em> killer app for blockchain, but the technology is being used for way more than digital coins. Think about any situation where people need to <strong>trust a record</strong> without trusting a single person or company. That is where blockchain shines. From tracking your hamburger's journey from farm to plate, to proving you actually own that rare digital artwork, to voting in elections \u2014 blockchain is quietly showing up in places you might not expect. In this lesson, we will explore some of the coolest real-world uses happening right now. Some are already in production; others are experimental. But all of them show that blockchain technology is about much more than buying and selling crypto. By the end of this lesson, you will have a sense of the wide landscape of blockchain applications \u2014 and maybe you will even start imagining some of your own ideas.",
      },
      {
        heading: "Supply Chain Tracking",
        content:
          "Have you ever wondered where your food comes from? Not just \"the grocery store,\" but the actual farm, the truck that carried it, and the warehouse where it was stored? <strong>Supply chain tracking</strong> is one of the most practical uses of blockchain today. Companies like Walmart and Nestl\u00e9 use blockchain to track food from the farm all the way to the shelf. Every step of the journey \u2014 harvesting, packaging, shipping, storing \u2014 is recorded on a blockchain. If someone gets sick from contaminated lettuce, the company can trace it back to the exact farm in <em>seconds</em> instead of days. Without blockchain, this process involves calling dozens of suppliers, checking paper records, and hoping nobody made a mistake. Beyond food, luxury brands use blockchain to fight <strong>counterfeiting</strong>. When you buy an expensive pair of sneakers, a blockchain record can prove they are authentic. Diamonds are tracked from the mine to the jewelry store to make sure they were sourced ethically. Any time you need to prove where something came from and that nobody tampered with the record along the way, blockchain is a natural fit.",
      },
      {
        heading: "Digital Ownership and NFTs",
        content:
          "You have probably heard of <strong>NFTs</strong> \u2014 Non-Fungible Tokens. An NFT is basically a blockchain receipt that proves you own a specific digital item. \"Non-fungible\" just means one-of-a-kind; a dollar bill is fungible because any dollar is the same as any other, but a painting is non-fungible because there is only one original. NFTs blew up in 2021 with digital artwork selling for millions, but the concept goes way beyond art. Musicians use NFTs to sell music directly to fans without a record label taking a cut. Game developers use NFTs so players can truly <strong>own</strong> their in-game items \u2014 swords, skins, characters \u2014 and trade or sell them outside the game. Some sports leagues sell NFT highlight clips as collectible \"moments.\" The idea is that blockchain can prove digital ownership the same way a deed proves you own a house. Without blockchain, digital files are just copies of copies \u2014 there is no way to prove which one is the \"original.\" NFTs solve that problem by recording ownership on an immutable ledger. The technology is still evolving and the market has its ups and downs, but the concept of provable digital ownership is here to stay.",
      },
      {
        heading: "Voting, Identity, and More",
        content:
          "Several countries and organizations are experimenting with <strong>blockchain-based voting</strong>. The idea is appealing: every vote is recorded on an immutable ledger, making fraud nearly impossible and results easily auditable. While there are still challenges around privacy and accessibility, pilot programs have been run in places like Estonia and parts of the United States. <strong>Digital identity</strong> is another exciting area. Imagine having a single digital ID on the blockchain that you control \u2014 not a company, not a government, but <em>you</em>. You could prove your age to enter a website without revealing your full birthday, or prove your diploma is real without contacting the university. This concept is called <strong>self-sovereign identity</strong>, and it could be a game-changer for the billions of people worldwide who lack official ID documents. Other uses include <strong>decentralized finance (DeFi)</strong>, which recreates banking services like lending and borrowing without banks; <strong>healthcare records</strong> that patients control and share securely; and <strong>decentralized social media</strong> where no single company can ban you or control the algorithm. The blockchain universe is expanding fast, and we have only scratched the surface.",
      },
    ],
    quiz: [
      {
        question: "How does Walmart use blockchain technology?",
        options: [
          "To mine Bitcoin",
          "To track food from farm to shelf",
          "To sell NFTs of their products",
          "To replace cash registers",
        ],
        correctIndex: 1,
        explanation:
          "Walmart uses blockchain for supply chain tracking, recording every step of a food product's journey so they can trace issues like contamination in seconds.",
      },
      {
        question: "What does 'non-fungible' mean in NFT?",
        options: [
          "Digital and invisible",
          "Free to copy and share",
          "One-of-a-kind, not interchangeable",
          "Related to fungus or biology",
        ],
        correctIndex: 2,
        explanation:
          "Non-fungible means unique and not interchangeable. Each NFT represents a one-of-a-kind digital item, unlike a dollar which is identical to any other dollar.",
      },
      {
        question: "What is 'self-sovereign identity'?",
        options: [
          "A government-issued blockchain passport",
          "A digital identity you control rather than a company or government",
          "A username on a cryptocurrency exchange",
          "A private key used to mine Bitcoin",
        ],
        correctIndex: 1,
        explanation:
          "Self-sovereign identity means you own and control your own digital identity on the blockchain, deciding what information to share and with whom.",
      },
    ],
  },

  // ─── LESSON 7 ───────────────────────────────────────────────
  {
    id: 7,
    title: "What is Cryptocurrency?",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "Digital money that doesn't need a bank",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Money Without a Middleman",
        content:
          "When you buy something at a store with a debit card, here is what actually happens behind the scenes: the store's system talks to a payment processor, which talks to your bank, which checks your balance, approves the transaction, and sends the money to the store's bank. That chain of middlemen takes time, charges fees, and requires you to trust every link in the chain. Now imagine you could hand someone digital money <em>directly</em>, the way you hand someone a dollar bill \u2014 no bank, no payment processor, no middleman. That is the core idea behind <strong>cryptocurrency</strong>. Cryptocurrency (\"crypto\" for short) is digital money that lives on a blockchain. Instead of a bank keeping track of who has how much, the blockchain does that job. Instead of trusting a company, you trust the math and the network of computers we talked about in Module 1. The word \"cryptocurrency\" comes from <strong>cryptography</strong> \u2014 the science of secret codes \u2014 because crypto uses advanced math to secure transactions and control the creation of new coins. It is real money in the sense that people use it to buy goods, services, and investments. It is just that its rules are enforced by code rather than by a central institution.",
      },
      {
        heading: "How Crypto Transactions Work",
        content:
          "Let us walk through a simple crypto transaction. Say you want to send 0.5 ETH (Ether, the cryptocurrency of Ethereum) to your friend. You open your <strong>crypto wallet</strong> (we will learn about wallets in Lesson 9), type in your friend's wallet address, enter the amount, and hit send. Your wallet creates a <strong>transaction</strong> \u2014 a digital message that says, \"I am sending 0.5 ETH from my address to this other address.\" Your wallet signs this message with your <strong>private key</strong> (think of it as a super-secret digital signature that proves you authorized the transfer). The signed transaction is broadcast to the blockchain network. Miners or validators pick it up, verify that your signature is valid and that you actually have 0.5 ETH in your account, and include it in the next block. Once the block is confirmed, your friend's balance goes up by 0.5 ETH, and yours goes down by 0.5 ETH (plus a small fee). The whole process typically takes seconds to a few minutes, works 24/7, and does not require a bank to be open. It also works across borders \u2014 sending crypto to someone in Japan is exactly the same as sending it to someone next door.",
      },
      {
        heading: "Crypto vs Traditional Money",
        content:
          "Traditional money \u2014 the dollars, euros, or yen in your parent's bank account \u2014 is called <strong>fiat currency</strong>. \"Fiat\" is Latin for \"let it be done,\" meaning the government declares it to be money by law. Fiat currencies have some nice properties: they are stable (mostly), widely accepted, and backed by governments. But they also have limitations. Governments can print more money whenever they want, which can cause <strong>inflation</strong> (your money buys less over time). Banks can freeze your account. International transfers can take days and cost a lot. Cryptocurrency addresses many of these issues. Most cryptocurrencies have a <strong>fixed supply</strong> \u2014 for example, there will only ever be 21 million Bitcoin, period. Nobody can print more. Crypto accounts cannot be frozen by a bank because there is no bank. And cross-border transfers are fast and relatively cheap. However, crypto has its own challenges. Prices can be <strong>extremely volatile</strong> \u2014 Bitcoin's value can swing 10 percent in a single day. Not all stores accept crypto. And if you lose your private key, there is no bank to call for help. Both systems have strengths and weaknesses, and understanding the differences will make you a smarter digital citizen.",
      },
      {
        heading: "The Thousands of Cryptocurrencies",
        content:
          "Bitcoin was the first cryptocurrency, launched in 2009 by the mysterious <strong>Satoshi Nakamoto</strong> (nobody knows who they really are). But today there are <em>thousands</em> of different cryptocurrencies, sometimes called <strong>altcoins</strong> (alternative coins). Some of the most well-known include <strong>Ether (ETH)</strong> on Ethereum, <strong>Solana (SOL)</strong>, <strong>Cardano (ADA)</strong>, and <strong>Polygon (MATIC)</strong>. Each cryptocurrency has its own blockchain and its own purpose. Some are designed to be digital money (like Bitcoin). Some power platforms for building apps (like Ethereum). Some focus on privacy, some on speed, some on specific industries. There are even joke coins called <strong>meme coins</strong> \u2014 Dogecoin started as a joke based on a Shiba Inu meme and ended up being worth billions. Not all cryptocurrencies are created equal. Many have failed, and some have been outright scams. Learning to research and evaluate crypto projects is a crucial skill. In the next lesson, we will dive deep into the two most important ones: Bitcoin and Ethereum.",
      },
    ],
    quiz: [
      {
        question: "What does the 'crypto' in cryptocurrency refer to?",
        options: [
          "Cryptozoology, the study of hidden animals",
          "Cryptography, the science of secure communication",
          "A type of secret bank account",
          "The hidden identity of Bitcoin's creator",
        ],
        correctIndex: 1,
        explanation:
          "The 'crypto' in cryptocurrency comes from cryptography \u2014 the mathematical science of encoding and securing information.",
      },
      {
        question:
          "What is the maximum number of Bitcoin that will ever exist?",
        options: [
          "1 million",
          "21 million",
          "100 million",
          "There is no limit",
        ],
        correctIndex: 1,
        explanation:
          "Bitcoin has a hard cap of 21 million coins. No more can ever be created, which is a key difference from government-issued money.",
      },
      {
        question: "What is fiat currency?",
        options: [
          "A cryptocurrency made by a car company",
          "Digital money on a blockchain",
          "Government-issued money like dollars or euros",
          "A type of stablecoin",
        ],
        correctIndex: 2,
        explanation:
          "Fiat currency is traditional money issued and backed by a government, like US dollars, euros, or Japanese yen.",
      },
    ],
  },

  // ─── LESSON 8 ───────────────────────────────────────────────
  {
    id: 8,
    title: "Bitcoin vs Ethereum",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "The gold and the computer",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Two Giants",
        content:
          "If blockchain were a superhero universe, <strong>Bitcoin</strong> and <strong>Ethereum</strong> would be the two biggest heroes \u2014 each with very different powers. Bitcoin is like <strong>digital gold</strong>. It was created in 2009 to be a decentralized form of money \u2014 a way to store and transfer value without banks. It does one thing and it does it really well. Ethereum, launched in 2015, is more like a <strong>digital computer</strong>. Yes, it has its own cryptocurrency (Ether, or ETH), but its real superpower is that it can run programs called <em>smart contracts</em> (which we will dig into in Module 3). Think of it this way: Bitcoin is a calculator \u2014 reliable, focused, does math perfectly. Ethereum is a smartphone \u2014 it can do calculations too, but it can also run apps, play games, browse the web, and do things nobody has even thought of yet. Both are incredibly important to the crypto world, but they serve different purposes. Understanding the difference is one of the most valuable things you can learn as a blockchain beginner.",
      },
      {
        heading: "Bitcoin: Digital Gold",
        content:
          "Bitcoin was invented by someone (or a group) using the name <strong>Satoshi Nakamoto</strong>. Satoshi published a paper in 2008 describing how a peer-to-peer electronic cash system could work, and the first Bitcoin block was mined on January 3, 2009. Bitcoin's design is intentionally simple. Its main job is to be a <strong>store of value</strong> and a <strong>medium of exchange</strong>. There will only ever be 21 million Bitcoin, and new coins are created at a shrinking rate through mining. Roughly every four years, the mining reward gets cut in half in an event called the <strong>halving</strong>. This built-in scarcity is why people compare Bitcoin to gold \u2014 there is a limited supply, and you cannot make more. Bitcoin uses <strong>Proof of Work</strong> consensus, which makes it extremely secure but also energy-intensive. Its network processes about 7 transactions per second, which is slow compared to Visa's thousands. But Bitcoin fans argue that speed is not the point \u2014 security and decentralization are. Bitcoin is the oldest, most well-known, and most valuable cryptocurrency by market cap. Many people treat it as a long-term investment, similar to how people hold gold.",
      },
      {
        heading: "Ethereum: The World Computer",
        content:
          "Ethereum was proposed in 2013 by a programmer named <strong>Vitalik Buterin</strong>, who was only 19 years old at the time. Vitalik saw that Bitcoin's blockchain could only handle simple transactions \u2014 send coins from A to B. He imagined a blockchain that could run <em>any</em> program, not just money transfers. That vision became Ethereum. The key innovation is the <strong>Ethereum Virtual Machine (EVM)</strong>, which is like a giant computer shared by the whole network. Developers can write <strong>smart contracts</strong> \u2014 small programs that automatically execute when certain conditions are met \u2014 and deploy them on Ethereum. These smart contracts power an entire ecosystem of <strong>decentralized applications (dApps)</strong>. Think of dApps like regular apps, except no single company controls them. There are dApps for lending and borrowing money (DeFi), trading digital art (NFT marketplaces), playing games, and much more. Ethereum switched from Proof of Work to <strong>Proof of Stake</strong> in September 2022, dramatically reducing its energy consumption. Its native currency, <strong>Ether (ETH)</strong>, is used to pay transaction fees and reward validators.",
      },
      {
        heading: "Comparing Bitcoin and Ethereum",
        content:
          "Let us do a quick side-by-side comparison. <strong>Purpose</strong>: Bitcoin is digital money/gold; Ethereum is a platform for decentralized applications. <strong>Creator</strong>: Bitcoin by Satoshi Nakamoto (anonymous); Ethereum by Vitalik Buterin (known). <strong>Consensus</strong>: Bitcoin uses Proof of Work; Ethereum uses Proof of Stake. <strong>Supply</strong>: Bitcoin is capped at 21 million; Ethereum has no hard cap but controls inflation through a fee-burning mechanism. <strong>Speed</strong>: Bitcoin handles about 7 transactions per second; Ethereum handles about 15-30, with layer-2 solutions pushing much higher. <strong>Smart contracts</strong>: Bitcoin has very limited scripting; Ethereum was built specifically for complex smart contracts. Here is an analogy to tie it all together. Imagine Bitcoin is like a vault in a bank \u2014 it is incredibly secure, and its main job is to store valuable things. Ethereum is like a whole shopping mall \u2014 it has stores (dApps), vending machines (smart contracts), and its own currency for buying things. Both are built on blockchain technology. Both are decentralized. But they are solving different problems. You do not have to pick a side \u2014 most people in the crypto world appreciate both for what they do best.",
      },
    ],
    quiz: [
      {
        question: "What is Ethereum's key advantage over Bitcoin?",
        options: [
          "It has a lower price",
          "It can run smart contracts and decentralized applications",
          "It was created first",
          "It has a fixed supply of 21 million coins",
        ],
        correctIndex: 1,
        explanation:
          "Ethereum's main advantage is its ability to run smart contracts and host decentralized applications, making it a programmable blockchain platform.",
      },
      {
        question: "What is Bitcoin's 'halving'?",
        options: [
          "When Bitcoin's price drops by 50%",
          "When the mining reward is cut in half roughly every 4 years",
          "When half of all Bitcoin nodes go offline",
          "When a Bitcoin is split into two smaller coins",
        ],
        correctIndex: 1,
        explanation:
          "The halving is a scheduled event roughly every four years where the reward miners receive for adding a new block is cut in half, controlling Bitcoin's supply.",
      },
      {
        question: "Who created Ethereum?",
        options: [
          "Satoshi Nakamoto",
          "Elon Musk",
          "Vitalik Buterin",
          "Mark Zuckerberg",
        ],
        correctIndex: 2,
        explanation:
          "Ethereum was proposed in 2013 by Vitalik Buterin, who was just 19 years old at the time.",
      },
    ],
  },

  // ─── LESSON 9 ───────────────────────────────────────────────
  {
    id: 9,
    title: "What is a Wallet?",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "Your keys, your crypto, your rules",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Not the Wallet in Your Back Pocket",
        content:
          "When you hear \"crypto wallet,\" you might picture a digital version of the leather wallet in your pocket, stuffed with digital coins. But that is not quite right. A crypto wallet does not actually <em>store</em> your cryptocurrency. Your coins always live on the blockchain. What the wallet stores are your <strong>keys</strong> \u2014 the secret codes that prove you own those coins and let you send them. Think of it like this: your crypto is in a safe deposit box (the blockchain), and your wallet holds the <em>key</em> to that box. If you lose the key, the coins are still in the box \u2014 you just cannot get to them anymore. And if someone steals your key, they can open the box and take everything. This is why the crypto community has a famous saying: <strong>\"Not your keys, not your crypto.\"</strong> If you let a company hold your keys (like leaving coins on an exchange), you are trusting them to keep your crypto safe. If they get hacked or go bankrupt, your coins could disappear. Having your own wallet with your own keys means <em>you</em> are in control.",
      },
      {
        heading: "Public Keys and Private Keys",
        content:
          "Every crypto wallet uses two keys that work together, kind of like a mailbox. Your <strong>public key</strong> is like your mailing address. You can share it with anyone so they can send you crypto. It is usually displayed as a long string of letters and numbers (or shortened into a more readable <strong>wallet address</strong>). Your <strong>private key</strong> is like the key to your mailbox. Only you should have it. It lets you open the mailbox and take out what is inside \u2014 or more accurately, it lets you sign transactions that send your crypto to someone else. Here is the critical part: you can always derive the public key from the private key, but you <strong>cannot</strong> figure out the private key from the public key. The math only works in one direction (like the hash functions we learned about in Lesson 2). This means it is perfectly safe to share your public key or wallet address with the world. But your private key must stay secret. If someone gets your private key, they have full control of your crypto. There is no \"forgot my password\" button, no customer support to call. This is both the freedom and the responsibility of managing your own wallet.",
      },
      {
        heading: "Types of Wallets",
        content:
          "Crypto wallets come in several forms, and each has trade-offs between convenience and security. <strong>Software wallets</strong> (also called hot wallets) are apps on your phone or computer, or browser extensions. MetaMask, which we will set up in the next lesson, is a popular software wallet. They are convenient and free, but because they are connected to the internet, they are more vulnerable to hacking. <strong>Hardware wallets</strong> (also called cold wallets) are physical devices that look like USB drives. Brands like Ledger and Trezor are popular. They store your private key offline, making them much harder to hack. They are the gold standard for security, but they cost money (usually $60\u2013$150) and are less convenient for quick transactions. <strong>Paper wallets</strong> are literally your keys printed on paper. They are immune to digital hacking, but if the paper gets lost, damaged, or stolen, your crypto is gone. <strong>Exchange wallets</strong> are wallets managed by a crypto exchange like Coinbase. They are the most convenient but the least secure in terms of control \u2014 the exchange holds your private keys, not you.",
      },
      {
        heading: "Seed Phrases: Your Ultimate Backup",
        content:
          "When you create a new wallet, you will be given a <strong>seed phrase</strong> (also called a recovery phrase or mnemonic phrase). This is a list of 12 or 24 ordinary English words in a specific order \u2014 something like \"apple banana cherry dog elephant frog grape...\" This seed phrase is the master key to your entire wallet. If your phone breaks, your computer is stolen, or your hardware wallet is lost, you can use the seed phrase to restore your wallet and all your crypto on a new device. <strong>This seed phrase is the most important thing you will ever protect in crypto.</strong> Here are the rules: <em>Write it down on paper</em> \u2014 do not save it in a text file, do not take a screenshot, do not put it in Google Docs. <em>Store the paper in a safe place</em> \u2014 some people use fireproof safes, safety deposit boxes, or even engrave it on metal. <em>Never share it with anyone</em> \u2014 no legitimate company, website, or person will ever ask for your seed phrase. If someone does, it is a scam, 100 percent of the time. If you lose your seed phrase and something happens to your wallet, your crypto is gone forever. There is no password reset. This might sound scary, but it is actually empowering \u2014 <em>you</em> have complete control over your financial assets.",
      },
    ],
    quiz: [
      {
        question: "What does a crypto wallet actually store?",
        options: [
          "Your cryptocurrency coins",
          "Your private and public keys",
          "A copy of the entire blockchain",
          "Your bank account information",
        ],
        correctIndex: 1,
        explanation:
          "A crypto wallet stores your keys (private and public), not the actual coins. The coins live on the blockchain; your keys prove ownership and let you transact.",
      },
      {
        question: "What should you NEVER do with your seed phrase?",
        options: [
          "Write it on paper",
          "Store it in a safe place",
          "Save it as a screenshot or in a cloud document",
          "Memorize it as a backup",
        ],
        correctIndex: 2,
        explanation:
          "Never save your seed phrase digitally (screenshots, cloud docs, text files). These can be hacked. Always write it on physical paper and store it securely.",
      },
      {
        question: "Which type of wallet is considered most secure?",
        options: [
          "Exchange wallet",
          "Software wallet on your phone",
          "Hardware wallet (cold wallet)",
          "Browser extension wallet",
        ],
        correctIndex: 2,
        explanation:
          "Hardware wallets (cold wallets) store your private key offline on a physical device, making them the most secure option against hacking.",
      },
    ],
  },

  // ─── LESSON 10 ──────────────────────────────────────────────
  {
    id: 10,
    title: "Setting Up MetaMask",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "Hands-on install and configure",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "What Is MetaMask?",
        content:
          "MetaMask is the most popular crypto wallet in the world, and it is what we will use throughout this course. It is a <strong>browser extension</strong> (it also has a mobile app) that lets you interact with the Ethereum blockchain and thousands of decentralized applications right from your web browser. Think of MetaMask as your passport to the world of Web3. Websites and apps can ask to connect to your MetaMask wallet, kind of like how apps ask you to \"Sign in with Google.\" But instead of signing in with a Google account that Google controls, you are connecting with a wallet that <em>you</em> control. MetaMask is free to install and use. It supports Ethereum and any blockchain that is compatible with the Ethereum Virtual Machine (EVM), including Polygon, Arbitrum, Optimism, and many others. We will be using it with <strong>test networks</strong> (testnets) that use fake money, so there is zero risk of losing real funds while you learn. Do not worry \u2014 we will explain testnets in detail in Lesson 11. For now, let us get MetaMask installed and set up.",
      },
      {
        heading: "Step-by-Step Installation",
        content:
          "Here is how to install MetaMask on a desktop browser (Chrome, Firefox, Brave, or Edge). <strong>Step 1:</strong> Open your browser and go to <code>metamask.io</code>. Be very careful to type the URL correctly \u2014 scammers create fake MetaMask websites. Always verify you are on the official site. <strong>Step 2:</strong> Click \"Download\" and then \"Install MetaMask for Chrome\" (or whichever browser you use). This will take you to the browser's extension store. <strong>Step 3:</strong> Click \"Add to Chrome\" (or your browser's equivalent) and confirm the installation. You will see a little fox icon appear in your browser's toolbar. <strong>Step 4:</strong> Click the fox icon to open MetaMask. It will ask if you want to create a new wallet or import an existing one. Choose <strong>\"Create a new wallet.\"</strong> <strong>Step 5:</strong> Create a strong password. This password locks the MetaMask app on your computer \u2014 it is different from your seed phrase. Use something unique that you will remember. <strong>Step 6:</strong> MetaMask will now show you your <strong>seed phrase</strong> \u2014 12 words in a specific order. This is the most important step. Read the next section before continuing.",
      },
      {
        heading: "Protecting Your Seed Phrase",
        content:
          "When MetaMask shows your 12-word seed phrase, here is exactly what to do. Grab a <strong>pen and paper</strong> \u2014 not your phone, not a Google Doc, not a screenshot. Write down every word, in order, and number them 1 through 12. Double-check your spelling. Then write it down <em>again</em> on a second piece of paper so you have a backup copy. Store these papers in two different safe locations \u2014 maybe one in a drawer at home and one in a family safe. <strong>Never</strong> type your seed phrase into any website, app, or form other than MetaMask itself. No legitimate service will ever ask for it. If a pop-up, email, or DM asks for your seed phrase, it is a scam \u2014 always. After you have safely recorded your seed phrase, MetaMask will ask you to confirm it by selecting the words in the correct order. This is to make sure you actually wrote it down and did not just skip past the screen. Take your time and get it right. Once confirmed, your wallet is ready to go. You now have your own Ethereum address and you are officially part of the Web3 world.",
      },
      {
        heading: "Exploring the MetaMask Interface",
        content:
          "Now that your wallet is set up, let us take a quick tour. When you click the fox icon and unlock MetaMask with your password, you will see a few key things. At the top, there is a <strong>network selector</strong> \u2014 it probably says \"Ethereum Mainnet\" by default. This tells MetaMask which blockchain to connect to. We will switch this to a test network in Lesson 11. Below that, you will see your <strong>account name</strong> (you can rename it) and your <strong>wallet address</strong> \u2014 a long string starting with <code>0x</code>. This is your public address that people can use to send you crypto. Click on it to copy it to your clipboard. The main area shows your <strong>balance</strong> (currently 0 ETH, which is perfectly normal). Below that are tabs for your assets (tokens you own) and activity (transaction history). There are also buttons to <strong>Send</strong>, <strong>Receive</strong>, and <strong>Swap</strong> tokens. You probably will not use these right away, but it is good to know where they are. Congratulations \u2014 you have officially set up your first crypto wallet. In the next two lessons, we will learn about testnets and gas fees so you can start making your first transactions.",
      },
    ],
    quiz: [
      {
        question: "What is MetaMask?",
        options: [
          "A cryptocurrency coin",
          "A browser extension crypto wallet",
          "A blockchain network",
          "A type of smart contract",
        ],
        correctIndex: 1,
        explanation:
          "MetaMask is a browser extension (and mobile app) that serves as a crypto wallet, letting you interact with Ethereum and other EVM-compatible blockchains.",
      },
      {
        question:
          "Which of these is the SAFEST way to store your seed phrase?",
        options: [
          "In a text file on your desktop",
          "As a screenshot in your photo gallery",
          "Written on paper and stored in a safe place",
          "In a direct message to yourself on Discord",
        ],
        correctIndex: 2,
        explanation:
          "The safest method is writing your seed phrase on physical paper and storing it in a secure location. Digital storage methods are vulnerable to hacking.",
      },
      {
        question:
          "What does the long string starting with 0x in MetaMask represent?",
        options: [
          "Your private key",
          "Your seed phrase in code",
          "Your public wallet address",
          "Your MetaMask password",
        ],
        correctIndex: 2,
        explanation:
          "The string starting with 0x is your public wallet address. It is safe to share and is what others use to send you cryptocurrency.",
      },
    ],
  },

  // ─── LESSON 11 ──────────────────────────────────────────────
  {
    id: 11,
    title: "Testnets vs Mainnet",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "Practicing with play money",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Dress Rehearsal Before the Big Show",
        content:
          "Imagine you are in a school play. You would never perform in front of an audience on opening night without rehearsing first, right? You practice your lines, test the lighting, and do full run-throughs to catch mistakes when they do not matter. Blockchain has the exact same concept. The <strong>mainnet</strong> (short for main network) is the \"opening night\" \u2014 the real blockchain where real money is at stake. Every transaction on mainnet uses actual cryptocurrency that has actual value. A <strong>testnet</strong> (short for test network) is the rehearsal stage. It works exactly like the mainnet \u2014 same rules, same software, same process \u2014 but the cryptocurrency on it has <em>zero real-world value</em>. It is play money. Developers use testnets to test their smart contracts and apps before deploying them on mainnet. Students like you use testnets to learn how blockchain works without risking real money. It is the perfect training ground. This is exactly like how pilots train on flight simulators before flying real planes. The simulator works just like a real cockpit, but if you crash, nobody gets hurt.",
      },
      {
        heading: "Popular Ethereum Testnets",
        content:
          "Ethereum has several testnets, and they change over time as the technology evolves. The most commonly used testnet today is called <strong>Sepolia</strong>. It is maintained by the Ethereum community and closely mirrors how the real Ethereum mainnet works. You might also hear about <strong>Goerli</strong> (which was deprecated in early 2024) or <strong>Holesky</strong> (a newer testnet used mainly by developers testing validator setups). For our course, we will use <strong>Sepolia</strong>. To switch MetaMask to Sepolia, click the network selector at the top of MetaMask (it probably says \"Ethereum Mainnet\"), then click \"Show test networks\" in the settings if they are not visible. Once test networks are enabled, select <strong>Sepolia test network</strong> from the dropdown. Your wallet address stays the same, but you are now on a completely separate blockchain where everything is free and experimental. You will notice your balance is 0 SepoliaETH \u2014 that is the fake Ether used on this testnet. Let us fix that in the next section.",
      },
      {
        heading: "Getting Free Test Tokens from a Faucet",
        content:
          "To practice making transactions, you need some test tokens. The way you get free testnet tokens is through a <strong>faucet</strong>. A faucet is a website that sends free test cryptocurrency to your wallet address \u2014 like a water fountain, but instead of water, it dispenses play money. Here is how to use one. <strong>Step 1:</strong> Copy your wallet address from MetaMask (click on it to copy). <strong>Step 2:</strong> Go to a Sepolia faucet website. Some popular ones include the Alchemy Sepolia faucet (<code>sepoliafaucet.com</code>) and Google Cloud's faucet. These change over time, so a quick search for \"Sepolia faucet\" will help. <strong>Step 3:</strong> Paste your wallet address into the faucet website and click the button to request tokens. Some faucets require you to sign up for a free account first. <strong>Step 4:</strong> Wait a minute or two, then check your MetaMask balance. You should see some SepoliaETH appear. The amount varies \u2014 usually 0.1 to 0.5 SepoliaETH. Remember, this has no real value, but it lets you practice sending transactions, interacting with smart contracts, and understanding gas fees \u2014 all without any risk.",
      },
      {
        heading: "Why Testnets Matter for Learning",
        content:
          "Testnets are not just for professional developers \u2014 they are <em>essential</em> for anyone learning about blockchain. Here is why. First, <strong>zero risk</strong>. You can make mistakes, send tokens to the wrong address, or mess up a smart contract interaction without losing a single cent. When you are learning, mistakes are inevitable, and testnets make sure those mistakes are free. Second, <strong>real experience</strong>. Because testnets mirror the mainnet, everything you learn on a testnet transfers directly to real blockchain skills. The transactions look the same, the wallet works the same, and the smart contracts behave the same. Third, <strong>experimentation freedom</strong>. Want to try deploying a smart contract? Want to test sending tokens back and forth? Want to interact with a decentralized application? Testnets let you experiment freely. Even experienced blockchain developers use testnets constantly. Before any major project launches on mainnet, it goes through weeks or months of testing on testnets. This is standard practice in the industry. So when you practice on Sepolia, you are doing exactly what professional developers do. For the rest of this course, all hands-on exercises will use testnets. You will never need real money to follow along.",
      },
    ],
    quiz: [
      {
        question: "What is the difference between mainnet and testnet?",
        options: [
          "Mainnet is faster, testnet is slower",
          "Mainnet uses real money, testnet uses play money",
          "Mainnet is for Ethereum only, testnet is for Bitcoin only",
          "There is no difference, they are the same thing",
        ],
        correctIndex: 1,
        explanation:
          "The mainnet is the real blockchain with real value, while testnets are practice environments where the cryptocurrency has no real-world value.",
      },
      {
        question: "What is a faucet in the context of testnets?",
        options: [
          "A tool that mines real cryptocurrency",
          "A website that gives out free testnet tokens",
          "A hardware device for storing crypto",
          "A type of smart contract",
        ],
        correctIndex: 1,
        explanation:
          "A faucet is a website that distributes free test tokens so you can practice using the blockchain without spending real money.",
      },
      {
        question: "Which testnet is recommended for this course?",
        options: [
          "Bitcoin Testnet",
          "Goerli",
          "Sepolia",
          "Polygon Mumbai",
        ],
        correctIndex: 2,
        explanation:
          "Sepolia is the currently active and recommended Ethereum testnet that closely mirrors how the real Ethereum mainnet works.",
      },
    ],
  },

  // ─── LESSON 12 ──────────────────────────────────────────────
  {
    id: 12,
    title: "Gas Fees",
    module: "Crypto & Wallets",
    moduleNumber: 2,
    subtitle: "Why every transaction has a cost",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Fueling the Blockchain Machine",
        content:
          "Imagine you want to mail a package. You cannot just drop it in the mailbox and hope for the best \u2014 you need to buy a stamp. The stamp pays the postal service for the work of picking up, sorting, transporting, and delivering your package. Blockchain has its own version of stamps, and they are called <strong>gas fees</strong>. Every time you do something on a blockchain like Ethereum \u2014 send cryptocurrency, interact with a smart contract, mint an NFT \u2014 the network's validators have to do computational work to process and verify your transaction. Gas fees are the payment for that work. The name \"gas\" comes from the idea of gasoline fueling a car. Just like a car needs gas to run, Ethereum needs gas to execute transactions and smart contracts. The more complex the operation (like running a complicated smart contract versus a simple transfer), the more gas it requires. Without gas fees, people could spam the network with millions of transactions for free, grinding everything to a halt. Gas fees serve two purposes: they <strong>compensate validators</strong> for their work and they <strong>prevent spam</strong> by making each transaction cost something.",
      },
      {
        heading: "How Gas Is Calculated",
        content:
          "Gas fees on Ethereum might seem confusing at first, but the math is straightforward once you break it down. Every operation on Ethereum has a <strong>gas cost</strong> measured in small units called <strong>gwei</strong> (pronounced \"gee-way\"). One gwei is one-billionth of an ETH \u2014 an incredibly tiny amount. A simple ETH transfer costs exactly <strong>21,000 gas units</strong>. More complex operations cost more \u2014 deploying a smart contract might cost hundreds of thousands of gas units. The total fee you pay is: <code>gas units used \u00d7 gas price per unit</code>. The gas <em>price</em> fluctuates based on how busy the network is. When lots of people are trying to make transactions at the same time (imagine the network during a hot NFT drop), the gas price goes up because everyone is competing to get their transaction processed first. When the network is quiet, gas prices drop. Since Ethereum's EIP-1559 upgrade, the fee structure includes a <strong>base fee</strong> (set by the network) plus an optional <strong>priority tip</strong> (extra payment to incentivize validators to pick up your transaction faster). MetaMask calculates all of this for you automatically, but it is good to understand what is happening behind the scenes.",
      },
      {
        heading: "Why Gas Prices Change",
        content:
          "Think of gas fees like the price of a rideshare on a Friday night. During rush hour or after a big concert, demand surges and prices spike. At 3 AM on a Tuesday, prices are low because almost nobody wants a ride. Ethereum's gas fees work the same way \u2014 they are driven by <strong>supply and demand</strong>. The network can only process a limited number of transactions per block. When more people want to transact than the network can handle, they start offering higher gas fees to cut the line. This creates a bidding war. During peak moments \u2014 like a popular NFT launch, a DeFi airdrop, or a market crash where everyone is panic-selling \u2014 gas fees can spike to $50, $100, or even more per transaction. During quiet periods, a simple transfer might cost less than $1. This volatility is one of Ethereum's biggest challenges. Paying $50 to send $10 makes no sense. That is why there is a huge effort to build <strong>Layer 2 solutions</strong> \u2014 separate networks that handle transactions off the main Ethereum chain and then bundle the results back to mainnet. Layer 2s like <strong>Arbitrum</strong>, <strong>Optimism</strong>, and <strong>Base</strong> can reduce fees to just pennies.",
      },
      {
        heading: "Tips for Managing Gas Fees",
        content:
          "Here are practical tips for dealing with gas fees once you start using real crypto (remember, on testnets gas fees are free since the tokens have no value). <strong>Time your transactions.</strong> Gas prices are usually lowest during off-peak hours \u2014 early mornings or weekends in US time zones, since a large portion of Ethereum users are in the US. You can check current gas prices on sites like <code>etherscan.io/gastracker</code>. <strong>Use Layer 2 networks.</strong> If you are doing something that does not absolutely need to be on Ethereum mainnet, consider using a Layer 2 like Arbitrum or Base. Fees are dramatically lower \u2014 often under $0.01. <strong>Set your gas limit carefully.</strong> MetaMask lets you adjust how much gas you are willing to spend. Setting it too low might cause your transaction to fail (you still lose the gas you spent!). Setting it too high means you overpay. Usually, MetaMask's default estimate is fine. <strong>Be patient.</strong> If your transaction is not urgent, you can set a lower gas price and wait for the network to process it when it is less busy. MetaMask will show you options like \"slow,\" \"market,\" and \"aggressive\" with different price estimates. Understanding gas fees is a critical part of using blockchain practically. It is the difference between a frustrating experience and a smooth one.",
      },
    ],
    quiz: [
      {
        question: "What is the purpose of gas fees?",
        options: [
          "To pay the creators of Ethereum",
          "To compensate validators and prevent network spam",
          "To convert crypto into real money",
          "To buy gas for mining equipment",
        ],
        correctIndex: 1,
        explanation:
          "Gas fees compensate the validators who process transactions and prevent spam by making each transaction cost something.",
      },
      {
        question: "When are Ethereum gas fees typically highest?",
        options: [
          "When the network is quiet",
          "At 3 AM on a weekday",
          "During high-demand events like popular NFT launches",
          "On testnets",
        ],
        correctIndex: 2,
        explanation:
          "Gas fees spike during high-demand periods when many people are trying to transact simultaneously, creating a bidding war for limited block space.",
      },
      {
        question: "What is a gwei?",
        options: [
          "A type of cryptocurrency wallet",
          "One billionth of an ETH, used to measure gas prices",
          "A blockchain consensus mechanism",
          "A Layer 2 network",
        ],
        correctIndex: 1,
        explanation:
          "A gwei is one-billionth of an ETH (0.000000001 ETH). It is the standard unit used to express gas prices on Ethereum.",
      },
    ],
  },

  // ─── LESSON 13 ──────────────────────────────────────────────
  {
    id: 13,
    title: "What are Smart Contracts?",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "Vending machines nobody owns the keys to",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "The Vending Machine Analogy",
        content:
          "Imagine a vending machine sitting on a street corner. You put in a dollar, press the button for a soda, and the machine gives you a soda. Simple. The machine does not care who you are, it does not need a cashier, and it follows the exact same rules every single time: correct payment in, selected item out. No negotiation, no exceptions. Now imagine a vending machine that nobody owns. It was set up by someone, but once it was placed on the corner, even the person who built it cannot change how it works or steal the money inside. It just follows its programmed rules forever. <strong>That is a smart contract.</strong> A smart contract is a program stored on a blockchain that automatically executes when certain conditions are met. \"If this happens, then do that.\" No middleman, no human judgment, no possibility of someone changing the deal after it is made. The term \"smart contract\" was actually coined way back in 1994 by a computer scientist named <strong>Nick Szabo</strong>, but it did not become practical until Ethereum made it possible to run programs on a blockchain. Smart contracts are the building blocks of everything in the decentralized world \u2014 DeFi, NFTs, DAOs, and more.",
      },
      {
        heading: "How Smart Contracts Work",
        content:
          "Let us break down the life cycle of a smart contract. <strong>Writing:</strong> A developer writes the smart contract code \u2014 the rules it will follow. For Ethereum, this is usually done in a programming language called <strong>Solidity</strong> (which we will start learning in the next lesson). <strong>Deploying:</strong> The developer sends the finished code to the blockchain in a special transaction. This costs gas, just like any transaction. Once deployed, the contract gets its own blockchain address (just like a wallet). <strong>Interacting:</strong> Anyone can now interact with the contract by sending transactions to its address. The contract reads the transaction, checks its rules, and executes automatically. <strong>Immutability:</strong> Once deployed, the code <em>cannot be changed</em>. This is both the strength and the challenge of smart contracts. The strength is that nobody \u2014 not even the developer \u2014 can alter the rules after the fact, which means you can trust the code. The challenge is that if there is a bug in the code, it cannot be easily patched. Think of it like carving rules into stone: the permanence creates trust, but you better make sure the rules are right before you start carving.",
      },
      {
        heading: "Real Examples of Smart Contracts",
        content:
          "Smart contracts power some amazing applications. <strong>Decentralized exchanges (DEXs)</strong> like Uniswap use smart contracts to let people trade tokens directly with each other. The smart contract holds tokens in a pool and automatically calculates exchange rates \u2014 no company running the exchange, just code. <strong>Lending protocols</strong> like Aave let you deposit crypto to earn interest or borrow crypto by putting up collateral. Smart contracts handle all the math, enforce the rules, and automatically liquidate loans if they become too risky. <strong>NFT marketplaces</strong> use smart contracts to handle the minting (creation) and trading of NFTs. When you buy an NFT, a smart contract transfers ownership to you and sends payment to the seller. <strong>Insurance</strong> is being reimagined with smart contracts. Imagine flight-delay insurance: a smart contract monitors flight data, and if your flight is delayed more than two hours, it automatically pays you \u2014 no claim forms, no waiting, no arguing with an insurance agent. <strong>DAOs (Decentralized Autonomous Organizations)</strong> use smart contracts to let groups of people make decisions and manage money by voting, all enforced by code. The possibilities are genuinely endless.",
      },
      {
        heading: "The Risks and Limitations",
        content:
          "Smart contracts are powerful, but they are not perfect. The biggest risk is <strong>bugs in the code</strong>. Since smart contracts are immutable, a bug can be exploited before anyone can fix it. In 2016, a bug in a smart contract called \"The DAO\" allowed a hacker to drain about $60 million worth of ETH. The Ethereum community was so shaken that they decided to essentially rewind the blockchain to undo the hack \u2014 a controversial decision that split Ethereum into two chains (Ethereum and Ethereum Classic). This is why smart contract <strong>auditing</strong> is such a big deal. Before deploying a contract that handles real money, developers hire security firms to review the code line by line, looking for vulnerabilities. Even so, hacks still happen \u2014 billions of dollars have been lost to smart contract exploits over the years. Another limitation is that smart contracts can only work with data that is on the blockchain. If a contract needs real-world data (like a sports score or a stock price), it relies on services called <strong>oracles</strong> that feed external data into the blockchain. If the oracle provides bad data, the contract will execute based on bad information. Despite these risks, smart contracts remain one of the most revolutionary ideas in technology. The key is understanding both their power and their limitations.",
      },
    ],
    quiz: [
      {
        question: "What is a smart contract?",
        options: [
          "A legal document signed digitally",
          "A program on a blockchain that executes automatically when conditions are met",
          "A special type of cryptocurrency",
          "A contract between two blockchain companies",
        ],
        correctIndex: 1,
        explanation:
          "A smart contract is a self-executing program stored on a blockchain that automatically carries out its rules when certain conditions are met.",
      },
      {
        question:
          "Why can't smart contracts be easily fixed if they have bugs?",
        options: [
          "The developers are too busy",
          "Only the government can authorize changes",
          "Once deployed on the blockchain, the code is immutable",
          "Smart contracts never have bugs",
        ],
        correctIndex: 2,
        explanation:
          "Smart contracts are immutable once deployed \u2014 the code cannot be changed. This creates trust but also means bugs cannot be patched after deployment.",
      },
      {
        question:
          "What is an oracle in the context of smart contracts?",
        options: [
          "A prediction about crypto prices",
          "A service that feeds real-world data into blockchain smart contracts",
          "A type of consensus mechanism",
          "The first smart contract ever created",
        ],
        correctIndex: 1,
        explanation:
          "Oracles are services that bring external, real-world data (like prices, weather, or sports scores) onto the blockchain so smart contracts can use it.",
      },
    ],
  },

  // ─── LESSON 14 ──────────────────────────────────────────────
  {
    id: 14,
    title: "Solidity Basics",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "Reading your first smart contract",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "What Is Solidity?",
        content:
          "If you want to build a website, you learn HTML, CSS, and JavaScript. If you want to build a smart contract on Ethereum, you learn <strong>Solidity</strong>. Solidity is a <em>programming language</em> specifically designed for writing smart contracts on the Ethereum blockchain (and any EVM-compatible chain). It was created in 2014 by Dr. Gavin Wood, one of the co-founders of Ethereum, and it has become the most popular language in the blockchain world. Solidity is influenced by JavaScript, Python, and C++, so if you have seen any of those languages, Solidity will look somewhat familiar. Even if you have never written a line of code in your life, do not worry \u2014 we are going to start very gently, focusing on <em>reading</em> smart contracts before we try writing them. Being able to read Solidity is a superpower. It means you can look at a smart contract before you interact with it and actually understand what it will do. Instead of blindly trusting that an app works correctly, you can verify it yourself. That is the whole spirit of blockchain \u2014 <strong>don't trust, verify</strong>.",
      },
      {
        heading: "Anatomy of a Smart Contract",
        content:
          "Let us look at the simplest possible smart contract and break it down piece by piece. <code>// SPDX-License-Identifier: MIT</code> \u2014 This first line is a comment that tells people which license the code uses. It does not affect how the code runs. <code>pragma solidity ^0.8.19;</code> \u2014 This line tells the computer which version of Solidity this contract was written for. Think of it like saying \"this book was written in English\" \u2014 it makes sure the right translator is used. The <code>^</code> symbol means \"this version or newer.\" <code>contract HelloWorld { }</code> \u2014 This is the actual contract. The word <code>contract</code> is like saying <code>class</code> in other programming languages. \"HelloWorld\" is the name we gave it (you can name it anything). The curly braces <code>{ }</code> hold everything that belongs to this contract \u2014 its data and its functions. Every Solidity smart contract follows this basic structure: a license identifier, a pragma version, and one or more <code>contract</code> blocks. Even the most complex DeFi protocols follow this same pattern \u2014 they just have a lot more code inside those curly braces.",
      },
      {
        heading: "Reading a Real Example",
        content:
          "Let us look at a slightly more interesting contract: <code>contract SimpleStorage { uint256 public storedNumber; function setNumber(uint256 _newNumber) public { storedNumber = _newNumber; } function getNumber() public view returns (uint256) { return storedNumber; } }</code> Let us read this like a story. <code>uint256 public storedNumber;</code> \u2014 This creates a variable called <code>storedNumber</code> that holds a positive whole number. <code>uint256</code> means \"unsigned integer, 256 bits\" \u2014 basically a very large positive number. <code>public</code> means anyone can read its value. <code>function setNumber(uint256 _newNumber) public</code> \u2014 This creates a function (an action the contract can perform) called <code>setNumber</code>. It takes one input: a number. When called, it sets <code>storedNumber</code> to whatever number you provide. <code>function getNumber() public view returns (uint256)</code> \u2014 This function <em>reads</em> the stored number and returns it. The word <code>view</code> means it only looks at data, it does not change anything (so it does not cost gas to call). That is it \u2014 a complete smart contract that stores a number and lets anyone read or change it. Simple, but it demonstrates the fundamental building blocks of every smart contract.",
      },
      {
        heading: "Key Solidity Concepts to Remember",
        content:
          "Before we move on, let us summarize the key concepts from this lesson. <strong>Pragma</strong>: the version declaration at the top of every Solidity file. It ensures the code is compiled with the right version of the Solidity language. <strong>Contract</strong>: the main building block, like a blueprint. Everything \u2014 variables, functions, logic \u2014 lives inside a contract. <strong>Variables</strong>: named containers that hold data. <code>uint256</code> holds positive numbers, <code>string</code> holds text, <code>address</code> holds Ethereum addresses, and <code>bool</code> holds true/false values. <strong>Functions</strong>: actions the contract can perform. They can change data on the blockchain (which costs gas) or just read data (which is free). <strong>Public</strong>: a visibility keyword meaning anyone can access that variable or call that function. There are other visibility levels (<code>private</code>, <code>internal</code>, <code>external</code>) that we will cover later. <strong>View</strong>: a keyword meaning the function only reads data and does not modify the blockchain state. You do not need to memorize all of this right now. The goal of this lesson was to make Solidity feel less alien and more like something you can actually read and understand. In the next lesson, we will dig deeper into functions and variables.",
      },
    ],
    quiz: [
      {
        question: "What is Solidity?",
        options: [
          "A type of cryptocurrency",
          "A programming language for writing Ethereum smart contracts",
          "A consensus mechanism",
          "A crypto wallet",
        ],
        correctIndex: 1,
        explanation:
          "Solidity is a programming language specifically designed for writing smart contracts on Ethereum and other EVM-compatible blockchains.",
      },
      {
        question: "What does 'pragma solidity ^0.8.19;' do?",
        options: [
          "Deploys the contract to the blockchain",
          "Specifies which version of Solidity the contract uses",
          "Creates a new variable",
          "Sends cryptocurrency to another address",
        ],
        correctIndex: 1,
        explanation:
          "The pragma statement declares which version of the Solidity compiler should be used to compile the contract.",
      },
      {
        question: "What does the 'view' keyword mean for a function?",
        options: [
          "The function can only be called once",
          "The function is hidden from the public",
          "The function only reads data and does not change anything",
          "The function requires a password to call",
        ],
        correctIndex: 2,
        explanation:
          "A 'view' function only reads data from the blockchain without modifying it. Because it does not change state, calling it does not cost gas.",
      },
    ],
  },

  // ─── LESSON 15 ──────────────────────────────────────────────
  {
    id: 15,
    title: "Functions & Variables",
    module: "Smart Contracts",
    moduleNumber: 3,
    subtitle: "How contracts store and process data",
    estimatedMinutes: 10,
    sections: [
      {
        heading: "Variables: The Contract's Memory",
        content:
          "Think of a smart contract like a robot with a notebook. The notebook is where the robot writes down things it needs to remember \u2014 that is what <strong>variables</strong> are. Each variable has a name, a type (what kind of data it holds), and a value. Solidity has several important variable types. <code>uint256</code> holds positive whole numbers (0, 1, 42, 1000000). The \"uint\" stands for \"unsigned integer\" \u2014 unsigned just means no negative numbers. <code>int256</code> holds whole numbers that <em>can</em> be negative (-5, 0, 100). <code>bool</code> holds either <code>true</code> or <code>false</code> \u2014 like a light switch, it is either on or off. <code>string</code> holds text, like <code>\"Hello, blockchain!\"</code>. <code>address</code> holds an Ethereum address (those <code>0x</code> strings we saw in MetaMask). This type is special to Solidity and does not exist in most other programming languages. Variables can be <strong>state variables</strong> (stored permanently on the blockchain, like writing in permanent ink) or <strong>local variables</strong> (temporary, used inside a function and then forgotten, like writing on a whiteboard that gets erased). State variables cost gas to change because the entire network has to update its records. Local variables are free because they only exist temporarily during a computation.",
      },
      {
        heading: "Functions: The Contract's Actions",
        content:
          "If variables are the contract's memory, <strong>functions</strong> are its actions \u2014 the things it can <em>do</em>. A function is a set of instructions that runs when someone calls it. Let us look at a function step by step: <code>function greet(string memory _name) public view returns (string memory)</code>. The word <code>function</code> tells Solidity we are defining an action. <code>greet</code> is the name we chose for this function. <code>(string memory _name)</code> is the <strong>parameter</strong> \u2014 the input the function needs. In this case, it expects a text string. The underscore before <code>_name</code> is a convention in Solidity to distinguish function inputs from state variables. <code>public</code> means anyone can call this function. <code>view</code> means it only reads data, does not change anything. <code>returns (string memory)</code> tells us the function will give back a text string as its output. The word <code>memory</code> means the string is temporary and will not be saved permanently. Functions that <strong>change</strong> data on the blockchain (like updating a stored number) are called <strong>write functions</strong>, and they cost gas. Functions that only <strong>read</strong> data (marked with <code>view</code> or <code>pure</code>) are free to call. This distinction matters because it determines whether a transaction needs to be sent (and paid for) or not.",
      },
      {
        heading: "Putting It Together: A Piggy Bank Contract",
        content:
          "Let us read a more fun example \u2014 a digital piggy bank: <code>contract PiggyBank { address public owner; uint256 public balance; constructor() { owner = msg.sender; balance = 0; } function deposit() public payable { balance = balance + msg.value; } function withdraw() public { require(msg.sender == owner, \"Only the owner can withdraw\"); payable(owner).transfer(balance); balance = 0; } }</code> Let us read this story. The contract has two state variables: <code>owner</code> (the address of whoever created it) and <code>balance</code> (how much money is inside). The <code>constructor()</code> is a special function that runs <em>once</em> when the contract is first deployed. It sets the owner to <code>msg.sender</code> \u2014 the person who deployed the contract. The <code>deposit()</code> function is marked <code>payable</code>, meaning it can receive ETH. When someone sends ETH to this function, <code>msg.value</code> captures how much they sent, and it gets added to the balance. The <code>withdraw()</code> function uses <code>require</code> to check a condition: is the person calling this function the owner? If not, it stops and shows an error message. If yes, it transfers the entire balance to the owner and resets to zero. This is a real working smart contract \u2014 simple, but it demonstrates variables, functions, access control, and value transfer.",
      },
      {
        heading: "Visibility and Access Control",
        content:
          "In the piggy bank example, you noticed that only the owner could withdraw money. This is called <strong>access control</strong>, and it is one of the most important concepts in smart contract development. Solidity gives you several tools for controlling who can do what. <strong>Visibility keywords</strong> control who can see and call a function or variable. <code>public</code> means anyone can access it \u2014 other contracts, external users, everyone. <code>private</code> means only the contract itself can access it \u2014 no outside calls allowed. <code>internal</code> is like private but also lets contracts that inherit from this one access it (inheritance is an advanced topic we will cover later). <code>external</code> means only outside callers can use it \u2014 the contract itself cannot call its own external functions directly. The <code>require()</code> statement we saw is another key tool. It checks a condition and <strong>reverts</strong> (cancels) the entire transaction if the condition is not met. This is how contracts enforce rules like \"only the owner can do this\" or \"you must send at least 1 ETH.\" Understanding visibility and access control is crucial because smart contracts handle real value. A mistake \u2014 like accidentally making a withdraw function public without an owner check \u2014 could let anyone drain the contract. Security starts with getting these basics right.",
      },
      {
        heading: "What Comes Next",
        content:
          "Congratulations \u2014 you have just completed the first half of this course! Let us recap what you have learned. In <strong>Module 1</strong>, you mastered the fundamentals: what blockchain is, how blocks link together with hashes, how consensus works, why decentralization matters, the difference between public and private chains, and real-world use cases. In <strong>Module 2</strong>, you got hands-on: you learned what cryptocurrency is, compared Bitcoin and Ethereum, understood wallets and keys, set up MetaMask, used testnets, and learned about gas fees. In <strong>Module 3</strong>, you started your journey into smart contracts: you understand what they are, how to read basic Solidity, and how functions and variables work together to create programs that run on the blockchain. In the second half of the course, you will build on all of this. You will learn about mappings and arrays, events, deploying your own contracts, ERC-20 tokens, NFT standards, DeFi concepts, security best practices, and how to build a simple decentralized application from scratch. You have already come incredibly far. The hardest part \u2014 building the foundation \u2014 is done. Everything from here builds on what you already know. Keep going!",
      },
    ],
    quiz: [
      {
        question:
          "What is the difference between a state variable and a local variable?",
        options: [
          "State variables are free, local variables cost gas",
          "State variables are stored permanently on the blockchain, local variables are temporary",
          "State variables can only hold numbers, local variables hold text",
          "There is no difference",
        ],
        correctIndex: 1,
        explanation:
          "State variables are stored permanently on the blockchain (like writing in permanent ink), while local variables exist only temporarily during a function's execution.",
      },
      {
        question: "What does the 'require()' statement do in Solidity?",
        options: [
          "It creates a new variable",
          "It deploys the contract to the blockchain",
          "It checks a condition and cancels the transaction if the condition fails",
          "It sends ETH to another address",
        ],
        correctIndex: 2,
        explanation:
          "require() checks a condition (like 'is this person the owner?') and reverts the entire transaction if the condition is not met, preventing unauthorized actions.",
      },
      {
        question: "What does the 'payable' keyword mean for a function?",
        options: [
          "The function costs extra gas to call",
          "The function can receive ETH along with the call",
          "The function pays the caller",
          "The function requires a subscription",
        ],
        correctIndex: 1,
        explanation:
          "The 'payable' keyword means a function is able to receive ETH. Without it, the function will reject any ETH sent to it.",
      },
    ],
  },
];

import { lessonsPartTwo } from "./lessons-part2";
export const lessons: Lesson[] = [...lessonsPartOne, ...lessonsPartTwo];
