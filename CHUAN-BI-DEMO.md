# 🎬 CHUẨN BỊ DEMO CUỐI KHÓA — App "fit-confidence" (Size Finder & Fit Guide)

**Deadline:** 14h Thứ Ba 30/06 (submit Form)
**Repo:** https://github.com/hieuxipat/fit-confidence
**Trạng thái hiện tại:** ✅ Harness + guardrails + feature map + **design brief + prototype UI** **đã làm** · ⬜ Code app MVP (recommendSize + widget) **chưa làm**.

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
[CÒN LẠI — cần build]    Scaffold Shopify app → recommendSize() theo TDD (RED→GREEN→REFACTOR)
   B3 (TDD/Verify)       → storefront widget → chạy init.sh lấy raw output → demo 170cm/65kg → "M"
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
| *(chờ commit)* | ⭐ **Verification thật:** `init.sh` chạy `scripts/verify-harness.sh` (18 check: artifacts, JSON schema, hook self-test); nâng `feature_list.json` lên schema phân cấp feature→task có status/DoD/evidence/round | **B3 Verification · B7 Harness** | `./init.sh` → `RESULT: PASS` |

**Tóm tắt:** evidence cho **B1, B2, B4, B5, B7** đã có thật trong repo. Mảng còn thiếu evidence là **B3 (TDD + chạy app)** — chính là phần app MVP cần build.

> 🎯 **Trick khoe khéo:** mở `git log --oneline` + chạy `./init.sh` live cho giám khảo xem `RESULT: PASS`. Đây là minh chứng "Done = có evidence, không phải AI nói xong".

---

## PHẦN B — SCOPE MVP APP (chốt từ feature map)

> 🛍️ **Đây là Shopify app THẬT** — đóng gói dưới dạng **Theme App Extension** (app block merchant kéo vào product page). Không cần OAuth/DB; lõi logic vẫn TDD. (Đã cân nhắc: storefront widget chứ không phải admin → theme app extension là surface đúng.)

Flow nhỏ nhất demo được end-to-end: *"Buyer: find size"* bám các hub feature:

- [ ] **F010 — Size chart record:** 1 size chart mẫu (áo thun S/M/L/XL theo chiều cao–cân nặng), là constant trong asset `sizing.js`.
- [ ] **F034/F033 — Rule-based recommender (LÕI):** `recommendSize(m, chart)` → trả size + lý do. **← bắt buộc TDD.**
- [ ] **F040 — Storefront widget = Theme App Block:** nút "Find my size" trên PDP → modal nhập số đo → hiện size gợi ý. **← đây là phần làm nó thành Shopify app thật.**
- [ ] **F011 — Admin Polaris (sửa chart):** **Phase 2 (stretch)** — đã chuẩn bị sẵn **spec + plan + prototype** (`admin-size-chart-*`), lưu chart qua **shop metafield** (không DB) để storefront đọc lại. Build SAU khi widget xong; nếu hết giờ → vẫn là Shopify app thật nhờ theme extension (chart hardcode), admin để "next step".

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
| Admin F011 (Phase 2): **spec + plan + prototype Polaris** (`admin-size-chart-*`) đã chuẩn bị sẵn (metafield, chưa build) | Planning trước; prototype Polaris bằng `design-prototype` | **L2 + L5 + L7** |

### ⬜ Việc CÒN LẠI — bám sát plan `docs/features/size-finder/plans/size-finder.md`

> Mỗi bước = 1 task trong plan (đã viết sẵn code từng step). Cột **Lession** là cái để chỉ vào khi trình bày.

