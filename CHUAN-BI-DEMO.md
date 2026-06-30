# 🎬 CHUẨN BỊ DEMO CUỐI KHÓA — App "fit-confidence" (Size Finder & Fit Guide)

**Deadline:** 14h Thứ Ba 30/06 (submit Form)
**Repo:** https://github.com/hieuxipat/fit-confidence
**Trạng thái hiện tại:** ✅ Harness + guardrails + feature map + prototype + **Phase 1 (recommendSize TDD + theme app block)** + **Phase 2 admin (embedded React Router app + trang Polaris sửa size chart + app-owned metafield)** — **đã DEMO LIVE end-to-end** trên `hieu-test-app-1` (admin Save ↔ storefront widget) + **DEPLOYED** version `fit-confidence-2`. Trong lúc demo đã **fix 3 bug thật** (chi tiết ở Phần D5). · ⬜ Còn lại: quay clip demo + slide + submit.

> **Tư duy của tài liệu này:** không "làm app rồi nghĩ xem áp dụng gì". Đi ngược lại — mỗi phần trình bày đã map sẵn với một việc THẬT + một mảng kiến thức khóa học. Phần lớn evidence cho phần "phương pháp/harness" **đã nằm trong git history rồi**; việc còn lại là build phần app để có evidence cho TDD + Verification + demo chạy được.

---

## 🧭 XƯƠNG SỐNG CÂU CHUYỆN (điểm ăn điểm)

```
[ĐÃ XONG — có commit]   Research thị trường (prompt eng.) → Competitor analysis
   B1·B2·B4·B5·B7        → /map-feature → feature map 31 feature → chọn MVP từ hub
                         → Dựng HARNESS (AGENTS/CLAUDE/feature_list/init.sh)
                         → GUARDRAILS thật (hooks chặn lệnh, permissions, pre-commit secret)
                         → init.sh verify THẬT (harness integrity check)
                              ↓
[ĐÃ XONG — có commit]   Scaffold app → recommendSize() TDD (11) → storefront widget → RELEASED
   B3·B5·B6·B7           → Phase 2: embedded React Router app → validateChart TDD (16) →
                            trang Polaris sửa chart → app-owned metafield → debug scope→namespace
                              ↓
[CÒN LẠI]               Quay clip demo admin↔storefront + slide 6 phần + submit
                              ↓
[TRÌNH BÀY]             6 phần, mỗi phần gắn 1 lát cắt kiến thức + evidence
```

→ Thông điệp chốt: *"Tôi dùng AI/Harness xuyên suốt vòng đời sản phẩm — từ tìm cơ hội thị trường, dựng hàng rào an toàn cho agent, đến code có kiểm chứng — chứ không chỉ 'nhờ AI viết code'."*

---

## PHẦN A — ĐÃ LÀM ĐƯỢC GÌ (đối chiếu theo commit — đây là evidence sẵn có)

> 💎 Tất cả dòng dưới đây **đã commit & push** lên `fit-confidence`. Mở `git log` trên slide là thấy ngay — evidence không thể chối cãi.

