# Methodology — Feature Dependency & Flow Mapping

Tài liệu này giải thích sâu 4-step framework trong SKILL.md, kèm ví dụ minh hoạ với một app booking giả định (gọi là `BookFast`). Đọc file này khi bạn cần hiểu *tại sao* mỗi bước được làm theo cách đó, hoặc khi gặp case ambiguous.

## Bước 1 — Source data: chiến lược thu thập

### Thứ tự ưu tiên nguồn data

Khi có nhiều nguồn, ưu tiên theo độ tin cậy:

1. **Dev store cài app thật** (nếu user có access) — observed ground truth. Trust cao nhất.
2. **Onboarding screenshots / video demo** — observed nhưng có thể đã được edit/highlight, vẫn high trust.
3. **Help center / KB articles** — đối thủ tự document. Trust cao về *function*, đôi khi outdated về *UI*.
4. **App Store listing (bullets, screenshots, video)** — marketing language, có thể overpromise. Trust trung bình.
5. **User reviews** — gián tiếp, tiết lộ pain point và workflow thật. Trust cho *behavior*, không cho *feature spec*.
6. **Competitor blog / changelog** — tiết lộ roadmap và priority. Trust cao về *intent*.

Khi 2 nguồn xung đột, ưu tiên nguồn cao hơn trong list này và note trong `evidence` field.

### Ví dụ: BookFast

User cung cấp:
- Link `apps.shopify.com/bookfast` (App Store listing)
- 3 screenshot onboarding upload tay
- 1 link KB article "How to set up recurring bookings"

Workflow:
1. `WebFetch` App Store listing → lấy feature bullet, pricing tier, screenshot caption.
2. Đọc 3 screenshot user upload → list các UI element thấy được.
3. `WebFetch` KB article → ghi nhận flow theo cách họ document.
4. List ra ~25 feature observed, mark evidence cho mỗi cái.

Nếu KB không load được vì JS-rendered → escalate `mcp__claude-in-chrome__navigate` + `get_page_text`.

## Bước 2 — Inventory: phân biệt feature vs noise

### Quy tắc 1: Feature phải có boundary

Một thứ là feature nếu nó có **trạng thái độc lập** — bật/tắt được, có/không có, hoặc có cấu hình riêng. Một tooltip giải thích không phải feature. Một label không phải feature. Một section header không phải feature.

Ví dụ BookFast:
- ✅ "Pickup location" — bật được, có cấu hình address, có thể có nhiều
- ❌ "Pickup details" (tên section trong setting) — chỉ là grouping
- ✅ "Deposit %" — setting có giá trị
- ❌ "Currency" (chỉ display USD) — không có toggle

### Quy tắc 2: Hai feature gộp nếu chúng share state

Nếu "Email confirmation" và "SMS confirmation" cùng dùng chung template editor và toggle channel, đó là 1 feature `Notification` với 2 channel. Không phải 2 node riêng.

Ngược lại, nếu "Order email" và "Booking email" có template editor *riêng* và logic gửi *riêng*, đó là 2 node.

### Quy tắc 3: Mỗi node phải có >= 1 evidence

Nếu bạn không thể chỉ ra screenshot/URL/quote nào hỗ trợ node này → đừng tạo node. Nếu cần suy đoán, tạo node với `evidence: "inferred from <reason>"` và đánh dấu visually khác trong graph (vd dashed border).

## Bước 3 — Dependency vs Flow: tại sao tách

### Tại sao tách rạch ròi

Khi merge 2 loại quan hệ này vào cùng 1 graph, bạn mất khả năng đọc:
- Edge "phụ thuộc" và edge "đi sau" trông giống nhau
- Cùng 1 cặp node có thể có cả 2 quan hệ → multi-edge gây rối
- Không thể filter chỉ xem 1 góc nhìn

### Cách xác định dependency (logical)

Hỏi: "Nếu xoá feature A, feature B có chạy được không?"
- Không chạy được → A là prerequisite của B
- Chạy nhưng giảm value → A là enhancer của B (edge yếu hơn, có thể dashed)
- Vẫn chạy bình thường → không có dependency

### Cách xác định flow (temporal)

Hỏi: "Trong journey của persona X, feature B xuất hiện trước hay sau A?"
- Sau A → A → B trong flow của persona X
- Có thể xuất hiện độc lập → không phải edge flow giữa A và B
- Phụ thuộc context → vẽ 2 flow riêng

Lưu ý: flow phụ thuộc persona. Cùng feature A và B có thể có thứ tự khác nhau giữa "merchant onboarding" và "customer ordering". Vẽ 1 flow / persona.

### Ví dụ BookFast

Feature `F003: Pickup location` và `F012: Pickup-only order`.

Dependency: F012 cần F003 (logic — không có location thì không có pickup-only order). → Edge F003 → F012 trong dependency graph.

Flow:
- Persona "Merchant onboarding": F003 (set up location) → F012 (toggle pickup-only)
- Persona "Customer ordering": F012 (chọn pickup) → F003 (chọn location)

Cùng 2 node, 2 flow ngược chiều nhau. Đây là lý do KHÔNG được trộn vào dependency graph.

## Bước 4 — Output: kết hợp 2 deliverable

### Markdown để đọc, HTML để khám phá

Markdown tốt cho:
- Review nhanh trong VS Code / GitHub
- Paste vào Notion / Crisp / PRD
- Diff giữa các phiên bản audit (vd audit lại sau 6 tháng)
- Inventory table sortable

HTML interactive tốt cho:
- Demo cho stakeholder trong cuộc họp
- Khám phá khi không nhớ feature ID cụ thể
- Filter theo type/surface/plan
- Toggle giữa dependency và flow view

Sinh cả 2 vì user thường cần cả 2 use case.

### 3 insight cuối

Sau khi sinh file, luôn rút ra **3 insight chính** từ map. Đây không phải optional — đây là phần value cao nhất của skill. Vẽ map mà không gọi tên insight = chỉ làm hộ visualization, không làm hộ analysis.

Format insight gợi ý:
1. **Core path**: feature nào nằm trên path mà mọi user phải đi qua (high leverage)
2. **Gating choke**: feature nào là choke point cho upsell (paywall hợp lý)
3. **Hidden complexity**: feature nào trông đơn giản nhưng có nhiều prerequisite ẩn (nếu mình build, sẽ tốn nhiều effort hơn nhìn bề ngoài)

Ví dụ BookFast:
- Core path: `Product type → Booking calendar → Deposit setting` là path mọi merchant phải đi qua. Mình nên invest UX vào đây.
- Gating choke: Recurring booking nằm sau 4-feature dependency chain, ở plan Pro. Đây là họ gating cố ý.
- Hidden complexity: "Cancel & refund" trông đơn giản nhưng phụ thuộc 6 feature khác (deposit, notification, calendar update, inventory release...). Nếu mình build, plan kỹ.

## Khi data thiếu

Trường hợp user chỉ có App Store listing + 1 screenshot:
- Inventory thực tế dựng được khoảng 30-50% feature
- Không nên vẽ flow của customer journey (thiếu data)
- Có thể vẽ flow của merchant onboarding nếu screenshot là onboarding
- Mark rõ `evidence` cho mỗi node + note "data limited" trong markdown header

Khuyến khích user upload thêm screenshot hoặc cài dev store thử.
