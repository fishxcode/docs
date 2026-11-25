import type { Locale } from './i18n';

/**
 * /auth.md 与 /ai.txt 的多语言正文。
 *
 * 这两处都是面向 AI 代理/爬虫的纯文本入口，URL、域名、API Key、Bearer、
 * Authorization 等技术词与链接在各语言中原样保留，只翻译叙述性文字。
 * 字符串用模板字面量书写，正文里的行内代码反引号写为 \` 以免提前收束。
 * Record<Locale> 会在编译期拦住遗漏语言。
 */

/** /auth.md 正文。zh 与原 route.ts 中的 BODY 一致。 */
export const AUTH_MD: Record<Locale, string> = {
  zh: `# auth.md

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
`,
  en: `# auth.md

The FishXCode documentation site exposes public docs, status, and pricing discovery capabilities to AI agents. Agent access currently uses an API Key; this document describes only public registration and credential usage, and contains no real secrets.

## Intended audience

- AI agents that call FishXCode's OpenAI / Anthropic-compatible APIs from client applications.
- Automated assistants that read documentation, model pricing, and public status data.

## Registration and credential provisioning

- Registration: https://fishxcode.com/register?aff=9CTW
- Console: https://fishxcode.com/console
- Method: register an account in the console, create an API Key, and confirm your account balance before use.
- The register_uri in the discovery metadata points to the registration URL above; passive scanning will not create an account or issue a key on behalf of an agent.

## Supported authentication methods

- API Key / Bearer Token: pass it in the request header with \`Authorization: Bearer <API_KEY>\`.
- Compatible endpoints: OpenAI-compatible \`https://api.fishxcode.com/v1\`; Anthropic-compatible \`https://fishxcode.com/v1\`.

## Credential security

- Do not write the API Key into public documentation, client repositories, or discovery files.
- If a key is leaked, rotate or revoke it immediately in the console.
- Only send credentials to official FishXCode domains; if your client supports it, restrict permissions and quotas.

## Machine-readable endpoints

- OAuth/OIDC and agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Protected resource metadata: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- API catalog: https://docs.fishxcode.com/.well-known/api-catalog
`,
  fr: `# auth.md

Le site de documentation FishXCode offre aux agents IA des capacités de découverte de la documentation publique, de l'état et de la tarification. L'accès des agents utilise actuellement une clé API ; ce document décrit uniquement l'enregistrement public et l'utilisation des identifiants, et ne contient aucune clé réelle.

## Public cible

- Agents IA qui appellent les API compatibles OpenAI / Anthropic de FishXCode depuis des applications clientes.
- Assistants automatisés qui lisent la documentation, les tarifs des modèles et les données d'état publiques.

## Enregistrement et obtention des identifiants

- Inscription : https://fishxcode.com/register?aff=9CTW
- Console : https://fishxcode.com/console
- Méthode : créez un compte dans la console, générez une clé API et vérifiez le solde de votre compte avant utilisation.
- Le register_uri dans les métadonnées de découverte pointe vers l'URL d'inscription ci-dessus ; une analyse passive ne créera pas de compte ni ne délivrera de clé pour le compte d'un agent.

## Méthodes d'authentification prises en charge

- Clé API / Jeton Bearer : transmettez-la dans l'en-tête de la requête avec \`Authorization: Bearer <API_KEY>\`.
- Points de terminaison compatibles : compatible OpenAI \`https://api.fishxcode.com/v1\` ; compatible Anthropic \`https://fishxcode.com/v1\`.

## Sécurité des identifiants

- N'écrivez pas la clé API dans une documentation publique, un dépôt client ou un fichier de découverte.
- En cas de fuite de la clé, effectuez immédiatement une rotation ou une révocation dans la console.
- N'envoyez les identifiants qu'aux domaines officiels de FishXCode ; si votre client le prend en charge, limitez les autorisations et les quotas.

## Points de terminaison lisibles par machine

- OAuth/OIDC et agent_auth : https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Métadonnées de la ressource protégée : https://docs.fishxcode.com/.well-known/oauth-protected-resource
- Catalogue d'API : https://docs.fishxcode.com/.well-known/api-catalog
`,
  es: `# auth.md

El sitio de documentación de FishXCode ofrece a los agentes de IA capacidades de descubrimiento de documentación pública, estado y precios. El acceso de los agentes utiliza actualmente una clave API; este documento describe únicamente el registro público y el uso de credenciales, y no contiene ninguna clave real.

## Público al que va dirigido

- Agentes de IA que llaman a las API compatibles con OpenAI / Anthropic de FishXCode desde aplicaciones cliente.
- Asistentes automatizados que leen documentación, precios de modelos y datos de estado públicos.

## Registro y provisión de credenciales

- Registro: https://fishxcode.com/register?aff=9CTW
- Consola: https://fishxcode.com/console
- Método: registre una cuenta en la consola, cree una clave API y confirme el saldo de su cuenta antes de usarla.
- El register_uri en los metadatos de descubrimiento apunta a la URL de registro indicada arriba; un escaneo pasivo no creará una cuenta ni emitirá una clave en nombre de un agente.

## Métodos de autenticación admitidos

- Clave API / Token Bearer: pásela en la cabecera de la solicitud con \`Authorization: Bearer <API_KEY>\`.
- Endpoints compatibles: compatible con OpenAI \`https://api.fishxcode.com/v1\`; compatible con Anthropic \`https://fishxcode.com/v1\`.

## Seguridad de las credenciales

- No escriba la clave API en documentación pública, repositorios de cliente ni archivos de descubrimiento.
- Si se filtra la clave, rótela o revóquela de inmediato en la consola.
- Envíe credenciales solo a dominios oficiales de FishXCode; si su cliente lo admite, limite los permisos y las cuotas.

## Puntos de acceso legibles por máquina

- OAuth/OIDC y agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Metadatos del recurso protegido: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- Catálogo de API: https://docs.fishxcode.com/.well-known/api-catalog
`,
  pt: `# auth.md

O site de documentação do FishXCode oferece a agentes de IA recursos de descoberta de documentação pública, status e preços. O acesso dos agentes usa atualmente uma chave de API; este documento descreve apenas o registro público e o uso de credenciais, e não contém nenhuma chave real.

## Público-alvo

- Agentes de IA que chamam as APIs compatíveis com OpenAI / Anthropic do FishXCode em aplicações cliente.
- Assistentes automatizados que leem documentação, preços de modelos e dados públicos de status.

## Registro e emissão de credenciais

- Registro: https://fishxcode.com/register?aff=9CTW
- Console: https://fishxcode.com/console
- Método: registre uma conta no console, crie uma chave de API e confirme o saldo da conta antes de usar.
- O register_uri nos metadados de descoberta aponta para o endereço de registro acima; uma varredura passiva não criará uma conta nem emitirá uma chave em nome de um agente.

## Métodos de autenticação compatíveis

- Chave de API / Token Bearer: envie no cabeçalho da requisição com \`Authorization: Bearer <API_KEY>\`.
- Endpoints compatíveis: compatível com OpenAI \`https://api.fishxcode.com/v1\`; compatível com Anthropic \`https://fishxcode.com/v1\`.

## Segurança das credenciais

- Não escreva a chave de API em documentação pública, repositórios de cliente nem arquivos de descoberta.
- Se a chave vazar, gire ou revogue-a imediatamente no console.
- Envie credenciais apenas para domínios oficiais do FishXCode; se o cliente permitir, limite permissões e cotas.

## Endpoints legíveis por máquina

- OAuth/OIDC e agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Metadados do recurso protegido: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- Catálogo de API: https://docs.fishxcode.com/.well-known/api-catalog
`,
  ru: `# auth.md

Сайт документации FishXCode предоставляет ИИ-агентам возможность обнаруживать публичную документацию, статус и информацию о ценах. В настоящее время доступ агентов осуществляется с помощью API Key; в этом документе описаны только публичная регистрация и использование учётных данных, и он не содержит реальных ключей.

## Целевая аудитория

- ИИ-агенты, которые вызывают совместимые с OpenAI / Anthropic API FishXCode из клиентских приложений.
- Автоматизированные помощники, читающие документацию, цены на модели и публичные данные о статусе.

## Регистрация и получение учётных данных

- Регистрация: https://fishxcode.com/register?aff=9CTW
- Консоль: https://fishxcode.com/console
- Способ: зарегистрируйте учётную запись в консоли, создайте API Key и проверьте баланс счёта перед использованием.
- register_uri в метаданных обнаружения указывает на адрес регистрации выше; пассивное сканирование не создаст учётную запись и не выпустит ключ от имени агента.

## Поддерживаемые методы аутентификации

- API Key / Bearer Token: передавайте его в заголовке запроса с помощью \`Authorization: Bearer <API_KEY>\`.
- Совместимые конечные точки: совместимая с OpenAI \`https://api.fishxcode.com/v1\`; совместимая с Anthropic \`https://fishxcode.com/v1\`.

## Безопасность учётных данных

- Не записывайте API Key в публичную документацию, клиентские репозитории или файлы обнаружения.
- При утечке ключа немедленно ротируйте или отзовите его в консоли.
- Отправляйте учётные данные только на официальные домены FishXCode; если клиент поддерживает, ограничьте права и лимиты.

## Машиночитаемые конечные точки

- OAuth/OIDC и agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Метаданные защищённого ресурса: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- Каталог API: https://docs.fishxcode.com/.well-known/api-catalog
`,
  ja: `# auth.md

FishXCode ドキュメントサイトは、AI エージェントに対して公開ドキュメント、ステータス、価格情報の検出機能を提供します。現在、エージェントのアクセスには API Key を使用します。本文では公開登録と認証情報の使用方法のみを説明し、実際の鍵は一切含まれていません。

## 対象読者

- クライアントアプリケーションから FishXCode の OpenAI / Anthropic 互換 API を呼び出す AI エージェント。
- ドキュメント、モデルの価格、公開ステータスデータを読み取る自動アシスタント。

## 登録と認証情報の発行

- 登録: https://fishxcode.com/register?aff=9CTW
- コンソール: https://fishxcode.com/console
- 方法: コンソールでアカウントを登録し、API Key を作成し、使用前にアカウントの残高を確認してください。
- 検出メタデータの register_uri は上記の登録先を指します。受動的なスキャンでは、エージェントに代わってアカウントを作成したり鍵を発行したりすることはありません。

## サポートされている認証方式

- API Key / Bearer Token: \`Authorization: Bearer <API_KEY>\` のようにリクエストヘッダーで渡します。
- 互換エンドポイント: OpenAI 互換 \`https://api.fishxcode.com/v1\`、Anthropic 互換 \`https://fishxcode.com/v1\`。

## 認証情報のセキュリティ

- API Key を公開ドキュメント、クライアントのリポジトリ、discovery ファイルに書き込まないでください。
- 鍵が漏洩した場合は、直ちにコンソールでローテーションまたは無効化してください。
- 認証情報は FishXCode の公式ドメインにのみ送信してください。クライアントが対応していれば、権限と割り当てを制限してください。

## 機械可読なエンドポイント

- OAuth/OIDC と agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- 保護対象リソースのメタデータ: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- API catalog: https://docs.fishxcode.com/.well-known/api-catalog
`,
  vi: `# auth.md

Trang tài liệu FishXCode cung cấp cho các tác nhân AI khả năng khám phá tài liệu công khai, trạng thái và bảng giá. Hiện tại, việc truy cập của tác nhân sử dụng API Key; tài liệu này chỉ mô tả việc đăng ký công khai và sử dụng thông tin xác thực, không chứa bất kỳ khóa thực nào.

## Đối tượng độc giả

- Các tác nhân AI gọi API tương thích OpenAI / Anthropic của FishXCode từ ứng dụng client.
- Các trợ lý tự động đọc tài liệu, giá mô hình và dữ liệu trạng thái công khai.

## Đăng ký và cấp thông tin xác thực

- Đăng ký: https://fishxcode.com/register?aff=9CTW
- Bảng điều khiển: https://fishxcode.com/console
- Cách thức: đăng ký tài khoản trong bảng điều khiển, tạo API Key và xác nhận số dư tài khoản trước khi sử dụng.
- register_uri trong siêu dữ liệu khám phá trỏ đến địa chỉ đăng ký ở trên; việc quét thụ động sẽ không tạo tài khoản hay cấp khóa thay cho tác nhân.

## Phương thức xác thực được hỗ trợ

- API Key / Bearer Token: truyền trong tiêu đề yêu cầu bằng \`Authorization: Bearer <API_KEY>\`.
- Điểm cuối tương thích: tương thích OpenAI \`https://api.fishxcode.com/v1\`; tương thích Anthropic \`https://fishxcode.com/v1\`.

## Bảo mật thông tin xác thực

- Không ghi API Key vào tài liệu công khai, kho mã nguồn client hay tệp discovery.
- Nếu khóa bị lộ, hãy ngay lập tức xoay vòng hoặc thu hồi trong bảng điều khiển.
- Chỉ gửi thông tin xác thực đến các tên miền chính thức của FishXCode; nếu client hỗ trợ, hãy giới hạn quyền và hạn mức.

## Điểm cuối có thể đọc bằng máy

- OAuth/OIDC và agent_auth: https://docs.fishxcode.com/.well-known/oauth-authorization-server
- Siêu dữ liệu tài nguyên được bảo vệ: https://docs.fishxcode.com/.well-known/oauth-protected-resource
- Danh mục API: https://docs.fishxcode.com/.well-known/api-catalog
`,
  'zh-TW': `# auth.md

FishXCode 文件站向 AI 代理開放公開文件、狀態與定價探索能力。目前代理接入使用 API Key；本文僅描述公開註冊與憑證使用方式，不包含任何真實金鑰。

## 代理受眾

- 在用戶端中呼叫 FishXCode 相容 OpenAI / Anthropic API 的 AI 代理。
- 讀取文件、模型價格與公開狀態資料的自動化助理。

## 註冊與憑證開通

- 註冊入口：https://fishxcode.com/register?aff=9CTW
- 控制台：https://fishxcode.com/console
- 方式：在控制台註冊帳戶、建立 API Key，並在使用前確認帳戶額度。
- 探索中繼資料中的 register_uri 指向上述註冊入口；被動掃描不會替代理建立帳戶或簽發金鑰。

## 支援的驗證方式

- API Key / Bearer Token：在請求標頭中傳遞，使用 \`Authorization: Bearer <API_KEY>\`。
- 相容端點：OpenAI 相容 \`https://api.fishxcode.com/v1\`；Anthropic 相容 \`https://fishxcode.com/v1\`。

## 憑證安全

- 不要把 API Key 寫入公開文件、用戶端儲存庫或 discovery 檔案。
- 金鑰洩漏時請立即在控制台輪替或撤銷。
- 只向 FishXCode 官方網域傳送憑證；如用戶端支援，請限制權限與額度。

## 機器可讀入口

- OAuth/OIDC 與 agent_auth：https://docs.fishxcode.com/.well-known/oauth-authorization-server
- 受保護資源中繼資料：https://docs.fishxcode.com/.well-known/oauth-protected-resource
- API catalog：https://docs.fishxcode.com/.well-known/api-catalog
`,
};