| Commit | Việc đã làm | Kiến thức khóa học | Evidence để show |
|---|---|---|---|
| `01ffd55` | Bootstrap harness scaffold: `AGENTS.md`, `CLAUDE.md`, `feature_list.json`, `init.sh`, `claude-progress.md`, `session-handoff.md` | **B5 CLAUDE.md/AGENTS.md · B7 Harness workflow** | Bộ file harness ở repo root |
| `45c8071` | Upstream sync scanner (`scripts/scan-source.mjs`) + baseline snapshot | **B7 Harness nâng cao** (giữ harness đồng bộ với nguồn) | `SYNC.md`, `.harness-baseline/` |
| `633679d` | `docs/shopify-conventions.md`; ignore `docs/lessions/` | **B1 Context Engineering** (đóng gói domain knowledge cho agent) | File conventions |
| `88e03b5` | Cài 4 Skill: `design-brainstorm`, `design-prototype`, `map-feature`, `playwright-cli` | **B2 Skills / Structured Workflows** | `.claude/skills/` |
| `c655976` | Feature map đối thủ Kiwi Sizing (output của `/map-feature`) — 31 feature, 5 layer | **B2 Delegation + Skill + Planning** (đọc dependency để cắt scope) | `outputs/kiwi-sizing-feature-map.html` |
| `6848d99` | ⭐ **Guardrails thật:** `block-dangerous.sh` (chặn `rm -rf`/`DROP`/`curl\|sh`), `scan-secrets.sh`, `.githooks/pre-commit` chặn commit secret, `settings.json` allow/ask/deny + tự bảo vệ hook, rule chống injection trong `AGENTS.md` | **B4 Hooks/Permissions/Guardrails** (lõi buổi 4) | `.claude/settings.json`, `.claude/hooks/*`, `.githooks/pre-commit` |
| `d617b82` | ⭐ **Verification thật:** `init.sh` chạy `scripts/verify-harness.sh` (artifacts, JSON schema, hook self-test) + `npm test` + `shopify app build`; `feature_list.json` schema phân cấp feature→task có status/DoD/evidence/round | **B3 Verification · B7 Harness** | `./init.sh` → `RESULT: PASS` |
| `db37447` | ⭐ **Phase 1 lõi TDD:** `recommendSize()` RED→GREEN (exact / validation / out-of-range / fit) — 11 test xanh | **B3 TDD** | `npm test` 11/11; git history RED→GREEN |
| `5e1c520` | **Phase 1 theme app block + widget UI** bám prototype; `shopify app build` OK | **B7 Shopify app thật (theme extension)** | `extensions/size-finder/` |
| `0841f70` | **RELEASED** `shopify app deploy` → version `fit-confidence-1` Active | **B7** | Dev dashboard |
| `b504597` | ⭐ **Phase 2 re-scaffold:** `shopify app init` → embedded **React Router** app (kế thừa template Remix), nối app "Fit Confidence" có sẵn, gộp về `app/` (extension + module size-chart), gắn lại Vitest | **B7 Harness/scaffold · B1** | `app/` là embedded app |
| `9193bb8` | ⭐ **Phase 2 admin Polaris size-chart editor:** route `app/app/routes/app.size-chart.jsx` (sửa/validate/save) + `validateChart` (TDD, +5 test) + metafield server | **B3 TDD · B5 Polaris/Skill · B6 Custom Data** | `npm test` 16/16; trang Size chart render live |
| `2b4ec4e` | ⭐ **Debug + fix metafield ownership:** scope `write_metafields` bị Shopify bỏ → chuyển sang **app-owned reserved namespace** `$app:fit_confidence` (không cần scope); theme đọc qua Liquid | **B3 Systematic Debugging · B6 MCP/Custom Data** | App preview chạy không lỗi scope |

**Tóm tắt:** evidence cho **B1, B2, B3, B4, B5, B6, B7 đã có thật trong repo** — gồm cả TDD (16 test) và một ca debug thật (scope→namespace). Việc còn lại chỉ là **quay clip demo + slide**.

> 🎯 **Trick khoe khéo:** mở `git log --oneline` + chạy `./init.sh` live cho giám khảo xem `RESULT: PASS`. Đây là minh chứng "Done = có evidence, không phải AI nói xong".

---

## PHẦN B — SCOPE MVP APP (chốt từ feature map)

> 🛍️ **Đây là Shopify app THẬT, đủ 2 mặt:** **storefront** = Theme App Extension (app block merchant kéo vào product page) + **admin** = embedded React Router app (trang Polaris sửa size chart). Liên kết admin↔storefront qua **app-owned metafield** (không DB cho chart). Lõi logic (`recommendSize`, `validateChart`) đều TDD.

Flow nhỏ nhất demo được end-to-end: *"Buyer: find size"* bám các hub feature:

