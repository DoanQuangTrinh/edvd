# Blueprint: Trình chỉnh sửa video nền tảng web

## Tổng quan

Dự án này là một trình chỉnh sửa video hoạt động trên nền tảng web, được xây dựng bằng Next.js và tích hợp trong môi trường Firebase Studio. Mục tiêu là tạo ra một ứng dụng có các chức năng chỉnh sửa video chuyên nghiệp, đáp ứng các yêu cầu về hiệu suất và tính năng của người dùng.

---

## Lộ trình phát triển

### Core (MVP)

*   [x] **Tải/nhập phương tiện:** Video (từ tệp cục bộ).
*   [ ] **Tải/nhập phương tiện:** Âm thanh, hình ảnh (hỗ trợ kéo và thả).
*   [x] **Bảng xem trước video:** Có chức năng phát/tạm dừng, con trỏ đồng bộ.
*   [x] **Timeline đa track:** Ít nhất 2 track video.
*   [x] **Cắt/Tỉa clip.**
*   [x] **Tách clip.**
*   [x] **Di chuyển clip trên timeline (Drag & Drop):** Sắp xếp lại thứ tự, di chuyển giữa các track.
*   [x] **Di chuyển/thay đổi kích thước clip:** Có tính năng hít vào cạnh.
*   [x] **Hiệu ứng chuyển cảnh đơn giản (`fade`, `fadeblack`).**
*   [x] **Lớp phủ văn bản cơ bản:** Thêm, sửa, phông chữ, màu sắc, vị trí.
*   [x] **Xuất video:** Phía máy khách qua `ffmpeg.wasm` (hỗ trợ ghép nối và hiệu ứng `xfade`).
*   [x] **Hoàn tác/Làm lại (Undo/Redo).**
*   [x] **Giao diện đáp ứng (Responsive UI).**
*   [x] **Tái cấu trúc mã nguồn thành các component nhỏ hơn.**
*   [x] **Phím tắt** cho các hành động phổ biến.
*   [x] **Quản lý Track:** Thêm/Xóa/Khóa/Ẩn track.

### Advanced (v1+)

*   [ ] **Hiệu ứng & Bộ lọc:** Độ sáng/tương phản/bão hòa, hỗ trợ LUT.
*   [ ] **Keyframing:** Cho vị trí/tỷ lệ/độ mờ.
*   [ ] **Speed Ramping:** Tốc độ thay đổi, đảo ngược video.
*   [ ] **Thư viện nhãn dán & tài sản tích hợp.**
*   [ ] **Hoạt ảnh / mẫu văn bản.**
*   [ ] **Hòa âm (Audio mixing):** Tự động hóa âm lượng, fade in/out, EQ cơ bản.
*   [ ] **Mặt nạ & Cắt/biến đổi:** Xoay/tỷ lệ.
*   [ ] **Tăng tốc GPU:** Qua WebGL/WebGPU cho pipeline xem trước.
*   [ ] **Chỉnh sửa cộng tác (Tùy chọn).**
*   [ ] **Mẫu & cài đặt trước, siêu dữ liệu clip, biểu đồ/dạng sóng.**

---

## Kế hoạch hiện tại: 3️⃣ Triển khai Hỗ trợ Âm thanh & Hình ảnh

**Mục tiêu:** Cho phép người dùng tải lên và chỉnh sửa các tệp âm thanh và hình ảnh bên cạnh video.

**Các bước thực hiện:**

1.  **Cập nhật Kiểu Dữ liệu (`types.ts`):**
    *   Thêm thuộc tính `type: 'video' | 'audio'` vào interface `Track`.
    *   Thêm thuộc tính `type: 'video' | 'audio' | 'image'` vào interface `Clip`.

2.  **Cập nhật Logic Tải Media (`VideoEditor.tsx`):**
    *   Đổi tên `handleVideoUpload` thành `handleMediaUpload`.
    *   Trong hàm mới, xác định loại tệp (video, audio, image) dựa trên phần mở rộng hoặc mimetype.
    *   Sử dụng một hàm `getMediaDuration` chung để lấy thời lượng từ các phần tử `<video>` và `<audio>`.
    *   Đối với hình ảnh, gán một thời lượng mặc định (ví dụ: 5 giây).
    *   Tự động thêm media vào track phù hợp đầu tiên (video/image vào track video, audio vào track audio). Nếu không có track phù hợp, có thể tạo một track mới.

3.  **Cập nhật Quản lý Track (`VideoEditor.tsx` & `ActionsPanel.tsx`):**
    *   Trong `VideoEditor.tsx`, cập nhật hàm `handleAddTrack` để chấp nhận một tham số `type: 'video' | 'audio'`.
    *   Trong `ActionsPanel.tsx`, thêm nút "Add Audio Track" bên cạnh nút "Add Track" (đổi tên thành "Add Video Track").

4.  **Nâng cấp Giao diện Timeline (`Timeline.tsx`):**
    *   Cập nhật `SortableTimelineClip` để hiển thị các loại clip khác nhau:
        *   **Video/Image:** Giữ nguyên hiển thị thumbnail.
        *   **Audio:** Hiển thị dưới dạng một khối màu xanh lam với tên tệp. Thời lượng có thể điều chỉnh như video.
    *   Trong `handleDragEnd`, thêm logic để chỉ cho phép kéo-thả clip vào các track có cùng loại.
    *   Cập nhật phần điều khiển track để hiển thị loại track (ví dụ: "Video 1", "Audio 1").

5.  **Cập nhật Bảng điều khiển Tải lên (`ControlPanels.tsx`):**
    *   Thay đổi thuộc tính `accept` của input tệp để cho phép các loại tệp `audio/*` và `image/*`.
    *   Cập nhật văn bản trên giao diện để thông báo cho người dùng rằng họ có thể tải lên cả ba loại media.
