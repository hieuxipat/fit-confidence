# Shopify Domain Conventions

Detailed reference cho workflow harness (đặc biệt `/harness-plan`, `/harness-work`, `/harness-review`) để sinh code khớp stack Shopify app của Division. **Đọc file này khi subproject là Shopify app** (detect qua `@shopify/polaris`, `@shopify/shopify-api`, hoặc `@shopify/app-bridge-react` trong `package.json`).

File này là **constraint checklist domain**, được trỏ tới từ `.claude/rules/project-rules.md`. Nếu code sinh ra vi phạm bất kỳ mục nào dưới đây, coi như bug và fix trong `/harness-work` (trước review). Không phải workflow override — execution order vẫn do harness loop sở hữu.

## Stack reference (Division standard)

- **Backend:** NestJS + TypeORM + MySQL
- **Frontend:** ReactJS + **Polaris React** (`@shopify/polaris`) + App Bridge React (`@shopify/app-bridge-react`)
- **App type:** Embedded inside Shopify Admin (iframe under `*.myshopify.com/admin`)
- **APIs used:** Admin GraphQL (primary); Metafields/Metaobjects when custom data is needed

## Frontend — Polaris React (NOT Web Components)

**Important:** the `Shopify/Shopify-AI-Toolkit` skills and many current examples on `shopify.dev` use Polaris **Web Components** (`<s-button>`, `<s-page>`, `<s-badge>`, ...). This Division does **NOT** use that flavor. If generated code contains `<s-*>` tags, it is wrong stack — rewrite.

**Correct pattern:**

```tsx
import {Page, Card, Button, Badge} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css'; // import once at entry

export function ProductPage() {
  return (
    <Page title="Products">
      <Card>
        <Button variant="primary">Save</Button>
      </Card>
    </Page>
  );
}
```

**UI checklist:**

- ✅ Import from `@shopify/polaris` (React components, PascalCase)
- ✅ Props are camelCase (`primaryAction`, `onAction`)
- ✅ Wrap the app in `<AppProvider i18n={...}>` at the root
- ✅ Use App Bridge React hooks (`useAppBridge`, `useNavigate`, `useAuthenticatedFetch`) for navigation, toast, modal, resource picker
- ❌ Do NOT use web component tags `<s-button>`, `<s-page>`, `<s-badge>`
- ❌ Do NOT import from `@shopify/ui-extensions` (that package is for UI Extensions, not embedded apps)
- ❌ Do NOT import from `@shopify/app-bridge` (legacy v3) — use `@shopify/app-bridge-react` (v4+) instead

**Validation routing:** `shopify-dev-mcp`'s `validate_component_codeblocks` tool recognizes web component syntax. For Polaris React, use the **`context7`** MCP (`resolve-library-id` → `@shopify/polaris`) to look up the current API instead.

## Backend — NestJS + Shopify

### Admin GraphQL calls

Before writing any query or mutation:

1. Call `mcp__shopify-dev-mcp__search_docs_chunks` to locate the operation, field names, and deprecation status.
2. Call `mcp__shopify-dev-mcp__validate_graphql_codeblocks` to validate the query before committing.
3. Do NOT guess field names. Do NOT rely on training data — the Shopify API bumps version quarterly.

In Phase 3 brainstorming, the spec must record the API version in use (`2025-01`, `2024-10`, ...) and the scopes required.

### Webhook handlers

Every webhook controller in NestJS must:

- ✅ Verify the HMAC from the `X-Shopify-Hmac-Sha256` header BEFORE parsing the body (use the raw body).
- ✅ Respond `200 OK` quickly (< 5s); offload heavy work to a queue if needed.
- ✅ Be idempotent — webhooks can retry; use `X-Shopify-Webhook-Id` as the dedupe key.
- ✅ Implement all **GDPR mandatory webhooks**: `customers/data_request`, `customers/redact`, `shop/redact`.
- ❌ Do NOT log the raw webhook body (contains PII).

### Session & OAuth

- Session storage lives in a dedicated TypeORM entity (e.g. `ShopifySessionEntity`), not in the generic user table.
- Distinguish **offline tokens** (for backend cron/webhook work) from **online tokens** (for user sessions).
- When scopes change in `shopify.app.toml`, the merchant must re-OAuth. Flag this explicitly in the spec and test cases.

### Rate limits & query cost

- The Admin GraphQL API bills **calculated query cost**, not request count. Split heavy queries and use `bulk operations` for large datasets.
- Handle `THROTTLED` responses with exponential backoff.

## Verb-specific notes (harness loop)

### `/harness-plan` (spec.md + Plans.md)

- `spec.md` phải ghi: (a) Polaris React components dự kiến, (b) Admin API operations + version, (c) webhook topics (nếu có), (d) thay đổi TypeORM entity + migration plan, (e) scopes yêu cầu.
- Story đụng UI nhưng chưa rõ Polaris component nào → ghi open question, hỏi user (đừng đoán).
- Story đụng Admin API → list scopes + target API version trước khi chốt acceptance criteria.

### `/harness-work` (TDD slice)

- UI dùng **Polaris React** (`@shopify/polaris`), KHÔNG `<s-*>`. Validate component qua `context7` (`@shopify/polaris`).
- GraphQL: validate qua `mcp__shopify-dev-mcp__validate_graphql_codeblocks` trước khi commit. Đừng đoán field name.
- Unit test webhook controller: mock HMAC verify service, cover cả valid + invalid HMAC.
- Test GraphQL: mock Shopify client. KHÔNG gọi API thật từ unit test.

### Verify UI thật (playwright headed, thay self-test browser mode cũ)

- App phải mở **trong Shopify Admin iframe** (App Bridge cần admin context). KHÔNG mở `localhost:3000` trực tiếp — dùng tunnel URL của `shopify app dev`.
- Webhook: trigger qua Shopify CLI (`shopify app webhook trigger`), không fake curl.
- Admin API integration: chạy CLI thật trên dev store, không mock.
- **Bug UI Shopify:** repro bằng `playwright-cli --headed` trong Admin iframe + lưu screenshot `evidence/` TRƯỚC khi fix.

## Decision-log template (embed trong `spec.md`)

Khi feature đụng Shopify, include block này trong `spec.md`:

```markdown
## Shopify integration decisions

- **API version:** 2025-01
- **Admin API scopes required:** read_products, write_inventory
- **Polaris React components:** Page, IndexTable, Modal, Toast
- **App Bridge hooks:** useAppBridge, useNavigate
- **Webhook topics:** products/update, orders/create
- **Metafields/Metaobjects:** $app:settings (metaobject type) — schema at <link>
- **Session mode:** online token for UI, offline token for background jobs
- **Rate limit plan:** estimated query cost ~50 points/request, batch up to 10 items
```

## When in doubt

- Polaris React API questions → `context7` MCP (`resolve-library-id` → `@shopify/polaris`).
- Shopify platform questions (Admin API, webhooks, CLI) → `shopify-dev-mcp`.
- Unclear between the two → ask the user. Do not guess.