- [x] **F010 — Size chart record:** size chart mẫu S/M/L/XL (constant `TSHIRT_CHART` trong `sizing.js`) + bản merchant sửa được lưu qua metafield.
- [x] **F034/F033 — Rule-based recommender (LÕI):** `recommendSize(m, chart)` → size + lý do. **TDD, 11 test.**
- [x] **F040 — Storefront widget = Theme App Block:** nút "Find my size" → modal nhập số đo → size gợi ý; đọc chart từ metafield + fallback.
- [x] **F011 — Admin Polaris (sửa chart):** **Phase 2 ĐÃ BUILD** — embedded React Router app + trang Polaris `app.size-chart.jsx` (`validateChart` TDD), lưu chart qua **app-owned metafield `$app:fit_confidence`** (không DB) để storefront đọc lại. Chạy live qua `shopify app dev`.

**Cắt khỏi MVP (nói rõ — điểm cộng vì thể hiện đọc được độ phức tạp):** AI/ML recommender (F032), OCR import (F017), billing tier (F004), auto-translate (F027), analytics (F045-47). Lý do từ feature map: clone full = 6–12 tháng, rating "Complex" → MVP chỉ đánh vào lõi.

> 💡 **Market gap (dùng cho slide "Mục tiêu"):** Kiwi khóa recommender sau plan Plus + watermark trên Free. MVP của bạn: recommender rule-based, không watermark → bổ trợ merchant nhỏ trong hệ sinh thái Omegatheme.

---

## PHẦN C — CÁC BƯỚC CẦN LÀM ĐỂ DEMO (cập nhật theo trạng thái thật)

### 🗺️ Bản đồ Lession (gắn vào từng bước để nói trên slide)

| Mã | Thư mục | Chủ đề |
|---|---|---|
| **L1** | `lession-1` | Nền tảng LLM, Tư duy Harness & Context Engineering |
| **L2** | `lession-2` | Planning, Delegation & Structured Workflows |
| **L3** | `lession-3` | TDD, Verification & Systematic Debugging (AI quality loop) |
| **L4** | `lession-4` | Guardrails, Security & Hooks System |
| **L5** | `lession-5` | Skills, CLAUDE.md & Subagent Architecture |
| **L6** | `lession-6` | MCP (lab-first MCP) |
| **L7** | `lession-7` | Harness Design, Team Adoption & Cross-Model |

### ✅ Đã xong (không làm lại — chỉ kể trong slide)

| Đã làm | Kiến thức | Lession |
|---|---|---|
| Harness files (AGENTS/CLAUDE/feature_list/init.sh) | Tư duy harness, context cho agent | **L7 + L1** |
| Guardrails: hook chặn lệnh + permissions + pre-commit secret + chống injection | Security & Hooks | **L4** ⭐ |
| Cài Skills + chạy `/map-feature` ra feature map đối thủ | Skills + Delegation | **L5 + L2** |
| Brainstorm → **spec** → **plan** (trong `docs/features/size-finder/`) | Planning có artifact thật | **L2** |
| `init.sh` verify thật (harness integrity check) | Verification + harness | **L3 + L7** |
| Pin Node 20 (`.nvmrc` + engines + check trong init.sh) | Môi trường tái lập được | **L7** |
| Tổ chức `docs/features/<feature>/{plans,specs,prototype}` | Repo là spec, có cấu trúc | **L7** |
| Design brief (design-brainstorm) + **prototype UI** (`size-finder-widget.html`) = nguồn sự thật giao diện | "Repo là spec cho cả UI" — prototype trong harness | **L7 + L5** ⭐ |
| **Phase 1 App MVP build xong + TDD**: `recommendSize` (11 test xanh) + theme app block; `shopify app build` OK | **TDD + Verification (output thật)** | **L3** ⭐ |
| **Phase 1 RELEASED**: `shopify app deploy` → version `fit-confidence-1` Active trên dev dashboard | App Shopify thật, deploy được | **L7** |
| **Phase 2 admin BUILT**: re-scaffold thành **embedded React Router app** (nối app "Fit Confidence"), gộp về `app/` | Scaffold embedded app; CLI; harness | **L7 + L1** ⭐ |
| **Phase 2 `validateChart()` TDD** (+5 test, tổng **16 xanh**) — RED→GREEN | **TDD** thêm một lõi thuần | **L3** ⭐ |
| **Phase 2 trang Polaris sửa size chart** (`app.size-chart.jsx`, Polaris web components) chạy live, render 4 hàng S/M/L/XL + Save/Reset/validation banner | Polaris App Home; Skill `shopify-polaris-app-home` validate UI | **L5** ⭐ |
| **Phase 2 lưu qua app-owned metafield** `$app:fit_confidence` (không DB, không cần scope); theme đọc qua Liquid + fallback | **Custom Data (metafield) + MCP skills** `shopify-custom-data`/`shopify-admin` validate GraphQL | **L6 + L5** ⭐ |
| **Phase 2 ca debug thật**: `write_metafields` bị Shopify bỏ → merchant-owned vs app-owned → fix sang reserved `$app` namespace | **Systematic Debugging** (đọc lỗi → tra docs → root cause → fix) | **L3** ⭐ |

