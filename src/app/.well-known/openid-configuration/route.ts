export const dynamic = 'force-static';

const BODY = "{\n  \"issuer\": \"https://docs.fishxcode.com\",\n  \"authorization_endpoint\": \"https://fishxcode.com/console\",\n  \"token_endpoint\": \"https://fishxcode.com/console\",\n  \"jwks_uri\": \"https://fishxcode.com/.well-known/jwks.json\",\n  \"response_types_supported\": [\n    \"code\"\n  ],\n  \"grant_types_supported\": [\n    \"authorization_code\",\n    \"client_credentials\"\n  ],\n  \"subject_types_supported\": [\n    \"public\"\n  ],\n  \"id_token_signing_alg_values_supported\": [\n    \"RS256\"\n  ],\n  \"scopes_supported\": [\n    \"openid\",\n    \"profile\",\n    \"email\",\n    \"models:read\",\n    \"usage:read\"\n  ],\n  \"token_endpoint_auth_methods_supported\": [\n    \"client_secret_post\"\n  ],\n  \"agent_auth\": {\n    \"skill\": \"https://docs.fishxcode.com/auth.md\",\n    \"register_uri\": \"https://fishxcode.com/register?aff=9CTW\",\n    \"identity_types_supported\": [\n      \"anonymous\"\n    ],\n    \"anonymous\": {\n      \"credential_types_supported\": [\n        \"api_key\"\n      ]\n    },\n    \"claim_uri\": \"https://fishxcode.com/console\",\n    \"revocation_uri\": \"https://fishxcode.com/console\"\n  }\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
