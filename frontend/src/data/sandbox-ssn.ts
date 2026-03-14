/**
 * Sandbox SSN Database for OmnID Demo
 *
 * IMPORTANT: These are FAKE SSNs for demo/testing purposes only.
 * Real SSNs should NEVER be stored in code, databases, or on blockchain.
 *
 * In the demo:
 * 1. User enters a test SSN in the browser
 * 2. Browser looks it up in this sandbox database
 * 3. Only the VERIFIED AGE is sent to the blockchain
 * 4. The SSN never leaves the browser
 */

export interface SandboxPerson {
  ssn: string;
  name: string;
  birthdate: string; // YYYY-MM-DD
  age: number;
  city: string;
  state: string;
}

// Calculate age from birthdate
function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const sandboxDatabase: SandboxPerson[] = [
  {
    ssn: "123-45-6789",
    name: "Alice Johnson",
    birthdate: "2013-06-15",
    age: calculateAge("2013-06-15"), // ~12
    city: "Austin",
    state: "TX",
  },
  {
    ssn: "234-56-7890",
    name: "Bob Chen",
    birthdate: "2009-03-22",
    age: calculateAge("2009-03-22"), // ~16
    city: "San Jose",
    state: "CA",
  },
  {
    ssn: "345-67-8901",
    name: "Carol Martinez",
    birthdate: "2010-11-08",
    age: calculateAge("2010-11-08"), // ~15
    city: "Miami",
    state: "FL",
  },
  {
    ssn: "456-78-9012",
    name: "David Kim",
    birthdate: "2005-01-30",
    age: calculateAge("2005-01-30"), // ~21
    city: "Seattle",
    state: "WA",
  },
  {
    ssn: "567-89-0123",
    name: "Emma Williams",
    birthdate: "2014-09-12",
    age: calculateAge("2014-09-12"), // ~11
    city: "Chicago",
    state: "IL",
  },
  {
    ssn: "678-90-1234",
    name: "Frank Patel",
    birthdate: "2000-07-04",
    age: calculateAge("2000-07-04"), // ~25
    city: "New York",
    state: "NY",
  },
  {
    ssn: "789-01-2345",
    name: "Grace Lee",
    birthdate: "2012-12-25",
    age: calculateAge("2012-12-25"), // ~13
    city: "Portland",
    state: "OR",
  },
  {
    ssn: "890-12-3456",
    name: "Henry Thompson",
    birthdate: "1995-04-18",
    age: calculateAge("1995-04-18"), // ~30
    city: "Denver",
    state: "CO",
  },
];

/**
 * Look up a person by SSN in the sandbox database.
 * Returns null if not found.
 *
 * NOTE: In a real system, this lookup would happen on a secure
 * backend server, not in the browser. For the demo, we simulate
 * it client-side.
 */
export function lookupSSN(ssn: string): SandboxPerson | null {
  // Normalize: remove spaces, ensure dashes
  const normalized = ssn.trim().replace(/\s/g, "");
  return sandboxDatabase.find((p) => p.ssn === normalized) ?? null;
}

/**
 * Verify age from SSN without revealing any other data.
 * Returns the person's age if found, null if SSN not in database.
 */
export function verifyAgeFromSSN(ssn: string): number | null {
  const person = lookupSSN(ssn);
  return person ? person.age : null;
}