### ✅ Plan đã chạy XONG — cả storefront lẫn admin

> Cả `plans/size-finder.md` (Phase 1) **và** `plans/admin-size-chart.md` (Phase 2) đã thực thi. Bảng dưới = đã làm, để chỉ vào khi trình bày.

| Bước | Đã làm | Lession |
|---|---|---|
| **1. Scaffold** | Phase 1 theme extension + Vitest; Phase 2 `shopify app init` → embedded React Router app, gộp về `app/` | L7, L1 |
| **2–5. `recommendSize()` TDD** | exact / validation / out-of-range / fit — RED→GREEN, 11 test | **L3** ⭐ |
| **6. Theme app block + UI** | `size-finder.liquid` + CSS bám prototype; đọc metafield + fallback | L7, L1 |
| **7. Wire init.sh + state** | init.sh: Node check → `npm test` + `shopify app build` + harness; `feature_list.json` DoD/evidence | L3, L7 |
| **8. `validateChart()` TDD** | Phase 2 lõi thuần, +5 test (tổng 16) | **L3** ⭐ |
| **8b. Hiểu code trước khi extend (codegraph)** | `codegraph init` (27 files/168 nodes/236 edges) → `codegraph_explore` thấy widget↔`recommendSize`↔chart trong 1 call + **blast-radius** (`writeChart` 1 caller, ⚠️ no covering tests); `codegraph_impact recommendSize` → 3 symbols. Query graph thay vì scan file. App nhỏ nên **dùng chọn lọc** (judgment, xem Slide 5). | **L2 + L6** |
| **9. Admin Polaris + metafield** | trang `app.size-chart.jsx` (Polaris web components) + app-owned metafield `$app:fit_confidence` + `ensureSizeChartDefinition`; theme đọc lại | L5, L6 ⭐ |
| **10. Debug khi kẹt** | ca thật: `write_metafields` invalid → app-owned namespace; đọc lỗi → tra docs → root cause → fix | **L3** ⭐ |

### ⬜ Việc CÒN LẠI (chỉ còn đóng gói)

| Bước | Làm gì | Lession |
|---|---|---|
| **A. Quay clip demo** | Save chart trong admin → toast → storefront widget đổi gợi ý (admin↔storefront); + 1 case validation banner | L3 (Verification) |
| **B. Slide 6 phần + submit** (sáng T3 30/06) | Video 2–3', slide, submit Form | L7 |

> ✅ Đã verify live end-to-end trên `hieu-test-app-1` (admin Save ↔ storefront widget) → `task-app-admin` = **passing**, deployed `fit-confidence-2`. **Chỉ còn quay lại thành clip + dựng slide.**

---

## PHẦN D — KỊCH BẢN TRÌNH BÀY (6 phần, mỗi phần map kiến thức)

> Mỗi slide ~60 giây. Cuối mỗi phần có dòng *"Kiến thức áp dụng"* để giám khảo tick.

**1️⃣ Mục tiêu app** — Size Finder giúp khách chọn đúng size lần đầu → giảm return (fashion ~30%). Bổ trợ Omegatheme, không trùng lặp. *Show:* 5 app cơ hội + Kiwi market data. 🏷️ *Prompt/Context Eng., Delegation, Skill `/map-feature`.*

