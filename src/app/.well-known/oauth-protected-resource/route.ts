export const dynamic = 'force-static';

const BODY = "{\n  \"resource\": \"https://api.fishxcode.com/v1\",\n  \"authorization_servers\": [\n    \"https://docs.fishxcode.com\"\n  ],\n  \"scopes_supported\": [\n    \"models:read\",\n    \"usage:read\"\n  ],\n  \"bearer_methods_supported\": [\n    \"header\"\n  ],\n  \"resource_name\": \"FishXCode API\"\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
