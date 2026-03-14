/**
 * Platform Taxonomy — 4-layer hierarchy for platform discovery
 *
 * Layer 1: Cluster (broadest — e.g. "Work & Gig Economy")
 * Layer 2: Category (e.g. "Delivery Services")
 * Layer 3: Subcategory (e.g. "Grocery Delivery")
 * Layer 4: Platform (exact — e.g. "Instacart")
 */

export interface TaxonomyPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Subcategory {
  name: string;
  platforms: TaxonomyPlatform[];
}

export interface Category {
  name: string;
  subcategories: Subcategory[];
}

export interface Cluster {
  name: string;
  icon: string;
  color: string;
  categories: Category[];
}

export const taxonomy: Cluster[] = [
  {
    name: "Work & Gig Economy",
    icon: "WK",
    color: "bg-cyan-600",
    categories: [
      {
        name: "Delivery Services",
        subcategories: [
          {
            name: "Grocery Delivery",
            platforms: [
              { id: "instacart", name: "Instacart", icon: "IC", color: "bg-green-600" },
              { id: "shipt", name: "Shipt", icon: "SH", color: "bg-green-500" },
              { id: "amazon-fresh", name: "Amazon Fresh", icon: "AF", color: "bg-orange-500" },
              { id: "walmart-delivery", name: "Walmart+", icon: "WM", color: "bg-blue-600" },
            ],
          },
          {
            name: "Food Delivery",
            platforms: [
              { id: "doordash", name: "DoorDash", icon: "DD", color: "bg-red-600" },
              { id: "grubhub", name: "Grubhub", icon: "GH", color: "bg-orange-600" },
              { id: "uber-eats", name: "Uber Eats", icon: "UE", color: "bg-green-700" },
              { id: "postmates", name: "Postmates", icon: "PM", color: "bg-purple-600" },
              { id: "caviar", name: "Caviar", icon: "CV", color: "bg-amber-700" },
            ],
          },
          {
            name: "Package & Courier",
            platforms: [
              { id: "amazon-flex", name: "Amazon Flex", icon: "AX", color: "bg-orange-600" },
              { id: "gopuff", name: "Gopuff", icon: "GP", color: "bg-blue-500" },
              { id: "roadie", name: "Roadie", icon: "RD", color: "bg-red-500" },
              { id: "veho", name: "Veho", icon: "VH", color: "bg-indigo-600" },
            ],
          },
        ],
      },
      {
        name: "Rideshare",
        subcategories: [
          {
            name: "On-Demand Rides",
            platforms: [
              { id: "uber", name: "Uber", icon: "UB", color: "bg-gray-800" },
              { id: "lyft", name: "Lyft", icon: "LF", color: "bg-pink-600" },
              { id: "via", name: "Via", icon: "VI", color: "bg-blue-700" },
              { id: "alto", name: "Alto", icon: "AL", color: "bg-slate-700" },
            ],
          },
          {
            name: "Carpooling",
            platforms: [
              { id: "waze-carpool", name: "Waze Carpool", icon: "WC", color: "bg-teal-600" },
              { id: "blablacar", name: "BlaBlaCar", icon: "BB", color: "bg-blue-500" },
              { id: "scoop", name: "Scoop", icon: "SC", color: "bg-green-600" },
            ],
          },
        ],
      },
      {
        name: "Freelance & Tasks",
        subcategories: [
          {
            name: "Task Marketplace",
            platforms: [
              { id: "taskrabbit", name: "TaskRabbit", icon: "TR", color: "bg-emerald-600" },
              { id: "handy", name: "Handy", icon: "HN", color: "bg-blue-500" },
              { id: "thumbtack", name: "Thumbtack", icon: "TT", color: "bg-blue-600" },
              { id: "angi", name: "Angi", icon: "AN", color: "bg-red-500" },
            ],
          },
          {
            name: "Freelance Work",
            platforms: [
              { id: "fiverr", name: "Fiverr", icon: "FV", color: "bg-green-500" },
              { id: "upwork", name: "Upwork", icon: "UW", color: "bg-green-600" },
              { id: "toptal", name: "Toptal", icon: "TP", color: "bg-blue-700" },
              { id: "freelancer", name: "Freelancer", icon: "FL", color: "bg-sky-600" },
            ],
          },
          {
            name: "Creative Services",
            platforms: [
              { id: "99designs", name: "99designs", icon: "99", color: "bg-orange-500" },
              { id: "dribbble", name: "Dribbble", icon: "DR", color: "bg-pink-500" },
              { id: "behance", name: "Behance", icon: "BE", color: "bg-blue-600" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Business & Finance",
    icon: "BZ",
    color: "bg-blue-700",
    categories: [
      {
        name: "Banking",
        subcategories: [
          {
            name: "Traditional Banks",
            platforms: [
              { id: "chase", name: "Chase", icon: "CH", color: "bg-blue-800" },
              { id: "bofa", name: "Bank of America", icon: "BA", color: "bg-red-700" },
              { id: "wells-fargo", name: "Wells Fargo", icon: "WF", color: "bg-red-600" },
              { id: "citi", name: "Citibank", icon: "CT", color: "bg-blue-600" },
            ],
          },
          {
            name: "Digital Banks",
            platforms: [
              { id: "chime", name: "Chime", icon: "CM", color: "bg-green-500" },
              { id: "current", name: "Current", icon: "CU", color: "bg-green-600" },
              { id: "varo", name: "Varo", icon: "VR", color: "bg-teal-500" },
              { id: "sofi", name: "SoFi", icon: "SF", color: "bg-blue-500" },
            ],
          },
        ],
      },
      {
        name: "Payments",
        subcategories: [
          {
            name: "P2P Payments",
            platforms: [
              { id: "venmo", name: "Venmo", icon: "VN", color: "bg-blue-500" },
              { id: "cashapp", name: "Cash App", icon: "CA", color: "bg-green-500" },
              { id: "zelle", name: "Zelle", icon: "ZL", color: "bg-purple-600" },
              { id: "paypal", name: "PayPal", icon: "PP", color: "bg-blue-700" },
            ],
          },
          {
            name: "Business Payments",
            platforms: [
              { id: "stripe", name: "Stripe", icon: "ST", color: "bg-indigo-600" },
              { id: "square", name: "Square", icon: "SQ", color: "bg-gray-800" },
              { id: "shopify-pay", name: "Shopify Payments", icon: "SP", color: "bg-green-600" },
            ],
          },
        ],
      },
      {
        name: "Investing",
        subcategories: [
          {
            name: "Stock Trading",
            platforms: [
              { id: "robinhood", name: "Robinhood", icon: "RH", color: "bg-green-500" },
              { id: "webull", name: "Webull", icon: "WB", color: "bg-blue-600" },
              { id: "etrade", name: "E*TRADE", icon: "ET", color: "bg-purple-700" },
              { id: "fidelity", name: "Fidelity", icon: "FD", color: "bg-green-700" },
            ],
          },
          {
            name: "Crypto Exchanges",
            platforms: [
              { id: "coinbase", name: "Coinbase", icon: "CB", color: "bg-blue-600" },
              { id: "kraken", name: "Kraken", icon: "KR", color: "bg-purple-600" },
              { id: "gemini", name: "Gemini", icon: "GM", color: "bg-cyan-600" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Shopping & Retail",
    icon: "SH",
    color: "bg-orange-600",
    categories: [
      {
        name: "Online Marketplaces",
        subcategories: [
          {
            name: "General Shopping",
            platforms: [
              { id: "amazon", name: "Amazon", icon: "AZ", color: "bg-orange-500" },
              { id: "ebay", name: "eBay", icon: "EB", color: "bg-red-500" },
              { id: "walmart-online", name: "Walmart", icon: "WM", color: "bg-blue-600" },
              { id: "target", name: "Target", icon: "TG", color: "bg-red-600" },
            ],
          },
          {
            name: "Specialty & Resale",
            platforms: [
              { id: "etsy", name: "Etsy", icon: "ES", color: "bg-orange-600" },
              { id: "poshmark", name: "Poshmark", icon: "PK", color: "bg-red-400" },
              { id: "mercari", name: "Mercari", icon: "MC", color: "bg-red-500" },
              { id: "depop", name: "Depop", icon: "DP", color: "bg-red-600" },
            ],
          },
        ],
      },
      {
        name: "Grocery & Essentials",
        subcategories: [
          {
            name: "Grocery Stores",
            platforms: [
              { id: "kroger", name: "Kroger", icon: "KG", color: "bg-blue-700" },
              { id: "safeway", name: "Safeway", icon: "SW", color: "bg-red-600" },
              { id: "whole-foods", name: "Whole Foods", icon: "WH", color: "bg-green-700" },
              { id: "trader-joes", name: "Trader Joe's", icon: "TJ", color: "bg-red-700" },
            ],
          },
          {
            name: "Warehouse Clubs",
            platforms: [
              { id: "costco", name: "Costco", icon: "CO", color: "bg-red-600" },
              { id: "sams-club", name: "Sam's Club", icon: "SM", color: "bg-blue-700" },
              { id: "bjs", name: "BJ's", icon: "BJ", color: "bg-red-500" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Food & Dining",
    icon: "FD",
    color: "bg-red-600",
    categories: [
      {
        name: "Restaurants",
        subcategories: [
          {
            name: "Fast Food & Coffee",
            platforms: [
              { id: "starbucks", name: "Starbucks", icon: "SB", color: "bg-green-700" },
              { id: "mcdonalds", name: "McDonald's", icon: "MD", color: "bg-red-600" },
              { id: "chick-fil-a", name: "Chick-fil-A", icon: "CF", color: "bg-red-700" },
              { id: "chipotle", name: "Chipotle", icon: "CP", color: "bg-amber-700" },
            ],
          },
          {
            name: "Casual & Fine Dining",
            platforms: [
              { id: "opentable", name: "OpenTable", icon: "OT", color: "bg-red-500" },
              { id: "resy", name: "Resy", icon: "RS", color: "bg-gray-800" },
              { id: "yelp", name: "Yelp", icon: "YP", color: "bg-red-600" },
            ],
          },
        ],
      },
      {
        name: "Meal Services",
        subcategories: [
          {
            name: "Meal Kits",
            platforms: [
              { id: "hellofresh", name: "HelloFresh", icon: "HF", color: "bg-green-500" },
              { id: "blue-apron", name: "Blue Apron", icon: "BA", color: "bg-blue-600" },
              { id: "home-chef", name: "Home Chef", icon: "HC", color: "bg-orange-500" },
            ],
          },
          {
            name: "Prepared Meals",
            platforms: [
              { id: "factor", name: "Factor", icon: "FC", color: "bg-green-600" },
              { id: "freshly", name: "Freshly", icon: "FR", color: "bg-green-500" },
              { id: "daily-harvest", name: "Daily Harvest", icon: "DH", color: "bg-green-700" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Rewards & Loyalty",
    icon: "RW",
    color: "bg-amber-500",
    categories: [
      {
        name: "Cashback",
        subcategories: [
          {
            name: "Shopping Cashback",
            platforms: [
              { id: "rakuten", name: "Rakuten", icon: "RK", color: "bg-red-500" },
              { id: "ibotta", name: "Ibotta", icon: "IB", color: "bg-pink-500" },
              { id: "fetch", name: "Fetch Rewards", icon: "FE", color: "bg-orange-500" },
              { id: "dosh", name: "Dosh", icon: "DS", color: "bg-green-500" },
            ],
          },
          {
            name: "Credit Card Rewards",
            platforms: [
              { id: "chase-rewards", name: "Chase Rewards", icon: "CR", color: "bg-blue-800" },
              { id: "amex-rewards", name: "Amex Rewards", icon: "AR", color: "bg-blue-600" },
              { id: "capital-one-rewards", name: "Capital One Rewards", icon: "C1", color: "bg-red-600" },
            ],
          },
        ],
      },
      {
        name: "Points & Miles",
        subcategories: [
          {
            name: "Travel Loyalty",
            platforms: [
              { id: "delta-skymiles", name: "Delta SkyMiles", icon: "DL", color: "bg-blue-800" },
              { id: "united-miles", name: "United MileagePlus", icon: "UA", color: "bg-blue-600" },
              { id: "marriott-bonvoy", name: "Marriott Bonvoy", icon: "MB", color: "bg-red-700" },
              { id: "hilton-honors", name: "Hilton Honors", icon: "HH", color: "bg-blue-700" },
            ],
          },
          {
            name: "Earning Platforms",
            platforms: [
              { id: "swagbucks", name: "Swagbucks", icon: "SG", color: "bg-blue-500" },
              { id: "mypoints", name: "MyPoints", icon: "MP", color: "bg-green-600" },
              { id: "survey-junkie", name: "Survey Junkie", icon: "SJ", color: "bg-green-500" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Transportation",
    icon: "TR",
    color: "bg-indigo-600",
    categories: [
      {
        name: "Car Rental & Sharing",
        subcategories: [
          {
            name: "Peer-to-Peer",
            platforms: [
              { id: "turo", name: "Turo", icon: "TU", color: "bg-purple-600" },
              { id: "getaround", name: "Getaround", icon: "GA", color: "bg-teal-500" },
            ],
          },
          {
            name: "Traditional Rental",
            platforms: [
              { id: "enterprise", name: "Enterprise", icon: "EN", color: "bg-green-700" },
              { id: "hertz", name: "Hertz", icon: "HZ", color: "bg-yellow-500" },
              { id: "avis", name: "Avis", icon: "AV", color: "bg-red-600" },
            ],
          },
        ],
      },
      {
        name: "Micromobility",
        subcategories: [
          {
            name: "Scooters & Bikes",
            platforms: [
              { id: "lime", name: "Lime", icon: "LM", color: "bg-green-500" },
              { id: "bird", name: "Bird", icon: "BD", color: "bg-black" },
              { id: "spin", name: "Spin", icon: "SN", color: "bg-orange-500" },
              { id: "citibike", name: "Citi Bike", icon: "CI", color: "bg-blue-600" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Home Services",
    icon: "HM",
    color: "bg-teal-600",
    categories: [
      {
        name: "Cleaning & Maintenance",
        subcategories: [
          {
            name: "House Cleaning",
            platforms: [
              { id: "maidpro", name: "MaidPro", icon: "MP", color: "bg-blue-500" },
              { id: "molly-maid", name: "Molly Maid", icon: "MM", color: "bg-blue-600" },
              { id: "merry-maids", name: "Merry Maids", icon: "MR", color: "bg-yellow-500" },
            ],
          },
          {
            name: "Lawn & Garden",
            platforms: [
              { id: "lawn-love", name: "Lawn Love", icon: "LL", color: "bg-green-500" },
              { id: "taskeasily", name: "TaskEasy", icon: "TE", color: "bg-green-600" },
            ],
          },
        ],
      },
      {
        name: "Moving & Storage",
        subcategories: [
          {
            name: "Moving Help",
            platforms: [
              { id: "hireahelper", name: "HireAHelper", icon: "HA", color: "bg-orange-500" },
              { id: "bellhop", name: "Bellhop", icon: "BH", color: "bg-blue-600" },
              { id: "dolly", name: "Dolly", icon: "DY", color: "bg-green-500" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Entertainment",
    icon: "EN",
    color: "bg-purple-600",
    categories: [
      {
        name: "Streaming",
        subcategories: [
          {
            name: "Video Streaming",
            platforms: [
              { id: "netflix", name: "Netflix", icon: "NF", color: "bg-red-600" },
              { id: "disney-plus", name: "Disney+", icon: "D+", color: "bg-blue-700" },
              { id: "hulu", name: "Hulu", icon: "HU", color: "bg-green-500" },
              { id: "hbo-max", name: "Max", icon: "MX", color: "bg-purple-700" },
            ],
          },
          {
            name: "Music Streaming",
            platforms: [
              { id: "spotify", name: "Spotify", icon: "SP", color: "bg-green-600" },
              { id: "apple-music", name: "Apple Music", icon: "AM", color: "bg-red-500" },
              { id: "youtube-music", name: "YouTube Music", icon: "YM", color: "bg-red-600" },
            ],
          },
        ],
      },
      {
        name: "Gaming",
        subcategories: [
          {
            name: "Game Stores",
            platforms: [
              { id: "steam", name: "Steam", icon: "SM", color: "bg-gray-700" },
              { id: "epic-games", name: "Epic Games", icon: "EG", color: "bg-gray-800" },
              { id: "playstation", name: "PlayStation", icon: "PS", color: "bg-blue-700" },
              { id: "xbox", name: "Xbox", icon: "XB", color: "bg-green-600" },
            ],
          },
        ],
      },
      {
        name: "Events & Tickets",
        subcategories: [
          {
            name: "Ticketing",
            platforms: [
              { id: "ticketmaster", name: "Ticketmaster", icon: "TM", color: "bg-blue-600" },
              { id: "stubhub", name: "StubHub", icon: "SH", color: "bg-purple-600" },
              { id: "seatgeek", name: "SeatGeek", icon: "SG", color: "bg-green-500" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Health & Wellness",
    icon: "HW",
    color: "bg-emerald-600",
    categories: [
      {
        name: "Fitness",
        subcategories: [
          {
            name: "Gym & Classes",
            platforms: [
              { id: "classpass", name: "ClassPass", icon: "CP", color: "bg-blue-600" },
              { id: "peloton", name: "Peloton", icon: "PL", color: "bg-red-600" },
              { id: "planet-fitness", name: "Planet Fitness", icon: "PF", color: "bg-purple-600" },
              { id: "equinox", name: "Equinox", icon: "EQ", color: "bg-gray-800" },
            ],
          },
        ],
      },
      {
        name: "Healthcare",
        subcategories: [
          {
            name: "Telehealth & Pharmacy",
            platforms: [
              { id: "zocdoc", name: "Zocdoc", icon: "ZD", color: "bg-yellow-500" },
              { id: "goodrx", name: "GoodRx", icon: "GR", color: "bg-yellow-400" },
              { id: "teladoc", name: "Teladoc", icon: "TD", color: "bg-purple-600" },
              { id: "capsule", name: "Capsule", icon: "CP", color: "bg-blue-500" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Education",
    icon: "ED",
    color: "bg-sky-600",
    categories: [
      {
        name: "Online Learning",
        subcategories: [
          {
            name: "Course Platforms",
            platforms: [
              { id: "coursera", name: "Coursera", icon: "CS", color: "bg-blue-600" },
              { id: "udemy", name: "Udemy", icon: "UD", color: "bg-purple-600" },
              { id: "skillshare", name: "Skillshare", icon: "SS", color: "bg-green-600" },
              { id: "linkedin-learning", name: "LinkedIn Learning", icon: "LL", color: "bg-blue-700" },
            ],
          },
          {
            name: "Tutoring",
            platforms: [
              { id: "wyzant", name: "Wyzant", icon: "WZ", color: "bg-orange-500" },
              { id: "chegg", name: "Chegg", icon: "CG", color: "bg-orange-600" },
              { id: "varsity-tutors", name: "Varsity Tutors", icon: "VT", color: "bg-red-500" },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Flatten taxonomy to get all platforms
 */
export function getAllPlatforms(): TaxonomyPlatform[] {
  const platforms: TaxonomyPlatform[] = [];
  for (const cluster of taxonomy) {
    for (const category of cluster.categories) {
      for (const sub of category.subcategories) {
        platforms.push(...sub.platforms);
      }
    }
  }
  return platforms;
}

/**
 * Find a platform by ID anywhere in the taxonomy
 */
export function findPlatformById(id: string): (TaxonomyPlatform & { cluster: string; category: string; subcategory: string }) | null {
  for (const cluster of taxonomy) {
    for (const category of cluster.categories) {
      for (const sub of category.subcategories) {
        const platform = sub.platforms.find((p) => p.id === id);
        if (platform) {
          return { ...platform, cluster: cluster.name, category: category.name, subcategory: sub.name };
        }
      }
    }
  }
  return null;
}