**2️⃣ Đã áp dụng kiến thức nào** — *Show:* `git log` + bảng Phần A + bảng Phần E. 🏷️ *Slide ăn điểm — đi nhanh nhưng đủ; nhấn "evidence là commit thật".*

**3️⃣ AI hỗ trợ phần nào** — AI giúp: research, brainstorm plan, generate widget, viết test, debug; **tôi giữ vai PM + reviewer** (quyết hướng, review code, dựng guardrails để AI không phá). *Show:* 1 ReAct loop (đọc file → sửa → chạy test) + hook chặn `rm -rf` live. 🏷️ *Harness tool-use loop, đổi vai coder → PM.*

**4️⃣ Kết quả đạt được** — *Show demo live/video* (đã verify thật trên `hieu-test-app-1`): (a) storefront 170cm/65kg → "M" + lý do; (b) **admin↔storefront**: sửa chart trong trang Polaris **Size chart** → Save (toast) → widget storefront gợi ý size khác. *Số liệu thật:* **21/21 test xanh** (recommendSize 11 + validateChart 5 + server behaviour 4 + GraphQL regression 1), `shopify app build` OK (theme check sạch), `react-router build` compile route admin, `./init.sh` → **RESULT: PASS**, **DEPLOYED** version `fit-confidence-2` (storefront widget chạy trên CDN Shopify, không cần server). 🏷️ *Verification (evidence = raw output), TDD, Shopify app thật (storefront + admin), Custom Data (metafield không DB), Systematic Debugging (3 bug live).*

**5️⃣ Khó khăn & cách xử lý** (chọn 2–3):
- AI **bịa công thức sizing** → verify bằng size chart thật + test khóa.
- Feature map 31 feature rating "Complex" → **cắt scope** về 4 hub.
- Lo agent chạy lệnh nguy hiểm / lộ secret → **dựng hooks + pre-commit guard** (chặn `rm -rf`, secret).
- Skill `design-prototype` khóa vào **Polaris/Admin** → KHÔNG hợp **storefront widget** → nhận ra & **tự author prototype storefront** thay vì ép sai tool.
- **codegraph — biết khi nào KHÔNG dùng tool nặng** (judgment): codegraph build knowledge graph để Claude query thay vì scan file → tiết kiệm token trên **codebase lớn**. Áp dụng đúng chỗ = "hiểu code trước khi extend" + "impact trước refactor". Nhưng app này chỉ ~chục file → **đọc thẳng còn rẻ hơn** → mình dùng **có chọn lọc** (demo 1 call cho thấy giá trị, không ép dùng tràn). Biết khi nào KHÔNG reach for tool nặng cũng là kỹ năng buổi 2. 🏷️ *Structured workflows, context engineering, tránh "làm app rồi nghĩ xem áp dụng gì".*
- **Phase 2 — metafield ownership/scope** (ca debug đắt giá nhất): thêm `scopes = write_metafields` → `shopify app dev` báo *"These scopes are invalid"* (Shopify đã bỏ scope đó). Tra docs → hiểu **merchant-owned namespace cần scope, app-owned (`$app`) thì không** → đổi sang reserved namespace `$app:fit_confidence`, theme đọc `shop.metafields["$app:fit_confidence"]…`. Dùng **MCP skills** `shopify-admin`/`shopify-custom-data` validate GraphQL vs schema trước khi chạy.
- **3 bug thật bắt được khi demo live** (kể như minh chứng "đọc lỗi → root cause → fix → regression test", KHÔNG đoán mò):
  1. **Save báo Application Error** → đọc stack trace → query lấy shop id viết 1 dòng `#graphql query…`; `#` comment hết dòng nên query rỗng → Shopify "syntax error, unexpected end of file". Tách xuống dòng + **thêm regression test** strip comment. (`fe16040`)
  2. **Nút "Find my size" bấm không ra modal** → `document.currentScript` = `null` trong `<script type=module>` → `.closest()` ném lỗi, cả module crash trước khi gắn listener → đổi sang `getElementById("sf-wrap-{block.id}")`. (`8edac72`)
  3. **theme-check `LiquidHTMLSyntaxError`** khi deploy → comment JS chứa literal `<script…>` làm parser tưởng thẻ chưa đóng → sửa câu comment. (`94ef60f`)
  🏷️ *Systematic Debugging (6 bước), MCP/Custom Data, đọc docs/stack trace thay vì đoán.* 🏷️ *Guardrails, Planning (cắt scope), chọn đúng tool.*

