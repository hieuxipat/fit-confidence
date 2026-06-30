# Demo screenshots

Ảnh dùng cho slide/clip thuyết trình. Mỗi ảnh map sẵn với mục trình bày + Lesson.

## Đã có

| Ảnh | Nội dung | Dùng cho mục | Lesson |
|---|---|---|---|
| `01-feature-map.png` | Dependency map đối thủ Kiwi (swimlane 5 layer, 31 feature, Complex 10/12) — `/map-feature` | Mục 1 (cắt scope), Mục 2 | **L2** |
| `02-prototype-widget.png` | Prototype storefront: PDP + nút "Find my size" (nguồn sự thật UI) | Mục 1, Mục 7 | **L5, L7** |
| `04-widget-modal.png` | Prototype: modal nhập số đo (Height/Weight/Fit) | Demo storefront | L7 |
| `05-widget-result-M.png` | Prototype: kết quả **M** + lý do "170cm & 65kg fall in M…" | **Mục 4 (Kết quả)** ⭐ | **L3** |
| `03-prototype-admin.png` | Prototype admin: trang Polaris sửa size chart | Mục 7 | **L5** |
| `06-theme-editor-add-block.png` | **LIVE**: theme editor → Add block → app "Size Finder / Fit Confidence" | Mục 4, demo storefront | **L7** |
| `07-admin-home-live.png` | **LIVE**: admin Home dashboard (Get started 3 bước + How it works + What's next) | **Mục 4 / Mục 7** ⭐ | **L5** |
| `08-admin-sizechart-live.png` | **LIVE**: admin Size chart editor thật (S/M/L/XL ranges) | **Mục 4 (admin↔storefront)** ⭐ | **L5, L6** |
| `11-storefront-live.png` | **LIVE**: storefront PDP thật + nút "Find my size" | **Mục 4** | L3, L7 |
| `11c-storefront-modal.png` | **LIVE**: modal mở trên storefront thật (176/72/Regular) | Mục 4 | L7 |
| `11b-storefront-result-M.png` | **LIVE**: kết quả **M** + lý do "176cm & 72kg fall in M…" trên storefront thật (bản `fit-confidence-3`) | **Mục 4 (KẾT QUẢ thật)** ⭐⭐ | **L3** |

> ✅ Widget chạy **end-to-end trên storefront thật** (deployed `fit-confidence-3`, không cần `shopify app dev`). `11b` là cặp "live" của prototype `05`.

> Ảnh 01–05 chụp tự động từ HTML (playwright-cli over `http://127.0.0.1:8765`, vì `file://` bị chặn). Ảnh 06–08 là live trên dev store `hieu-test-app-1`.

| `09-research-5apps.png` | **Research**: dashboard "5 app cơ hội" (Size Finder Impact Rất cao/Complexity Thấp) | **Mục 1** ⭐ | **L1** |
| `10-research-kiwi.png` | **Research**: deep-dive Kiwi competitor (184+ app, 42,977 installs, −4% YoY, bảng so sánh) | **Mục 1** ⭐ | **L1, L2** |
| `12-dev-dashboard-v3.png` | **LIVE**: dev dashboard — version `fit-confidence-3` **Active** (scopes read_products, extension UID khớp deep-link) | Mục 4 / Mục 7 | L7 |

| `15-initsh-pass.png` | **Terminal card**: `./init.sh` → `RESULT: PASS` (21/21 + harness checks) | **Mục 4** ⭐ | L3, L7 |
| `16-npm-test.png` | **Terminal card**: `npm test` → 21 passed (3 suites) | Mục 4 | L3 |
| `17-git-log.png` | **Terminal card**: `git log --oneline` — commit history | Mục 2 | L7 |
| `18-codegraph.png` | **Terminal card**: `codegraph_explore` blast-radius + `impact` | Mục 7, Mục 5 | L6 |

> Ảnh 15–18 render từ **output terminal thật** thành "terminal card" (playwright over local HTTP), không cần chụp tay.

## ✅ Đủ bộ — 18 ảnh phủ trọn 6 mục + luồng build (xem cột "Mục / Lesson").
