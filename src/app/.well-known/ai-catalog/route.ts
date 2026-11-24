export const dynamic = 'force-static';

const BODY = "{\n  \"specVersion\": \"1.0\",\n  \"host\": {\n    \"displayName\": \"FishXCode\",\n    \"identifier\": \"did:web:docs.fishxcode.com\"\n  },\n  \"entries\": [\n    {\n      \"identifier\": \"urn:air:docs.fishxcode.com:server:docs\",\n      \"displayName\": \"FishXCode Documentation Catalog\",\n      \"type\": \"text/plain\",\n      \"url\": \"https://docs.fishxcode.com/llms.txt\",\n      \"representativeQueries\": [\n        \"how to configure Claude Code with FishXCode\",\n        \"what models are available on FishXCode\",\n        \"how much does Claude cost on FishXCode\"\n      ]\n    },\n    {\n      \"identifier\": \"urn:air:docs.fishxcode.com:api:pricing\",\n      \"displayName\": \"FishXCode Pricing API\",\n      \"type\": \"application/json\",\n      \"url\": \"https://docs.fishxcode.com/api/pricing\",\n      \"representativeQueries\": [\n        \"what is the current model price\",\n        \"show FishXCode pricing per million tokens\",\n        \"check the price of GPT or Claude models\"\n      ]\n    },\n    {\n      \"identifier\": \"urn:air:docs.fishxcode.com:api:status\",\n      \"displayName\": \"FishXCode Status Data API\",\n      \"type\": \"application/json\",\n      \"url\": \"https://docs.fishxcode.com/api/status-data/status\",\n      \"representativeQueries\": [\n        \"is FishXCode operating normally\",\n        \"check service status\",\n        \"show recent model availability\"\n      ]\n    }\n  ]\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
