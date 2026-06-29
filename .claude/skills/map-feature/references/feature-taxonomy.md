# Feature Taxonomy — 5 loại node + 5 dimension cho mỗi node

> **Lưu ý:** mỗi node có 2 lớp phân loại độc lập:
> 1. **`type`** (file này) — phân loại logic: Entity / Setting / Action / Display / Integration
> 2. **`layer`** (SKILL.md) — kiến trúc: Shopify Platform / External / Backend / Admin / Storefront
> 3. **`actor`**, **`trigger`**, **`data_store`**, **`sync_mode`**, **`api_scopes`** — xem SKILL.md
>
> File này tập trung mô tả `type`. Mỗi node phải có đầy đủ 7 fields phân loại + 4 fields metadata.


Phân loại đúng `type` của mỗi feature là cơ sở để dependency graph có thể đọc được. Dùng 5 loại sau, KHÔNG tự sáng tạo type mới — nếu một feature không fit, chọn loại gần nhất và note trong `description`.

## 1. Entity

**Định nghĩa:** Một "thing" có instance, có thể tạo nhiều, có CRUD riêng, có metadata.

**Đặc điểm:** Dữ liệu được lưu thành record. Có list view và detail view.

**Ví dụ:**
- Product (Shopify) — có nhiều product, mỗi product có id riêng
- Pickup location (BookFast) — merchant tạo nhiều location
- Discount code — mỗi code là 1 entity
- Customer segment — mỗi segment là 1 entity
- Workflow / Automation — mỗi automation là 1 entity

**Trong graph:**
- Thường nằm "trên cùng" của dependency tree
- Là prerequisite của nhiều Setting / Action / Display khác
- Màu suggest: blue / xanh dương

## 2. Setting

**Định nghĩa:** Một configuration value, áp dụng global (cho toàn app, store, hoặc cho 1 entity), thay đổi behavior.

**Đặc điểm:** Không có CRUD đa instance — chỉ có giá trị. Thường nằm trong Settings page hoặc trong detail panel của entity.

**Ví dụ:**
- Deposit % (BookFast) — 1 setting global hoặc per-product
- Currency
- Timezone
- Email sender name
- "Show inventory count" toggle
- API rate limit

**Trong graph:**
- Thường phụ thuộc Entity (vd "Deposit %" cấu hình *cho* Product)
- Là prerequisite của Action (vd "Charge deposit" cần setting "Deposit %" được set)
- Màu suggest: orange / cam

## 3. Action

**Định nghĩa:** Một việc user (merchant hoặc customer) thực hiện. Có trigger rõ ràng — click button, submit form, gửi request.

**Đặc điểm:** Verb-based. Thường tạo side effect: gửi email, charge tiền, update inventory, log event.

**Ví dụ:**
- Book appointment (customer action)
- Cancel booking
- Send confirmation email
- Charge deposit
- Export report
- Bulk update products
- Reschedule

**Trong graph:**
- Phụ thuộc Entity + Setting (cần có entity tồn tại + setting được config thì mới chạy được)
- Có thể trigger Action khác (vd "Book" trigger "Send confirmation email")
- Màu suggest: green / xanh lá

## 4. Display

**Định nghĩa:** Một thứ user *thấy* — UI surface, widget, page, report — không phải input.

**Đặc điểm:** Read-only từ góc nhìn user. Hiển thị data từ Entity/Action.

**Ví dụ:**
- Booking calendar widget (storefront)
- Analytics dashboard
- Order detail page
- Customer-facing booking history
- Empty state illustration
- Loading skeleton
- Tooltip explainer (chỉ kể khi nó là feature riêng có toggle on/off, không phải mọi tooltip)

**Trong graph:**
- Thường ở "dưới cùng" — depend vào Entity (display data của entity nào)
- Là consumer, hiếm khi là prerequisite
- Màu suggest: purple / tím

## 5. Integration

**Định nghĩa:** Kết nối với hệ thống bên ngoài — third-party app, channel, API.

**Đặc điểm:** Thường có auth flow riêng, có scope/permission, có thể bật/tắt.

**Ví dụ:**
- Google Calendar sync
- Klaviyo integration
- Webhook outbound
- SMS provider (Twilio)
- Payment gateway extension
- Theme extension / App embed
- Checkout extension

**Trong graph:**
- Có thể là prerequisite (vd "SMS confirmation" cần "Twilio integration")
- Có thể là consumer (vd "Send to Klaviyo" Action cần "Klaviyo integration")
- Màu suggest: gray / xám

## Cách phân loại khi ambiguous

### Case 1: Một feature trông vừa giống Entity vừa giống Setting

Hỏi: "User có tạo nhiều cái này không?"
- Có → Entity
- Không, chỉ 1 giá trị / store → Setting

Ví dụ: "Working hours" — nếu mỗi location có giờ riêng và có thể tạo multiple location → "Location" là Entity, "Working hours" là Setting *của* Entity. Nếu chỉ 1 giờ làm việc cho toàn store → "Working hours" là Setting độc lập.

### Case 2: Một feature là cả Action và Display

Ví dụ "Booking calendar" — vừa hiển thị slot vừa cho phép click để book.

→ Tách thành 2 node: `Booking calendar (Display)` và `Book slot (Action)`. Edge `Display → Action` thể hiện "user click vào display để trigger action".

### Case 3: Onboarding step

Onboarding step thường không phải feature — nó là **flow** dùng các feature. Đừng tạo node cho "Step 1: Welcome screen". Nhưng nếu Welcome screen có CTA "Connect Google Calendar" → đó là Action node `Connect Google Calendar`.

### Case 4: Permission / Role

Permission system thường là Setting, không phải Entity. Nhưng nếu có CRUD multiple role với name riêng → Entity.

## Bảng ánh xạ nhanh

| Câu hỏi | Loại |
|---|---|
| Có thể tạo nhiều instance không? | Entity |
| Là 1 giá trị config thay đổi behavior? | Setting |
| User click/submit để làm gì đó? | Action |
| User chỉ xem, không tương tác? | Display |
| Kết nối với hệ thống bên ngoài? | Integration |

## Distribution lành mạnh

Trong inventory ~25-35 node của 1 app trung bình, distribution thường rơi vào:
- Entity: 4-7 (20%)
- Setting: 6-10 (25-30%)
- Action: 6-10 (25-30%)
- Display: 4-7 (15-20%)
- Integration: 2-5 (10%)

Nếu bạn có 20 Action mà chỉ 1 Entity → có thể đang miss entity. Nếu có 15 Setting → có thể đang lump tất cả config lại thay vì gộp cùng feature. Re-check inventory.