| Bước (plan task) | Làm gì | Kiến thức áp dụng | Lession |
|---|---|---|---|
| **0. Chuẩn bị Shopify** (tự làm) | Tạo Partner account + dev store; `! shopify auth login` | Môi trường (đăng nhập tương tác) | L7 |
| **1. Scaffold** (Task 1) | `shopify app init` + `generate extension` (theme app extension) + Vitest | Setup verify; CLI scaffold Shopify app | L7, L1 |
| **2. recommendSize exact** (Task 2) ⭐ | RED→GREEN: 170/65→M, 185/90→XL (`assets/sizing.js` ESM) | **TDD** vòng đỏ–xanh | **L3** |
| **3. Validation** (Task 3) | Input xấu → throw (test trước) | TDD + guardrail cho dữ liệu | L3 (+L4) |
| **4. Out-of-range** (Task 4) | Ngoài bảng → nearest estimate | TDD edge case — "AI hay quên biên" | **L3** |
| **5. Fit adjustment** (Task 5) | slim/relaxed nudges size | TDD + REFACTOR giữ behavior | **L3** |
| **6. Theme app block + UI** (Task 6) | `size-finder.liquid` + CSS bám **prototype**; inline module import `sizing.js`; `shopify app build` | Realize prototype; **Shopify app thật** (theme extension); ReAct loop | **L7**, L1 |
| **7. Wire init.sh + state** (Task 7) | init.sh: Node check → `npm test` + `shopify app build` + harness; update `feature_list.json` | **Verification = raw output**; DoD; harness | L3, L7 |
| **8. Thực thi plan storefront** | Chạy `plans/size-finder.md` qua subagent-driven / inline | **Delegation** + **Subagent architecture** | L2, L5 |
| **9. (Phase 2) Admin F011** | Theo `plans/admin-size-chart.md`: embedded Remix + `validateChart` (TDD) + shop metafield + trang Polaris. **Chỉ làm sau khi widget xong** | TDD + Polaris + custom data (metafield) | L3, L5 |
| **10. Debug khi kẹt** | reproduce → ≥3 hypothesis → root cause → regression test | **Systematic Debugging** 6 bước | **L3** |
| **11. Slide + demo + submit** (sáng T3 30/06) | Video 2–3', slide 6 phần, submit Form | Cross-model / team adoption; tổng kết | L7 |

> ⏱️ Bước 1–7 (plan storefront) đã viết sẵn code từng step → chạy tuần tự là xong. **Bước 2–5 là lõi ăn điểm L3 (TDD)** — nhớ commit theo nhịp RED→GREEN để lịch sử git nói hộ câu chuyện. **Bước 9 (admin) là Phase 2 stretch** — chỉ làm nếu kịp.

---

## PHẦN D — KỊCH BẢN TRÌNH BÀY (6 phần, mỗi phần map kiến thức)

> Mỗi slide ~60 giây. Cuối mỗi phần có dòng *"Kiến thức áp dụng"* để giám khảo tick.

**1️⃣ Mục tiêu app** — Size Finder giúp khách chọn đúng size lần đầu → giảm return (fashion ~30%). Bổ trợ Omegatheme, không trùng lặp. *Show:* 5 app cơ hội + Kiwi market data. 🏷️ *Prompt/Context Eng., Delegation, Skill `/map-feature`.*

**2️⃣ Đã áp dụng kiến thức nào** — *Show:* `git log` + bảng Phần A + bảng Phần E. 🏷️ *Slide ăn điểm — đi nhanh nhưng đủ; nhấn "evidence là commit thật".*

**3️⃣ AI hỗ trợ phần nào** — AI giúp: research, brainstorm plan, generate widget, viết test, debug; **tôi giữ vai PM + reviewer** (quyết hướng, review code, dựng guardrails để AI không phá). *Show:* 1 ReAct loop (đọc file → sửa → chạy test) + hook chặn `rm -rf` live. 🏷️ *Harness tool-use loop, đổi vai coder → PM.*

**4️⃣ Kết quả đạt được** — *Show demo live/video:* 170cm/65kg → "M" + lý do. *Số liệu:* N test pass (raw output), `./init.sh` PASS, harness + guardrails hoàn chỉnh. 🏷️ *Verification (evidence = raw output), Testing.*

**5️⃣ Khó khăn & cách xử lý** (chọn 2–3):
- AI **bịa công thức sizing** → verify bằng size chart thật + test khóa.
- Feature map 31 feature rating "Complex" → **cắt scope** về 4 hub.
- Lo agent chạy lệnh nguy hiểm / lộ secret → **dựng hooks + pre-commit guard** (chặn `rm -rf`, secret).
- Skill `design-prototype` khóa vào **Polaris/Admin** → KHÔNG hợp **storefront widget** → nhận ra & **tự author prototype storefront** thay vì ép sai tool. 🏷️ *Guardrails, Debugging, Planning (cắt scope), chọn đúng tool.*

