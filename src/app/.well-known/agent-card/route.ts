export const dynamic = 'force-static';

const BODY = "{\n  \"name\": \"FishXCode Documentation Assistant\",\n  \"version\": \"1.0.0\",\n  \"description\": \"Discover FishXCode models, pricing, service status, and integration guides.\",\n  \"supportedInterfaces\": [\n    {\n      \"url\": \"https://docs.fishxcode.com/.well-known/mcp/server-card.json\",\n      \"transport\": \"streamable-http\"\n    }\n  ],\n  \"capabilities\": {\n    \"streaming\": true,\n    \"pushNotifications\": false,\n    \"stateTransitionHistory\": false\n  },\n  \"skills\": [\n    {\n      \"id\": \"model-pricing\",\n      \"name\": \"Model pricing\",\n      \"description\": \"Find current FishXCode model pricing.\"\n    },\n    {\n      \"id\": \"service-status\",\n      \"name\": \"Service status\",\n      \"description\": \"Check FishXCode service and model status.\"\n    },\n    {\n      \"id\": \"client-setup\",\n      \"name\": \"Client setup\",\n      \"description\": \"Find integration guides for AI clients.\"\n    }\n  ]\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
