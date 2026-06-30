# Bài trình bày cuối khóa — Shopify app **Fit Confidence** (Size Finder)

> App đơn giản nhưng **thật và demo được**: rõ logic, rõ cách làm, có evidence chạy được. Repo được dựng theo mô hình **harness 5-subsystem** (xem `README.md`); app chạy *bên trong* harness đó. Toàn bộ vòng đời — từ tìm cơ hội thị trường đến code có kiểm chứng — áp dụng kiến thức khóa học.

---

## 1. Mục tiêu của app

**Vấn đề:** thời trang online đổi/trả ~30%, phần lớn do **chọn sai size**. Khách ngại đoán S hay M → bỏ giỏ hoặc mua rồi trả.

**App giải quyết:** widget **"Find my size"** trên trang sản phẩm — khách nhập chiều cao / cân nặng / kiểu mặc → app gợi ý **S/M/L/XL + lý do**, dựa trên **size chart merchant tự cấu hình** trong admin. Logic **rule-based, có unit test**, không "AI đoán", không gửi dữ liệu khách đi đâu.

**Định vị (từ phân tích đối thủ Kiwi Sizing):** Kiwi khóa recommender sau gói Plus + dán watermark ở gói Free. Fit Confidence đi ngược: **recommender miễn phí, không watermark, gọn** — hợp **merchant nhỏ** trong hệ sinh thái Omegatheme.

**Phạm vi (đủ 2 mặt một Shopify app thật):** storefront (Theme App Extension) **+** admin (embedded React Router app, trang Polaris sửa chart), nối nhau qua **app-owned metafield** (không cần database).

---

## 2. Đã áp dụng kiến thức nào từ khóa học

| Kiến thức (buổi) | Áp dụng trong project | Evidence |
|---|---|---|
| **Prompt/Context Engineering** | Prompt research role; `docs/shopify-conventions.md` đóng gói domain knowledge cho agent | file conventions |
| **Planning + Delegation (skills)** | `/map-feature` ra dependency map đối thủ 31 feature → **cắt scope** về 4 hub; brainstorm → spec → plan có artifact | `outputs/kiwi-sizing-feature-map.html`, `docs/features/size-finder/{specs,plans}` |
| **CLAUDE.md / AGENTS.md** | AGENTS.md = entrypoint chuẩn (đa model); CLAUDE.md = operating loop cho Claude Code | repo root |
| **Hooks / Permissions / Guardrails** | hook chặn lệnh nguy hiểm + allow/ask/deny + pre-commit chặn secret + chống injection; **tự bảo vệ chính nó** | `.claude/`, `.githooks/pre-commit` |
| **TDD / Testing** | `recommendSize` (11 test) + `validateChart` (5) RED→GREEN; + test hành vi server (4) + regression (1) = **21 test** | `app/.../*.test.js` |
| **Verification** | `init.sh` chạy `npm test` + `shopify app build` + `verify-harness.sh` (artifact + schema + hook self-test) | `./init.sh` → **RESULT: PASS** |
| **Harness workflow** | `feature_list.json` (schema phân cấp, status/DoD/evidence/**risk**) + `claude-progress.md` + restartable | harness files |
| **MCP** | dùng **codegraph** (knowledge graph) + Shopify MCP skills validate GraphQL/Polaris vs schema | demo live `mcp__*` |
| **Subagent + Risk Matrix** | audit độ phủ kiến thức bằng **7 subagent song song**; custom agent `code-reviewer`; Risk Matrix máy enforce | `.claude/agents/`, `AGENTS.md` |

---

## 3. AI đã hỗ trợ phần nào

AI (Claude Code) hỗ trợ: **research** thị trường/đối thủ, **brainstorm** spec/plan, **generate** widget + trang admin, **viết test**, **debug**, và **tự audit** độ phủ kiến thức. **Tôi giữ vai PM + reviewer**: quyết hướng, chọn scope, review code, **dựng guardrails để AI không phá** và yêu cầu evidence trước khi nhận "done".

> Điểm nhấn: đây là **đổi vai coder → PM**. Một ví dụ ReAct loop điển hình: đọc stack trace → tìm root cause → sửa → chạy test xác nhận.

---

## 4. Kết quả đạt được

- **Chạy thật, demo được end-to-end** trên dev store `hieu-test-app-1`: sửa chart trong admin → Save (toast) → widget storefront đổi gợi ý.
- **Số liệu thật:** `npm test` **21/21** xanh · `shopify app build` OK · `react-router build` compile route admin · `./init.sh` → **RESULT: PASS**.
- **Đã deploy:** version **`fit-confidence-2`** (storefront widget chạy trên CDN Shopify, không cần server).
- App **gọn 3 màn**: Home (dashboard hướng dẫn), Size chart (editor), storefront widget.
- Lưu chart qua **app-owned metafield `$app:fit_confidence`** — không database.

🏷️ *Done = có evidence (commit + raw output `./init.sh`), không phải "AI nói xong".*

---

## 5. Khó khăn gặp phải & cách xử lý

1. **AI bịa công thức sizing** → khóa lại bằng **size chart thật + unit test** (test là hợp đồng).
2. **Metafield ownership / scope** (ca đắt nhất): thêm `write_metafields` → Shopify báo *"scope invalid"* (đã bị bỏ). Tra docs → hiểu **merchant-owned cần scope, app-owned `$app` thì không** → đổi sang reserved namespace `$app:fit_confidence`.
3. **3 bug bắt được khi demo live** (đọc lỗi → root cause → fix → regression test): query GraphQL bị `#` comment hết dòng; `document.currentScript` = null trong `<script type=module>`; theme-check lỗi vì literal `<script` trong comment JS.
4. **Skill design-prototype khóa vào Polaris/Admin** → không hợp storefront widget → nhận ra & **tự author** thay vì ép sai tool.
5. **codegraph trên app nhỏ là overkill** → **dùng có chọn lọc** (giá trị thật = blast-radius + flag test gap), không ép dùng tràn.

🏷️ *Systematic Debugging + chọn đúng tool + judgment (biết khi nào KHÔNG dùng tool nặng).*

---

## 6. Bài học rút ra

1. **Áp dụng kiến thức TỪ khâu chọn đề tài** — đọc dependency map đối thủ để cắt scope, không "làm app rồi mới nghĩ áp dụng gì".
2. **Plan kỹ + có test → AI nhanh và đáng tin hơn.** Test/verification là "hợp đồng" giữ AI đúng hướng.
3. **Harness + guardrails giữ AI không đi lạc / không phá** — hook tất định cho luật cứng, CLAUDE.md/AGENTS.md cho hướng dẫn.
4. **Done = evidence, không phải lời nói** — `./init.sh` PASS + commit history là minh chứng.
5. **Judgment quan trọng ngang công cụ** — biết *khi nào dùng* (và khi nào KHÔNG dùng) một tool/skill; tự kiểm chứng độ phủ thay vì tin tưởng.

---

### Phụ lục — cách demo live (gợi ý 2–3 phút)
1. `git log --oneline` + chạy `./init.sh` → cho xem **RESULT: PASS** (21/21).
2. Admin → **Size chart** → sửa 1 dải của M → **Save** (toast). Thử Save sai (min>max) → banner đỏ.
3. Storefront → **Find my size** → nhập số đo → ra size + lý do; nhập số đo biên → đổi theo chart vừa sửa.
4. (tùy chọn) `codegraph_explore` 1 call cho thấy blast-radius — minh họa "context tool".

> Cần `shopify app dev` chạy để màn **admin** load (App URL = tunnel); storefront widget thì chạy độc lập trên CDN.