**6️⃣ Bài học rút ra** — (1) Áp dụng kiến thức TỪ khâu chọn đề tài. (2) Plan kỹ + có test → AI nhanh & đáng tin hơn. (3) Harness + guardrails giữ AI không đi lạc/không phá. (4) Done = có evidence (commit + raw output), không phải AI nói xong. 🏷️ *Tổng kết: tư duy Harness Engineer.*

---

## PHẦN E — BẢNG "KIẾN THỨC ↔ EVIDENCE" (dùng cho slide 2)

| # | Kiến thức (buổi) | Làm gì trong project | Evidence | Trạng thái |
|---|---|---|---|---|
| 1 | **Prompt/Context Eng. (B1)** | Prompt research role + loại trừ Omegatheme; `shopify-conventions.md` | Screenshot prompt + `docs/shopify-conventions.md` | ✅ |
| 2 | **Delegation + Skill (B2)** | Web research competitor; chạy `/map-feature` | `outputs/kiwi-sizing-feature-map.html` (`c655976`) | ✅ |
| 3 | **Planning (B2)** | Đọc dependency hub → cắt scope MVP; **spec + plan** cho cả storefront & admin (`docs/features/size-finder/`) | Feature map + `plans/*.md` + `specs/*.md` | ✅ |
| 4 | **CLAUDE.md/AGENTS.md (B5,B7)** | Luật dự án + bản đồ repo + iron law/guardrail rules | `CLAUDE.md`, `AGENTS.md` (`01ffd55`,`6848d99`) | ✅ |
| 5 | **TDD/Testing (B3)** | RED→GREEN cho `recommendSize()` (11) **và** `validateChart()` (5) + server behaviour (4) + regression GraphQL (1) | Test file + commit RED/GREEN; `npm test` **21/21** | ✅ |
| 6 | **Verification (B3,B7)** | `init.sh` chạy verify thật (test + build + harness check) | `./init.sh` → `RESULT: PASS`, npm test 21/21, build OK | ✅ |
| 7 | **Hooks/Guardrails (B4)** | Hook chặn lệnh nguy hiểm + permissions + pre-commit secret (đã thực sự chặn 2 commit false-positive → xác minh rồi mới `--no-verify`) + chống injection | `.claude/settings.json`, `.claude/hooks/*`, `.githooks/pre-commit` (`6848d99`) | ✅ |
| 8 | **Harness workflow (B7)** | `feature_list.json` (schema phân cấp) + `claude-progress.md` + clean restart | Bộ harness files + `git log` | ✅ |
| 9 | **MCP + Custom Data (B6)** | Dùng MCP skills `shopify-admin`/`shopify-custom-data`/`shopify-polaris-app-home` validate GraphQL & UI vs schema; lưu chart qua **app-owned metafield** (không DB) | `app/app/size-chart.server.js`, route admin (`9193bb8`,`2b4ec4e`) | ✅ |
| 10 | **codegraph — context tool / MCP (B2,B6)** | `codegraph init` (27 files · 168 nodes · 236 edges · 214ms) → `codegraph_explore` (26 symbols/12 files, **blast-radius**) + `codegraph_impact recommendSize`. Query graph thay vì scan file; dùng **chọn lọc** trên app nhỏ (judgment). Bonus (vòng lặp tool→action): graph **flag `writeChart`/`readChartStatus` = "no covering tests"** → mình **đóng gap bằng 4 test hành vi** (throw khi userErrors, cờ `customized`) → `npm test` **21/21**. | Output MCP `mcp__codegraph__*` (chụp `init` + explore/impact) + `app/app/size-chart.server.test.js` | ✅ |

