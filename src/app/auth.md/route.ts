export const dynamic = 'force-static';

const BODY = `# auth.md

FishXCode 文档站向 AI 代理开放公开文档、状态与定价发现能力。当前代理接入使用 API Key；本文只描述公开注册与凭据使用方式，不包含任何真实密钥。

## 代理受众

- 在客户端中调用 FishXCode 兼容 OpenAI / Anthropic API 的 AI 代理。
- 读取文档、模型价格与公开状态数据的自动化助手。

## 注册与凭据开通

- 注册入口：https://fishxcode.com/register?aff=9CTW
- 控制台：https://fishxcode.com/console
- 方式：在控制台注册账户、创建 API Key，并在使用前确认账户额度。
- 发现元数据中的 register_uri 指向上述注册入口；被动扫描不会替代理创建账户或签发密钥。

## 支持的认证方式

- API Key / Bearer Token：在请求头中传递，使用 \`Authorization: Bearer <API_KEY>\`。
- 兼容端点：OpenAI 兼容 \`https://api.fishxcode.com/v1\`；Anthropic 兼容 \`https://fishxcode.com/v1\`。

## 凭据安全

- 不要把 API Key 写入公开文档、客户端仓库或 discovery 文件。
- 密钥泄露时请立即在控制台轮换或吊销。
- 只向 FishXCode 官方域名发送凭据；如客户端支持，请限制权限与额度。

## 机器可读入口

- OAuth/OIDC 与 agent_auth：https://docs.fishxcode.com/.well-known/oauth-authorization-server
- 受保护资源元数据：https://docs.fishxcode.com/.well-known/oauth-protected-resource
- API catalog：https://docs.fishxcode.com/.well-known/api-catalog
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
