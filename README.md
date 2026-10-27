# Ponpi: Word Blaster (Word Defender)

Game luyện gõ từ vựng tiếng Anh tương tác kết hợp lối chơi thủ thành (Typing Shooter) phong cách **Sổ tay vẽ tay ô ly (Hand-drawn Notebook Grid)** độc đáo.

---

## 🌟 Tính Năng Nổi Bật

1. **Phong Cách Sổ Tay Ô Ly Hoài Niệm (Hand-Drawn Notebook Theme)**:
   - Giao diện tối giản, tinh tế như được vẽ bằng bút chì và mực trên trang giấy học trò.
   - Hiệu ứng âm thanh gõ bút, lật trang, nổ hạt giấy sống động.

2. **Mascot Ponpi & Hệ Thống Tùy Biến Đa Dạng**:
   - Nhân vật chính Ponpi với 5 tư thế ngắm bắn chân thực theo hướng di chuyển của quái.
   - **Kho Skin phong phú**: Ninja, Samurai, Ghost, Basketball, Soccer, Gladiator, Builder, Halloween...
   - **Đạn bắn đặc sắc**: Shuriken, Kunai, Tên lửa mini, Bóng đá, Bóng rổ...

3. **3 Chế Độ Học Thông Minh**:
   - **Chép chính tả (Spelling Copy)**: Gõ chữ theo từ tiếng Anh hiển thị.
   - **Hồi tưởng (Meaning Recall)**: Xem nghĩa tiếng Việt và gõ từ tiếng Anh tương ứng.
   - **Nghe phát âm (Listening)**: Nghe phát âm tiếng Anh chuẩn (Web Audio Speech Synthesis) và gõ lại từ.
   - Tích hợp thuật toán lặp lại ngắt quãng (Spaced Repetition System) giúp ghi nhớ từ vựng lâu dài.

4. **Hệ Thống Bản Đồ (Battle Maps)**:
   - Nhiều khu vực chiến đấu thử thách: Sân trường, Lớp học, Hẻm Núi Đỏ (Red Canyon)...

5. **Kinh Tế, Cửa Hàng & Tủ Đồ (Wardrobe & Store)**:
   - Tích lũy Xu (Coins) qua mỗi màn chơi và bài học.
   - Mua sắm trang phục, đạn và kỹ năng hỗ trợ (Đóng băng/Làm chậm quái vật, bom diện rộng).
   - Thử đồ và đổi skin trực quan ngay trong phòng thay đồ.

6. **Quản Lý Bộ Từ Vựng Toàn Diện**:
   - Sẵn sàng các bộ từ vựng chuẩn A1, A2, B1 theo chủ đề.
   - Nhập bộ từ riêng dễ dàng thông qua file Excel (.xlsx) hoặc .csv.
   - Lưu trữ an toàn trên thiết bị (Dexie / IndexedDB) kèm tính năng Sao lưu (Backup) & Khôi phục (Restore).

7. **Tài Khoản, Phiên Đăng Nhập & Phân Quyền**:
   - Đăng ký, đăng nhập, đăng xuất và đổi mật khẩu ngay trong ứng dụng.
   - Tài khoản đầu tiên là `admin`; các tài khoản tạo sau có vai trò `player`.
   - Quản trị viên có thể đổi vai trò, vô hiệu hóa/kích hoạt tài khoản và xem nhật ký bảo mật.
   - Tiến trình, ví xu, tủ đồ, lịch sử trận và dữ liệu ôn tập được tách theo tài khoản.
   - Mật khẩu được băm bằng PBKDF2-HMAC-SHA256 với salt ngẫu nhiên và 600.000 vòng; có khóa tạm khi thử sai và timeout phiên.

> **Phạm vi bảo mật:** Đây là hệ thống tài khoản cục bộ/offline; dữ liệu và thông tin xác thực nằm trong IndexedDB của trình duyệt hiện tại. Để đồng bộ đa thiết bị hoặc chống người có toàn quyền truy cập máy/trình duyệt, cần chuyển xác thực và dữ liệu sang backend đáng tin cậy.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Hệ Thống
- Node.js 18+ 
- npm hoặc pnpm

### Cài đặt
`ash
# Cài đặt các thư viện phụ thuộc
npm install
`

### Chạy môi trường phát triển (Dev)
`ash
npm run dev
`
Mở trình duyệt truy cập: http://localhost:5173/ (hoặc port hiển thị trên terminal).

### Kiểm thử (Unit Tests)
`ash
npm run test
`

### Đóng gói sản phẩm (Production Build)
`ash
npm run build
`

---

## 🛠️ Công Nghệ Sử Dụng
- **React 19** + **TypeScript** + **Vite**
- **Lucide React** (Biểu tượng)
- **Dexie.js** (IndexedDB Wrapper cho lưu trữ offline)
- **XLSX & PapaParse** (Xử lý file Excel/CSV)
- **Canvas Confetti** (Hiệu ứng chiến thắng)
- **Vitest** (Kiểm thử đơn vị tự động)
