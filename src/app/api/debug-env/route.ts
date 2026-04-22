export async function GET() {
  return Response.json({
    EARLY_ACCESS_MODE: process.env.EARLY_ACCESS_MODE,
    NODE_ENV: process.env.NODE_ENV,
  });
}
