# Demo screenshots

Ảnh dùng cho slide/clip thuyết trình. Mỗi ảnh map sẵn với mục trình bày + Lesson.

## Đã chụp tự động (từ HTML trong repo)

| Ảnh | Nội dung | Dùng cho mục | Lesson |
|---|---|---|---|
| `01-feature-map.png` | Dependency map đối thủ Kiwi (swimlane 5 layer, 31 feature, Complex 10/12) — `/map-feature` | Mục 1 (cắt scope), Mục 2 | **L2** |
| `02-prototype-widget.png` | Prototype storefront: PDP + nút "Find my size" (nguồn sự thật UI) | Mục 1, Mục 7 (Phase 2 design) | **L5, L7** |
| `04-widget-modal.png` | Modal nhập số đo (Height/Weight/Fit) | Demo storefront | L7 |
| `05-widget-result-M.png` | Kết quả gợi ý **M** + lý do "170cm & 65kg fall in M…" | **Mục 4 (Kết quả)** ⭐ | **L3** |
| `03-prototype-admin.png` | Prototype admin: trang Polaris sửa size chart (S/M/L/XL) | Mục 7 (Phase 4) | **L5** |

> Cách tái tạo: `python3 -m http.server 8765` ở repo root, rồi mở
> `http://127.0.0.1:8765/<đường-dẫn-html>` và chụp (playwright-cli chặn `file://`).

## Cần BẠN chụp tay (không tái tạo tự động được)

| Ảnh nên thêm | Cách lấy | Dùng cho | Lesson |
|---|---|---|---|
| `06-research-5apps.png` | Ảnh dashboard "5 app cơ hội" (bạn đã có — ảnh #24) | Mục 1 | L1 |
| `07-research-kiwi.png` | Ảnh deep-dive Kiwi competitor (bạn đã có — ảnh #25) | Mục 1 | L1, L2 |
| `08-initsh-pass.png` | Chụp terminal chạy `./init.sh` → `RESULT: PASS` + `npm test 21/21` | **Mục 4** ⭐ | L3, L7 |
| `09-git-log.png` | Chụp `git log --oneline -20` (evidence là commit thật) | Mục 2 | L7 |
| `10-admin-live.png` | Chụp **admin Size chart** thật trên dev store (cần `shopify app dev`) | Mục 4 | L5, L6 |
| `11-storefront-live.png` | Chụp **storefront "Find my size"** thật (cần `shopify app dev`) | Mục 4 | L3, L7 |
| `12-codegraph.png` | Chụp terminal `codegraph init` + `codegraph_explore` (blast-radius) | Mục 7, Mục 5 | L6 |

> Lý do không tự chụp được: live app cần đăng nhập Shopify + `shopify app dev`;
> terminal không phải web page; 2 ảnh research là output tool ngoài repo.