/** /ai.txt 正文。Content-Signal 一行与注释/空行结构各语言保持一致。 */
export const AI_TXT: Record<Locale, string> = {
  zh: `FishXCode 文件（https://docs.fishxcode.com）：面向 AI 爬虫与 AI 应用的说明。

AI 爬虫可以抓取、索引并引用本站文件。
本文件可用于 AI 训练；请注明来源并链接到原始页面。
参见文件索引：https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  en: `FishXCode Docs (https://docs.fishxcode.com): notes for AI crawlers and AI applications.

AI crawlers may crawl, index, and cite the documentation on this site.
The documentation may be used for AI training; please attribute the source and link to the original page.
See the documentation index: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  fr: `Docs FishXCode (https://docs.fishxcode.com) : notes pour les robots d'exploration IA et les applications IA.

Les robots d'exploration IA peuvent explorer, indexer et citer la documentation de ce site.
La documentation peut être utilisée pour l'entraînement de l'IA ; veuillez indiquer la source et renvoyer vers la page d'origine.
Voir l'index de la documentation : https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  es: `Documentación de FishXCode (https://docs.fishxcode.com): notas para rastreadores de IA y aplicaciones de IA.

Los rastreadores de IA pueden rastrear, indexar y citar la documentación de este sitio.
La documentación puede utilizarse para entrenar IA; indique la fuente y enlace a la página original.
Consulte el índice de documentación: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  pt: `Documentação FishXCode (https://docs.fishxcode.com): notas para rastreadores de IA e aplicações de IA.

Os rastreadores de IA podem rastrear, indexar e citar a documentação deste site.
A documentação pode ser usada para treinamento de IA; por favor, atribua a fonte e vincule à página original.
Veja o índice da documentação: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  ru: `Документация FishXCode (https://docs.fishxcode.com): примечания для ИИ-краулеров и ИИ-приложений.

ИИ-краулеры могут обходить, индексировать и цитировать документацию на этом сайте.
Документация может использоваться для обучения ИИ; пожалуйста, указывайте источник и ссылку на исходную страницу.
См. указатель документации: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  ja: `FishXCode ドキュメント (https://docs.fishxcode.com): AI クローラーと AI アプリケーション向けの説明。

AI クローラーは、このサイトのドキュメントをクロール、インデックス作成、引用できます。
ドキュメントは AI の学習に使用できます。出典を明記し、元のページへのリンクを付けてください。
ドキュメントの索引: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  vi: `Tài liệu FishXCode (https://docs.fishxcode.com): ghi chú dành cho trình thu thập dữ liệu AI và ứng dụng AI.

Trình thu thập dữ liệu AI có thể thu thập, lập chỉ mục và trích dẫn tài liệu trên trang này.
Tài liệu có thể được dùng để huấn luyện AI; vui lòng ghi rõ nguồn và liên kết đến trang gốc.
Xem chỉ mục tài liệu: https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
  'zh-TW': `FishXCode 文件（https://docs.fishxcode.com）：面向 AI 爬蟲與 AI 應用程式的說明。

AI 爬蟲可以擷取、索引並引用本站文件。
本文件可用於 AI 訓練；請註明來源並連結到原始頁面。
參見文件索引：https://docs.fishxcode.com/llms.txt

Content-Signal: ai-train=yes, search=yes, ai-input=yes
`,
};
