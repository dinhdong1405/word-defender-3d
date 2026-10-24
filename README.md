# WORD DEFENDER 3D — DingDongSpeak

Game thủ thành luyện từ vựng tiếng Anh bằng đồ họa 3D tương tác. Gõ đúng, bắn trúng, giữ vững phòng tuyến!

## 1. Cách chạy ứng dụng

```bash
# Cài đặt dependencies (đã cài sẵn)
npm install

# Khởi chạy server phát triển
npm run dev

# Chạy kiểm thử tự động (Unit Tests)
npm run test

# Chạy kiểm tra kiểu dữ liệu (TypeScript Typecheck)
npx tsc --noEmit

# Đóng gói sản phẩm (Production Build)
npm run build
```

Sau khi chạy `npm run dev`, mở trình duyệt truy cập: `http://localhost:3000/`.

---

## 2. Các tính năng chính đã hoàn thiện

1. **Đồ họa 3D thực thụ (Three.js)**:
   - Tháp pháo cơ khí đa khớp (Turret Rig) tự động xoay nòng theo tọa độ 3D của từ mục tiêu, giật nòng khi bắn, hiệu ứng chớp lửa đầu nòng (muzzle flash) và tia ngắm laser.
   - Các khối tinh thể từ vựng 3D rơi từ bầu trời không gian, có độ dày vật lý, viền sáng neon, trạng thái cảnh báo nguy cấp khi gần phòng tuyến và bảng chữ sắc nét, tương phản cao.
   - Đường bay đạn plasma (projectiles) với vệt sáng bay từ tháp pháo đến khối từ mục tiêu.
   - Hiệu ứng nổ hạt (particle burst), sóng xung kích (shockwaves) khi tiêu diệt từ hoặc khi từ rơi chạm đất.
   - Bầu trời không gian đa tầng với tinh vân, bụi sao và mây chuyển động thị sai (parallax).

2. **Cơ chế Gameplay chuẩn xác**:
   - **Tự động khóa mục tiêu theo ký tự đầu tiên**: Gõ chữ cái đầu tiên của từ gần phòng tuyến nhất để khóa mục tiêu. Bấm `Tab` để chuyển đổi mục tiêu linh hoạt.
   - **Bắn súng theo nhịp gõ phím**: Mỗi ký tự đúng khai hỏa 1 phát đạn laser thực sự. Hoàn tất từ kích hoạt nổ tiêu diệt khối từ và cộng điểm combo.
   - **Mất mạng & Game Over**: Bắt đầu với 3 tim. Khối từ chạm đất làm mất 1 tim kèm sóng xung kích rung lắc. Hết 3 tim sẽ kết thúc ván đấu.
   - **Tính điểm & Thống kê**: Tích lũy điểm, chuỗi combo liên tiếp, độ chính xác (Accuracy %), tốc độ gõ (WPM), và cấp độ phòng thủ.
   - **Chế độ Luyện tập Zen**: Tùy chọn luyện gõ từ không mất mạng.

3. **Nhập Bộ Từ Bằng Excel & CSV (Excel Import Wizard 5 bước)**:
   - Hỗ trợ file `.xlsx` và `.csv`.
   - Cho phép chọn Sheet đối với file Excel nhiều trang.
   - Tự động nhận diện tiêu đề cột tiếng Anh và tiếng Việt (kể cả file tối giản chỉ gồm 2 cột: `Từ tiếng Anh` và `Nghĩa tiếng Việt`).
   - Bảng xem trước và chỉnh sửa trực tiếp, gắn nhãn lỗi (Errors), cảnh báo (Warnings), phát hiện và xử lý trùng lặp.
   - Tải file mẫu `.xlsx` và `.csv` trực tiếp từ trình duyệt.
   - Lưu trữ dữ liệu an toàn cục bộ (IndexedDB) không cần phụ thuộc máy chủ.

4. **Thư viện bộ từ vựng phong phú**:
   - Tích hợp sẵn 4 bộ từ vựng chất lượng cao (>25 từ/bộ):
     1. `Everyday English A1` (28 từ vựng đời sống)
     2. `Food & Drinks` (26 từ vựng ẩm thực)
     3. `School & Study` (26 từ vựng trường học)
     4. `Travel & Transport` (26 từ vựng du lịch & phương tiện)
   - Lưu trữ bộ từ cá nhân trong IndexedDB, cho phép nhân bản (duplicate), xuất file CSV (export) và xóa.

5. **Phát âm & Âm thanh**:
   - Hệ thống âm thanh tổng hợp thuần Web Audio API: tiếng laser, tiếng gõ phím tick, tiếng nổ rumble, chuông combo, cảnh báo mất tim.
   - Phát âm tiếng Anh (TTS) tự động khi tiêu diệt từ vựng hoặc khi xem danh sách từ cần ôn tập.

---

## 3. Cách thêm bộ từ chính thức mới

Để thêm bộ từ mới vào danh sách chính thức của hệ thống:
1. Tạo file JSON trong thư mục `src/data/official-packs/<tên-file>.json` theo cấu trúc:
```json
{
  "id": "official-ten-bo-tu",
  "title": "Tên Bộ Từ",
  "description": "Mô tả bộ từ",
  "sourceType": "official",
  "visibility": "public",
  "level": "B1",
  "topic": "Chủ đề",
  "tags": ["tag1", "tag2"],
  "version": 1,
  "wordCount": 25,
  "entries": [
    { "id": "e1", "term": "word", "meaningVi": "nghĩa", "ipa": "/wɜːd/", "cefr": "B1" }
  ]
}
```
2. Đăng ký bộ từ vào `src/data/official-packs/manifest.json`.
3. Bổ sung import vào `src/services/pack-repository.ts`.
