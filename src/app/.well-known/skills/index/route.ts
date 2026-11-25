export const dynamic = 'force-static';

const BODY = "{\n  \"$schema\": \"https://schemas.agentskills.io/discovery/0.2.0/schema.json\",\n  \"skills\": [\n    {\n      \"name\": \"fishxcode-docs\",\n      \"type\": \"skill-md\",\n      \"description\": \"Use FishXCode documentation to answer questions about models, pricing, status, and client setup.\",\n      \"url\": \"https://docs.fishxcode.com/llms.txt\",\n      \"digest\": \"sha256:63d85a1736ff74cb0d1be34d6f0c3298a40439549bb09a251218a6414ff0fbe9\"\n    }\n  ]\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
