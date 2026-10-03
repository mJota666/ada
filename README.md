# ADA 2026 – Bản dịch tiếng Việt chuyên ngành

Website đọc và tra cứu bản dịch tiếng Việt không chính thức của *Standards of Care in Diabetes—2026*.

## Chạy tại máy

Do nội dung được tải bằng `fetch`, hãy chạy một HTTP server tại thư mục `docs`:

```bash
python -m http.server 8000 --directory docs
```

Sau đó mở `http://localhost:8000`.

## Xuất bản bằng GitHub Pages

Workflow trong `.github/workflows/pages.yml` tự động xuất bản thư mục `docs` khi có thay đổi trên nhánh `main`. Trong GitHub, vào **Settings → Pages → Build and deployment → Source** và chọn **GitHub Actions**.

## Cập nhật chương

Đặt tệp Markdown tại `docs/chapters/chapter-XX.md`, sau đó cập nhật trạng thái chương trong `docs/assets/app.js` từ `false` thành `true`.

## Lưu ý

Đây là bản dịch không chính thức phục vụ học tập và tham khảo chuyên môn. Nội dung không thay thế tài liệu gốc, đánh giá lâm sàng hoặc quy định chuyên môn tại địa phương.
