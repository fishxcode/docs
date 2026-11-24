export const dynamic = 'force-static';

const BODY = "{\n  \"protocol_version\": \"0.1\",\n  \"organization\": {\n    \"name\": \"FishXCode\",\n    \"domain\": \"fishxcode.com\"\n  },\n  \"web\": {}\n}";

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
