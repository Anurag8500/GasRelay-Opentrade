import "dotenv/config";

const GASRELAY_TREASURY_SECRET = process.env.GASRELAY_TREASURY_SECRET as string;
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HORIZON_URL = "https://horizon-testnet.stellar.org";

if (!GASRELAY_TREASURY_SECRET) {
  throw new Error("Fatal error: GASRELAY_TREASURY_SECRET is not set in environment variables");
}

export { GASRELAY_TREASURY_SECRET, PORT, HORIZON_URL };
