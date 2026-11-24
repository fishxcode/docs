export const dynamic = 'force-static';

const BODY = "{\n  \"serverInfo\": {\n    \"name\": \"FishXCode Documentation\",\n    \"version\": \"1.0.0\"\n  },\n  \"endpoint\": \"https://docs.fishxcode.com/mcp\",\n  \"transport\": {\n    \"type\": \"streamable-http\",\n    \"endpoint\": \"https://docs.fishxcode.com/mcp\"\n  },\n  \"capabilities\": {\n    \"tools\": true,\n    \"resources\": true,\n    \"prompts\": true\n  }\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
