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
| `11-storefront-live.png` | **LIVE**: storefront PDP thật + nút "Find my size" (không phải prototype) | **Mục 4** ⭐ | **L3, L7** |

> 💡 `11` mới chụp nút (trước khi click). Nếu kịp, chụp thêm **kết quả modal LIVE** (bấm Find my size → nhập số đo → gợi ý) làm `11b-storefront-result.png` cho trọn cặp với prototype `05`.

> Ảnh 01–05 chụp tự động từ HTML (playwright-cli over `http://127.0.0.1:8765`, vì `file://` bị chặn). Ảnh 06–08 là live trên dev store `hieu-test-app-1`.

## Còn nên thêm (tùy chọn — để slide trọn bộ)

| Ảnh nên thêm | Cách lấy | Dùng cho | Lesson |
|---|---|---|---|
| `09-research-5apps.png` | Ảnh dashboard "5 app cơ hội" (đã có — ảnh research #24) | Mục 1 | L1 |
| `10-research-kiwi.png` | Ảnh deep-dive Kiwi competitor (đã có — ảnh research #25) | Mục 1 | L1, L2 |
| `11-initsh-pass.png` | Chụp terminal `./init.sh` → `RESULT: PASS` + `npm test 21/21` | **Mục 4** ⭐ | L3, L7 |
| `12-git-log.png` | Chụp `git log --oneline -20` | Mục 2 | L7 |
| `14-codegraph.png` | Chụp terminal `codegraph init` + `codegraph_explore` (blast-radius) | Mục 7, Mục 5 | L6 |
| `11b-storefront-result.png` | (tùy chọn) kết quả modal "Find my size" LIVE | Mục 4 | L3 |

> Lý do chưa tự chụp: terminal không phải web page; live storefront cần `shopify app dev` + thao tác; 2 ảnh research là output tool ngoài repo.