> 💡 **Cả 9/9 mục đều có evidence thật trong repo** (kể cả TDD 16 test và ca debug metafield). Chỉ còn quay clip demo + slide.
>
> 📌 **B# ↔ Lession#:** B1=L1, B2=L2, B3=L3, B4=L4, B5=L5, B6=L6, B7=L7 (xem "Bản đồ Lession" ở Phần C).

---

## PHẦN E2 — RÀ SOÁT COVERAGE 7 LESSON + ĐÓNG GAP (điểm ăn điểm meta)

> 🔍 Tôi **tự audit độ phủ kiến thức**: fan-out **7 subagent song song** (mỗi con đọc 1 lesson + đối chiếu repo tìm evidence) → tổng hợp ma trận. *Chính việc này = demo live của L2 (Delegation/parallel) + L5 (subagent).*

**Kết quả audit:** Áp dụng **mạnh** ở L4 (đầy đủ), L7 (vượt), L1, L5-skills, L6-consume. Sau audit đã **đóng 3 gap nổi nhất**:

| Gap (lesson) | Đã đóng bằng | Evidence |
|---|---|---|
| **Custom sub-agent** (L5) — chưa có `.claude/agents/` | Tạo agent **`code-reviewer`** (read-only: review diff, verify test, không cho làm yếu guardrails) | `.claude/agents/code-reviewer.md` + đã **dùng thật** 7 subagent để audit |
| **Risk Matrix** (L3) — thiếu phân loại rủi ro | Section "Risk Classification" (low/med/high, auto-high cho auth/scope/secret/deploy/guardrails) + field `risk` cho **cả 7 task**, **máy enforce** trong `verify-harness.sh` | `AGENTS.md` · `feature_list.json` · `verify-harness.sh` (test âm: thiếu `risk` → check FAIL) |
| **Session handoff** (L7) — file rỗng | Điền `session-handoff.md` đầy đủ (objective/verification/decisions/blockers/next-step) | `session-handoff.md` |

**Gap còn lại (cố ý để next-step, nói rõ là judgment):**
- **Build 1 MCP server** (L6) — hiện chỉ *consume* (codegraph, shopify-dev-mcp); lab của L6 cũng consume-only.
- **User stories + Given-When-Then** (L2) — đã thay tương đương bằng TDD test + `feature_list` DoD (khác format, không thiếu chức năng).

🏷️ *Slide: "Tôi không chỉ học — tôi tự kiểm chứng độ phủ bằng 7 subagent, rồi đóng gap có chọn lọc."*

---

## PHẦN F — CHECKLIST SUBMIT (trước 14h T3 30/06)
- [x] Repo đã push (`fit-confidence`) — commit history rõ ràng
- [x] Guardrails/hooks/permissions + harness + feature map đã commit
- [x] Phase 0 (init.sh verify + schema) đã commit
- [x] Phase 1: `recommendSize()` test RED→GREEN + theme app block + RELEASED (`fit-confidence-1`)
- [x] Phase 2: embedded React Router app + trang Polaris sửa chart + `validateChart` TDD + app-owned metafield
- [x] Demo LIVE end-to-end trên `hieu-test-app-1` + **deployed `fit-confidence-2`** + fix 3 bug live
- [x] `./init.sh` ra raw output (test 21/21 + build + harness PASS) — evidence
- [ ] **Quay clip demo admin↔storefront** (Save chart → widget đổi) + 1 case validation
- [ ] Slide 6 phần
- [ ] Đính `CLAUDE.md` + `AGENTS.md` + feature map khi submit

---

## 🚀 LÀM GÌ NGAY BÂY GIỜ
1. **Quay clip demo** (app đang chạy `shopify app dev`): trang **Size chart** → sửa `Height max` của M (vd 176→172) → **Save** (toast) → ra storefront, nhập số đo biên → widget gợi ý size khác. Quay thêm 1 case Save sai (min>max) → banner đỏ.
2. (Tùy chọn) `shopify app deploy` để ship bản admin thành version mới trên dev dashboard.
3. **Dựng slide 6 phần** theo Phần D; nhúng `git log --oneline` + ảnh `./init.sh` PASS + clip demo.
4. Submit Form trước 14h T3 30/06, đính kèm `CLAUDE.md`/`AGENTS.md`/feature map.