**6️⃣ Bài học rút ra** — (1) Áp dụng kiến thức TỪ khâu chọn đề tài. (2) Plan kỹ + có test → AI nhanh & đáng tin hơn. (3) Harness + guardrails giữ AI không đi lạc/không phá. (4) Done = có evidence (commit + raw output), không phải AI nói xong. 🏷️ *Tổng kết: tư duy Harness Engineer.*

---

## PHẦN E — BẢNG "KIẾN THỨC ↔ EVIDENCE" (dùng cho slide 2)

| # | Kiến thức (buổi) | Làm gì trong project | Evidence | Trạng thái |
|---|---|---|---|---|
| 1 | **Prompt/Context Eng. (B1)** | Prompt research role + loại trừ Omegatheme; `shopify-conventions.md` | Screenshot prompt + `docs/shopify-conventions.md` | ✅ |
| 2 | **Delegation + Skill (B2)** | Web research competitor; chạy `/map-feature` | `outputs/kiwi-sizing-feature-map.html` (`c655976`) | ✅ |
| 3 | **Planning (B2)** | Đọc dependency hub → cắt scope MVP; (sắp) `plan.md`/user stories | Feature map + slide chọn MVP | 🟡 một phần |
| 4 | **CLAUDE.md/AGENTS.md (B5,B7)** | Luật dự án + bản đồ repo + iron law/guardrail rules | `CLAUDE.md`, `AGENTS.md` (`01ffd55`,`6848d99`) | ✅ |
| 5 | **TDD/Testing (B3)** | RED→GREEN→REFACTOR cho `recommendSize()` | Test file + commit RED/GREEN | ⬜ cần build |
| 6 | **Verification (B3,B7)** | `init.sh` chạy verify thật (test + harness check) | `./init.sh` → `RESULT: PASS` | ✅ harness, ⬜ test app |
| 7 | **Hooks/Guardrails (B4)** | Hook chặn lệnh nguy hiểm + permissions + pre-commit secret + chống injection | `.claude/settings.json`, `.claude/hooks/*`, `.githooks/pre-commit` (`6848d99`) | ✅ |
| 8 | **Harness workflow (B7)** | `feature_list.json` (schema phân cấp) + `claude-progress.md` + clean restart | Bộ harness files + `git log` | ✅ |

> 💡 Bạn **đã có sẵn 6/8 mục có evidence thật** (#1,#2,#4,#6,#7,#8). Chỉ cần hoàn tất **#5 (TDD)** và demo chạy là đủ trọn bộ.
>
> 📌 **B# ↔ Lession#:** B1=L1, B2=L2, B3=L3, B4=L4, B5=L5, B7=L7 (xem "Bản đồ Lession" ở Phần C).

---

## PHẦN F — CHECKLIST SUBMIT (trước 14h T3 30/06)
- [x] Repo đã push (`fit-confidence`) — commit history rõ ràng
- [x] Guardrails/hooks/permissions + harness + feature map đã commit
- [ ] Commit nốt Phase 0 (init.sh verify + schema)
- [ ] App MVP: `recommendSize()` có test RED→GREEN + widget
- [ ] `./init.sh` chạy ra raw output (test + harness PASS) — lưu làm evidence
- [ ] Link demo (Shopify dev store) hoặc video 2–3 phút
- [ ] Slide 6 phần
- [ ] Đính `CLAUDE.md` + `AGENTS.md` + feature map khi submit

---

## 🚀 LÀM GÌ NGAY BÂY GIỜ
1. **Commit nốt Phase 0** (đang chờ review) → push.
2. **Scaffold Shopify Remix app** ngay trong repo này + cập nhật `init.sh` (npm install/test/build).
3. **TDD `recommendSize()`** — viết test trước (đỏ), rồi code cho xanh.
4. Widget + chạy `./init.sh` lấy evidence → demo 170cm/65kg → "M".
