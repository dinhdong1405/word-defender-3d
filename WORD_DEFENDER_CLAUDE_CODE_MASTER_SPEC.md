# WORD DEFENDER 3D — MASTER PRODUCT + GAME DESIGN + TECHNICAL SPECIFICATION

> **Dành cho Claude Code — Triển khai trọn vẹn một game học từ vựng tiếng Anh 3D tích hợp DingDongSpeak.**  
> **Ngôn ngữ sản phẩm:** tiếng Việt (mặc định), kiến trúc sẵn sàng i18n.  
> **Loại tài liệu:** execution-ready master brief / product requirements document / game design document / engineering specification / acceptance checklist.  
> **Mức ưu tiên:** Gameplay chính xác → Trải nghiệm 3D đẹp & mượt → Import Excel / bộ từ có sẵn → Giá trị học tập → Dữ liệu & tính ổn định → Mở rộng.

---

## 0. CHỈ THỊ CHÍNH XÁC CHO CLAUDE CODE (ĐỌC ĐẦU TIÊN)

Bạn là **Senior Game Engineer + 3D Creative Developer + Product Designer + Full-stack Engineer + QA Lead**. Nhiệm vụ là **XÂY DỰNG MỘT SẢN PHẨM CÓ THỂ CHẠY**, không chỉ viết kế hoạch, screenshot, mock UI hay code minh họa. Tên tạm là **Word Defender 3D** — minigame thuộc hệ sinh thái **DingDongSpeak**.

### 0.1. Quy tắc làm việc bắt buộc

1. **ĐỌC REPO TRƯỚC KHI SỬA**: kiểm tra framework, package manager, cấu trúc routes, auth, Firebase hiện có, design system, cấu trúc dữ liệu, lệnh lint/test/build. **Không tự dựng lại toàn bộ dự án** nếu đang tích hợp vào codebase tồn tại.
2. Bảo toàn chức năng đang hoạt động của DingDongSpeak. Tách game thành module/routing độc lập; không thay đổi auth, payment, landing page, speaking engine hay cấu hình deploy một cách không cần thiết.
3. Đừng chỉ tạo một landing page trang trí. **Phải làm được từ đầu đến cuối**: chọn bộ từ → chơi → gõ từ → súng bắn → từ bị tiêu diệt → mất mạng → game over → thống kê → chơi lại; và upload Excel → xem trước → sửa → chơi ngay.
4. Ưu tiên **3D thực sự**, không đánh tráo yêu cầu bằng CSS giả 3D hoặc ảnh nền phẳng. Dùng WebGL và scene 3D. Các lớp HUD/UI HTML overlay được phép, thậm chí nên dùng để tăng khả năng đọc.
5. Không đưa chữ tiếng Anh vào vật thể ở vị trí quá nghiêng, quá tối hoặc quá nhỏ. **Tính dễ đọc quan trọng hơn hiệu ứng 3D**.
6. Không cần AI API, speech API thương mại, backend trả phí cho vòng lặp gameplay cốt lõi. Bản không đăng nhập vẫn chơi và import dữ liệu được; backend là tùy chọn cho đồng bộ và public packs.
7. Tất cả dữ liệu import đều là **untrusted input**. Validate, giới hạn kích thước, giới hạn số từ, escape khi render, không eval, không chạy macro, không upload file gốc lên server mặc định.
8. UI phải có đủ state: loading, empty, error, success, import preview, pause, settings, game over, offline, WebGL unavailable. Tránh dead button, fake data và TODO làm ngừng luồng chính.
9. Code TypeScript strict (nếu repo dùng TS), tổ chức thành các module, có unit tests, integration tests và E2E cho luồng chính. Build và chạy test trước khi kết luận.
10. Nếu phát hiện repo không dùng React, **không ép chuyển framework**: giữ cơ chế domain engine độc lập, chọn adapter render phù hợp. Nếu dùng React, dùng React Three Fiber theo phiên bản React tương thích.
11. Không được tự nhận một tính năng “đã xong” nếu mới tồn tại UI mà chưa có logic hoạt động. Cuối đợt triển khai phải báo cáo **đường dẫn route, file đã tạo/sửa, cách chạy, kết quả test, phần chưa hoàn tất thật sự**.
12. Nếu thiếu asset thương mại, tạo hình học 3D procedural đẹp trước, dùng icon/âm thanh miễn phí hợp lệ khi cần, ghi rõ nguồn/licence; không tải font hoặc asset không rõ quyền.

### 0.2. Kết quả cuối cần bàn giao

- Một **route gameplay** hoạt động trong website (`/games/word-defender` hoặc route phù hợp cấu trúc dự án).
- Một **game hub** có chọn chế độ, chọn bộ từ có sẵn, nhập Excel, xem bộ từ cá nhân, xem cách chơi.
- Một **3D scene thật**: tháp pháo, bầu trời nhiều lớp, gạch từ vựng 3D rơi, đạn bay, hiệu ứng trúng đích/nổ, mặt đất/đường phòng thủ, camera và ánh sáng chất lượng.
- Một **game engine tách biệt renderer**; typing targeting chính xác; 3 mạng; điểm/combo/level; pause/restart.
- Một **Excel Import Wizard**: `.xlsx` + `.csv` (ưu tiên), chọn sheet, tự map cột, kiểm tra dữ liệu, preview, chỉnh sửa, tạo bộ từ, chơi ngay, tải template.
- Một **thư viện bộ từ** do chủ sản phẩm cấu hình; người dùng chọn chơi được; UI/quy trình quản trị bộ từ riêng tư/công khai (chỉ yêu cầu server nếu hạ tầng hiện có).
- Local persistence cho settings, tự tạo bộ từ, kết quả. Nếu repo có Firebase Auth + Firestore, tích hợp đồng bộ trong phạm vi quyền phù hợp; không yêu cầu đăng nhập để trải nghiệm gameplay chính.
- Trang/thành phần **Round Summary** có điểm, số từ tiêu diệt, độ chính xác, từ bỏ lỡ và tùy chọn ôn lại.
- Responsive, accessibility, reduced motion, fallback khi WebGL lỗi, tests và README module.

### 0.3. Definition of Done tối thiểu

Một người mới truy cập có thể (a) chọn bộ từ mẫu và chơi ngay, hoặc (b) upload `.xlsx`, xem trước, xử lý cảnh báo, lưu bộ từ và chơi; mỗi ký tự đúng phải khiến súng **bắn thật theo hoạt ảnh**, đạn bay về mục tiêu; hoàn tất từ làm viên gạch nổ; rơi chạm mặt đất làm mất 1 mạng; hết 3 mạng là game over; reload trang không làm mất bộ từ đã lưu; dashboard không ảnh hưởng chức năng khác của DingDongSpeak.

---

## 1. TẦM NHÌN VÀ PHẠM VI SẢN PHẨM

### 1.1. Elevator pitch

**Word Defender 3D** là game thủ thành bằng bàn phím: những viên gạch/tinh thể mang từ tiếng Anh liên tục rơi từ bầu trời; người chơi điều khiển một khẩu pháo 3D ở mặt đất bằng cách **gõ đúng từng chữ cái**, mỗi phím đúng tương ứng một phát đạn và gõ xong cả từ sẽ phá hủy mục tiêu. Gạch rơi chạm đất khiến người chơi mất tim, mất đủ ba tim thì thua. Người chơi chọn **bộ từ dựng sẵn** hoặc **tải Excel của mình lên** để biến dữ liệu thành màn chơi ngay.

### 1.2. Ba trụ cột

1. **Arcade satisfying:** súng xoay vật lý, muzzle flash, projectile trails, impact, particle breakup, combo, cao trào sống còn.
2. **Language-first:** từ phải dễ nhìn, viết chính tả đúng, có nghĩa/phát âm nếu dữ liệu cung cấp, thống kê các từ sai và ôn tập sau trận.
3. **Bring Your Own Words:** chỉ cần một file Excel (2 cột tối thiểu) là lập tức có game luyện theo nhu cầu; bên cạnh các gói từ do DingDongSpeak cung cấp.

### 1.3. Đối tượng chính

- Học sinh/sinh viên luyện tiếng Anh, người tự học IELTS/CEFR, giáo viên tự tạo giáo án dạng game.
- Desktop là nền tảng tối ưu đầu tiên; mobile/tablet vẫn phải có trải nghiệm khả dụng, không giả định có bàn phím vật lý.

### 1.4. Nguyên tắc game design

- **Không paywall** cho luồng demo/game cơ bản; chỉ kết nối SaaS nếu việc tích hợp phù hợp và không gây ma sát.
- **Đúng cảm giác bắn súng:** hành động nhập phím và hình ảnh bắn đi cùng nhau, không block keyboard input đợi projectile animation.
- **Không gài bẫy bất công:** tránh spawn gạch quá nhanh, che chữ, overlap khiến không thể xử lý, tự chọn sai mục tiêu không có cách khắc phục.
- **Không nhồi tính năng ban đầu:** hệ thống phải hoàn chỉnh; ưu tiên độ mượt, sự vui và tính đúng đắn trước các power-up.
- **Không đánh đồng typing game với học từ vựng:** typing kiểm tra chính tả; muốn luyện nghĩa phải có mode nhớ từ/nghe, có luật riêng.

---

## 2. NGÔN NGỮ THIẾT KẾ — VISUAL DIRECTION (BẮT BUỘC ĐẸP)

### 2.1. Concept art direction

Phong cách: **Cinematic Sci-fi Arcade / Sky Fortress Academy**. Hãy tưởng tượng một pháo đài học thuật tương lai trên một hòn đảo bay, trời chạng vạng xanh tím; các khối năng lượng chứa từ vựng rơi từ tầng khí quyển. Một tháp pháo cơ khí bằng kim loại/phát sáng phòng thủ tại đường chân trời. Tránh vẻ đồ họa đồ chơi ngây ngô hoặc dashboard doanh nghiệp. Đẹp theo hướng game indie premium: sạch, hiện đại, hiệu ứng vừa đủ.

**Bảng màu đề xuất:**

| Thành phần | Màu chủ đạo | Ghi chú |
|---|---|---|
| Sky base | `#071326`, `#101E38`, `#182C52` | gradient, nebula tinh tế |
| Ground/fortress | `#162A36`, `#263C4F` | hạ tầng 3D tối |
| Primary / active target | `#33E6DD` | cyan nổi bật |
| Projectiles | `#F5D56C`, `#FFF2B4` | ánh kim, glow dịu |
| Success/completion | `#38E3A5` | rõ trạng thái đúng |
| Warning/low health | `#FFB547`, `#FC6868` | không chỉ dựa vào màu |
| Text | `#F6F9FF` | contrast cao |
| Panels | `rgba(10,22,42,.72)` | glassmorphism tiết chế |

Không lấy màu này làm giới hạn cứng nếu design system của DingDongSpeak đã có màu nhận diện; phối để thống nhất thương hiệu.

### 2.2. Cấu trúc cảnh 3D — từ xa đến gần

- **Background far field:** sky dome có gradient/chòm sao bụi, tầng mây xa và ambient particles chậm; có cảm giác chiều sâu thật qua camera/parallax.
- **Middle field:** các khối từ vựng rơi từ cao xuống, vật thể có bề dày (beveled edges), material phản sáng, bóng/occlusion nhẹ và tương tác ánh sáng; màu theo độ nguy hiểm (normal/urgent/locked).
- **Foreground:** mặt đất dạng căn cứ phòng thủ 3D, các panel/làn neon, đèn viền, pháo máy (barrel, base, turret), đường mục tiêu.
- **Impact plane:** khi gạch chạm đất tạo shockwave 3D, bụi, tiếng thình và hiệu ứng mất mạng. Không rung camera quá mạnh.
- **HUD overlay:** điểm, mạng, combo, level, pause/settings, tiến độ gõ, thanh trạng thái. HUD nên là HTML DOM phủ lên scene để chữ sắc nét ở mọi độ phân giải.
- **Light rig:** hemisphere/ambient + key directional + fill rim lights, limited point lights để giữ FPS. Dynamic post-processing optional, có quality settings.

### 2.3. Tạo cảm giác 3D thực sự

- Camera **perspective**, góc hơi hướng xuống nhìn thấy top/side của viên gạch và nòng súng. Không biến toàn bộ gameplay thành 2D flat front view.
- Mục tiêu gạch 3D phải có **độ dày vật lý**, cạnh bo, tối thiểu hai mặt nhìn thấy, shadow/rim highlight, rất ít xoay để tránh khó đọc.
- Nòng pháo 3D quay theo tọa độ mục tiêu, có muzzle flash, recoil, ánh sáng đạn và trail.
- Projectile có vị trí 3D và chuyển động mượt (lerp/curved path), impact burst và object despawn effect.
- Ground có chiều sâu, pattern panel, vài mesh trang trí, các lớp khí quyển và parallax nhẹ.
- Từ chữ đặt trên **một panel phẳng ở mặt trước 3D của gạch**, luôn quay đủ hướng về camera để đọc dễ. Có thể dùng SDF text (`@react-three/drei` Text/Troika) hoặc HTML overlay projected; tránh TextGeometry extrude nặng cho từng từ đổi liên tục.

### 2.4. Dàn cảnh bố cục đề xuất desktop

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ DINGDONGSPEAK  /  WORD DEFENDER 3D       LEVEL 03         SCORE 01280       ♥ ♥ ♥    ⚙ │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│       [ SCHOOL ]                                      [ BEAUTIFUL ]                     │
│                                [  A P P L E  ]  ◀ selected / letters highlighted       │
│                      [ JOURNEY ]                                                        │
│                   atmospheric clouds / particle field / subtle celestial gradient         │
│                                                                                         │
│                                          * projectile                                   │
│                                         /                                               │
│                               3D CANNON / turret                                       │
│ ────────────────────────────────── DEFENSE LINE ──────────────────────────────────────  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  TARGET  [ A P P _ _ ]    •    COMBO x4    •    91% ACCURACY    [PAUSE]               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Đây chỉ là layout, không phải đồ họa mẫu để copy nguyên dạng.** Sản phẩm thật phải có depth, atmosphere, ánh sáng và motion tinh tế.

### 2.5. Các trạng thái hình ảnh bắt buộc

- **Normal block:** metallic crystal/stone/glass hybrid, dark blue body, white text.
- **Target candidate:** subtle rim glow khi có ký tự đầu tiên tương ứng.
- **Locked block:** cyan outline + rõ ký tự đã hoàn thành, marker targeting reticle.
- **Correct hit:** chữ tương ứng bật sáng xanh, chip nhỏ văng khỏi viền / impact sparks; **không làm chữ còn lại mất tương phản**.
- **Near-ground urgent:** pulse amber/red nhẹ, đồng thời biểu tượng cảnh báo (không chỉ đổi màu).
- **Destroyed:** mesh break/dissolve + ring flash + “+10” pop, âm thanh vừa phải.
- **Ground hit:** shockwave + crack + trừ tim; mọi hiệu ứng phải nhanh, không che các từ khác quá lâu.
- **Game over:** camera pullback nhẹ, kết quả overlay nổi rõ, nút “Chơi lại” thực sự hoạt động.

### 2.6. Motion & âm thanh

- Ambient sky slow drift, parallax, breathing emissive surfaces; camera shake rất nhẹ khi hit/miss, có thể tắt.
- Barrel tracking cần eased rotation, nhưng target **được tính logic ngay** chứ không chờ nòng quay xong.
- Type correct: soft laser tick; complete word: explosive satisfying chord; miss: warning/bass; combo: pitch increase. Debounce/mix âm thanh để không trở thành tiếng ồn ở >8 key/s.
- Audio mặc định nên được kích hoạt sau tương tác người dùng (theo chính sách autoplay); mute toggle hiện rõ; âm thanh UI không phụ thuộc phát âm từ.
- `prefers-reduced-motion` phải bỏ camera shake, giảm particle và chuyển cảnh, giữ nguyên tốc độ gameplay hoặc có tùy chọn giảm tốc do người chơi chủ động chọn.

### 2.7. Design quality gate

Không đạt nếu chỉ là background tối, vài `<div>` chữ rơi và 1 khẩu súng CSS. Phải nhìn ra vật thể 3D, có chiếu sáng/chiều sâu, tương tác bắn, HUD cao cấp, thiết kế responsive và trạng thái chơi rõ ràng.

---

## 3. USER JOURNEYS VÀ IA

### 3.1. Luồng A — chơi ngay với bộ từ dựng sẵn

`Game Hub → Chọn chủ đề → Xem số từ/level/độ dài → Chọn Classic Survival → 3-2-1 → Gameplay → Game Over → Summary + Review → Chơi lại`.

### 3.2. Luồng B — upload từ vựng Excel

`Game Hub → Upload Excel → Dropzone/Chọn file → Chọn sheet → Nhận diện cột → Preview 20 hàng → Cảnh báo/Chỉnh sửa → Đặt tên bộ từ → Lưu bộ từ → Chơi ngay`.

Người chơi được phép **dùng file tối giản chỉ gồm 2 cột** và không buộc đăng nhập. Trường `word` là bắt buộc, `meaning_vi` không bắt buộc đối với Classic; để vào Meaning mode phải có nghĩa đầy đủ.

### 3.3. Luồng C — dùng bộ từ riêng đã lưu

`Game Hub → Bộ từ của tôi → Tìm kiếm/sắp xếp → Xem chi tiết → Chơi/Sửa/Duplicate/Xuất/Xóa`.

### 3.4. Luồng D — quản trị bộ từ của DingDongSpeak

`Admin content area → Create/Edit pack → Upload file hoặc nhập từ thủ công → Preview & validate → Publish/Unpublish → Hiển thị trong thư viện public`.

Nếu repo chưa có admin, cung cấp content-management CLI/seed JSON + documentation là đường khả thi đầu tiên; khi có auth/admin claims thì bổ sung UI admin phù hợp. **Không làm UI “Admin” ai cũng truy cập/chỉnh sửa được.**

### 3.5. Các màn hình cụ thể

1. `/games/word-defender` — Hub: hero 3D animated preview (giảm chuyển động nếu cần), CTA “Chơi ngay”, “Tải Excel”, cards bộ từ, recent packs, hướng dẫn.
2. `.../play?pack=...&mode=classic` — full game screen không scroll; desktop keyboard capture có kiểm soát.
3. `.../import` hoặc wizard modal — chọn file/sheet, map cột, preview, sửa lỗi.
4. `.../library` — My Packs + Official Packs; có search/filter.
5. `.../summary/[sessionId]` hoặc modal sau ván — kết quả và từ cần ôn.
6. Optional: settings, admin content panel, leaderboard (sau khi có anti-cheat).

**Route paths có thể điều chỉnh theo cấu trúc code thực tế.** Ưu tiên tránh reload cứng giữa các page.

---

## 4. CORE GAMEPLAY RULES — LUẬT CHƠI CHỐT

### 4.1. Các nguyên tắc bất biến

- Mỗi khối có ID duy nhất và một `wordEntry` nguồn.
- Gạch xuất hiện trên trời tại `(x, y, z)`, rơi dọc trục chiều cao theo timeline gameplay, tốc độ được game director kiểm soát.
- Mỗi **key đúng** tương ứng **1 hit logic và 1 projectile VFX**.
- Gõ đủ `normalizedTarget` → block `destroyed`, cộng điểm, combo, spawn hiệu ứng; không cần đợi viên đạn cuối bay đến.
- Khi block đến `groundThreshold` trước khi bị destroy → `missed`, trừ 1 heart, giải phóng target nếu block bị khóa.
- `hearts` bắt đầu 3; khi `hearts = 0` → `GAME_OVER` ngay sau khi xử lý event hiện tại.
- **Không phạt người chơi 1 mạng vì gõ sai ký tự.** Gõ sai chỉ ảnh hưởng accuracy/combo nếu bật luật combo; vẫn mất thời gian trong khi gạch rơi.
- Gạch rơi ngay cả khi người chơi đang gõ, trừ khi game đang paused/countdown/summary.
- Không chơi nếu pack hợp lệ không đủ từ: hiển thị giải pháp thay vì crash.

### 4.2. Targeting — chọn viên gạch nào để bắn?

Mode Classic dùng **first-character auto lock**:

1. Khi chưa có locked target, nhận `e.key` từ bàn phím (không nhận Ctrl/Alt/Meta, không nhận auto-repeat).
2. Lấy `normalizedKey`; lọc các block ACTIVE có ký tự đầu chưa gõ trùng phím.
3. Nếu không có candidate → không bắn, tính 1 invalid attempt nếu đó là ký tự có thể gõ, hiển thị nudge nhỏ, tuyệt đối không tự khóa mục tiêu khác.
4. Nếu một candidate → khóa nó.
5. Nếu nhiều candidate → ưu tiên block `timeToGround` ngắn nhất. Tie-break: spawnTime sớm hơn, sau đó stable block ID.
6. Khi đã khóa, **chỉ kiểm tra** ký tự tiếp theo của block đó. Một khi gõ sai, giữ khóa; gõ đúng thì tiến bộ ký tự.
7. **`Tab`** hoặc **`Escape`** (chọn một phím rõ ràng trong UI): chuyển/hủy khóa thủ công mà không xóa các ký tự đã đúng; trong game không để Escape xung đột với Pause (đề xuất `Tab` chuyển target, `Esc` Pause). Bỏ chọn có cooldown 150 ms nếu cần để chống nhầm.
8. Kết thúc/mất block đang khóa → unlock; key tiếp theo bắt đầu targeting mới.

**Lưu ý đụng chữ cái đầu:** 2 từ `APPLE`, `APPLY` cùng xuất hiện thì chọn theo nguy hiểm. Người chơi phải có thể dùng `Tab` để chuyển nếu muốn. Với nhiều block cùng prefix, không spawn đè lên nhau.

### 4.3. Chính xác từng ký tự, kể cả khi gõ cực nhanh

- Game input cập nhật đồng bộ gameplay state trên mỗi `keydown` (state machine), không `await` animation.
- VFX nhận một event queue `{type:'SHOT_FIRED', targetId, origin, targetPosition, charIndex, timestamp}` và playback độc lập.
- Nếu projectile đang bay mà block đã destroyed, projectile đó chuyển sang quỹ đạo kết thúc/hoà vào effect (không render lỗi hoặc trúng block mới).
- Gõ 15 ký tự/giây không gây mất key do throttling, animation queue có capacity / coalescing.
- Lỗi gõ → flash nhỏ + subtle sound, không gây rung toàn màn hình.
- `event.repeat` bị bỏ qua với input desktop; `event.isComposing`/IME không làm phát đạn ngoài ý muốn.
- Browser shortcuts được giữ nguyên khi Ctrl/Meta đang nhấn; không chặn toàn bộ bàn phím ngoài game focused.

### 4.4. Chuẩn hóa từ nhập (đừng làm biến dạng dữ liệu gốc)

Lưu **hai biểu diễn**:

- `displayText`: hiển thị nguyên văn dữ liệu từ sau khi trim/normalize spaces và Unicode NFC, ví dụ `ice cream`, `don't`, `well-being`.
- `typingText`: quy tắc có thể gõ, chữ hoa/thường không phân biệt theo thiết lập mặc định, nhưng **space/apostrophe/hyphen là ký tự thực phải nhập** đối với phrases khi bật `strictPhraseTyping`.

**MVP mặc định:** Classic nhận từ/phrase ASCII tiếng Anh phổ biến `[A-Za-z]` + dấu cách, `'`, `-` (tuỳ pack). Cho phép các ký tự Latin có dấu nếu browser/keyboard hỗ trợ với thiết kế input composition; nếu không hỗ trợ chính xác, không tự âm thầm loại bỏ ký tự. Từ có số/ký tự đặc biệt: đánh dấu `unsupported_for_classic` trong preview và yêu cầu sửa/loại khỏi game.

- Không strip apostrophes làm thành từ khác.
- Không auto-correct/spellcheck/autocomplete khi chơi.
- `Backspace` không làm lùi số chữ đã bắn (vì mỗi chữ là một hit logic); hiển thị giải thích trong hướng dẫn.
- `Space` cho phrase: phải capture `preventDefault` trong game để trang không cuộn; trong trường hợp chưa khóa và phím space không thể target, không làm gì.
- Tiếng Việt ở cột nghĩa được Unicode NFC, render đầy đủ dấu; không đưa dấu tiếng Việt vào pipeline English typing trừ khi pack định nghĩa ngôn ngữ khác.

### 4.5. Thời điểm hoàn thành / chạm đất đồng thời

Dùng simulation timestep cố định và thứ tự cập nhật có thể kiểm thử. Quy ước: xử lý input queue tại thời điểm tick → apply completion → di chuyển blocks → xét ground collisions. Nếu hoàn thành trước/same tick as collision thì tính là tiêu diệt (ưu tiên người chơi). Nếu ground event đã xử lý tick trước thì không thể hồi sinh block.

### 4.6. Death fairness

- Một block chạm đất chỉ gây **đúng một** damage.
- Các block cùng chạm trong khoảng `damageGraceMs` (đề xuất 450–650 ms) vẫn bị remove nhưng không gây mất liên tiếp nhiều mạng; hiển thị “shield flicker”. Thiết kế tránh exploit: rõ thông số trong game config, không bất tử vô hạn khi nhiều block liên tiếp.
- Không có chuyện vừa bấm pause mà vẫn mất máu do timestep chạy tiếp.
- Sau khi resume có countdown 3 giây, game time không tiến trong countdown.

### 4.7. State machine

```text
BOOT → LOADING_ASSETS → READY → COUNTDOWN → PLAYING
                                      ├→ PAUSED → RESUME_COUNTDOWN → PLAYING
                                      ├→ GAME_OVER → SUMMARY → RESTART/EXIT
                                      └→ EXIT_CONFIRM → HUB
ERROR → RECOVERY/FALLBACK
```

Không dùng quá nhiều boolean mâu thuẫn (`isPaused && isGameOver && isPlaying`). Mỗi state chỉ cho phép một tập transitions hợp lệ.

---

## 5. GAME DIRECTOR — SINH GẠCH VÀ CÂN BẰNG

### 5.1. Đường cong độ khó

Gameplay **Survival Endless**: không có thắng cuối mặc định. Tăng độ khó theo số từ hoàn thành và thời gian sống sót, nhưng có trần để không phá performance hay tạo tình huống bất khả thi.

| Stage | Từ/phrase đề xuất | Max active | Spawn interval cơ sở | Tốc độ rơi tương đối |
|---|---|---:|---:|---:|
| 1 (Warm-up) | 3–5 ký tự | 3 | 3.8–4.5 s | 1.0× |
| 2 | 4–6 ký tự | 4 | 3.0–3.8 s | 1.15× |
| 3 | 5–8 ký tự | 5 | 2.5–3.2 s | 1.3× |
| 4 | 6–9 ký tự | 6 | 2.0–2.7 s | 1.5× |
| 5+ | theo mode & pack | 6–8 | adaptive | <=2.0× |

**Tất cả giá trị là baseline cần playtest, không phải chân lý.** Config hóa toàn bộ để tuning mà không sửa code engine. Không coi spawn interval là random vô điều kiện; cần xét số active và thời gian đủ để gõ.

### 5.2. Công bằng theo word length

Tính `timeToGround = distanceToGround / fallSpeed` và `estimatedTypingTime = baseReaction + length / targetWps` (đề xuất `targetWps ≈ 3–5 chars/sec` theo difficulty, điều chỉnh theo skill không đột ngột). Hạn chế sinh block mới nếu deadline của nhiều block đang chồng nhau đến mức người bình thường không thể xử lý.

Bộ director nên kiểm tra workload cửa sổ 3–8 s: số ký tự đang có deadline gần, ký tự/s cần thiết, số target active; khi quá ngưỡng, delay spawn hoặc giảm tốc block sắp xuất hiện. **Không auto-save khỏi thua:** vẫn phải tạo áp lực hợp lý.

### 5.3. Spawn algorithm

- Spawn lane/position trên X ngẫu nhiên nhưng seedable; depth Z điều chỉnh nhỏ cho 3D đẹp, tránh overlap projection.
- Block có bounding box theo **chiều dài text**; không spawn sát viewport hoặc dưới HUD.
- Không spawn từ khóa khác với chính sách input language của mode.
- Không xuất hiện 2 block cùng `typingText` đồng thời; tránh lặp cùng từ ngay lập tức nếu pack đủ lớn.
- Với pack ngắn (<10 từ), hỗ trợ chơi nhưng tăng reuse/repetition có quy tắc, hiện cảnh báo nhẹ “Bộ từ hơi ít; sẽ lặp lại từ”.
- Nếu người dùng chọn pack chỉ có 1 từ, cho phép **practice sandbox** riêng nhưng không chạy ranked survival; tránh vòng lặp quá nhàm.
- `spawnScheduler` dùng accumulated simulation time, không dùng hàng loạt `setInterval` rời rạc.
- Không spawn quá `MAX_ACTIVE`; không spawn khi inactive browser/tab đang suspended hoặc game paused.
- Mỗi session tạo seed lưu vào `GameSession`; khi cần có thể replay/QA.

### 5.4. Difficulty adapt

MVP: stage-based predictable. Có thể triển khai “Smart Pace” optional cho practice: dùng moving accuracy + missed count + measured typing speed để nới tốc sau 3 lần sai, không sửa độ khó trong mỗi keystroke. Custom Practice mode không xuất hiện trên bảng xếp hạng ranked.

### 5.5. Điều kiện kết thúc stage

Tăng stage mỗi N từ tiêu diệt (ví dụ 12–15 từ) hoặc mốc thời gian, tránh stage update quá thường xuyên. Khi chuyển stage: animation “LEVEL UP”, soft breather 1–2 s giảm spawn, không cần dừng game hoàn toàn nếu gây khó hiểu.

---

## 6. SCORING / COMBO / ACCURACY / REWARDS

### 6.1. Điểm

- Một block hoàn tất: `baseScore = 10` (config).
- Thưởng theo độ dài có trần: `lengthBonus = max(0, charCount - 4)` để không mất công bằng khi học từ dài.
- Combo đúng liên tiếp: sau mỗi 5 block không sai key +20; sau mỗi 10 block không sai key +50 (mốc đánh dấu một lần).
- Hiển thị +score popup gọn ngay vị trí block, tổng điểm trong HUD cập nhật smooth.
- **Không dùng công thức score dễ tăng vô hạn bởi key spam.** Score chỉ cộng khi hoàn thành block/event hợp lệ.

### 6.2. Accuracy

- `correctKeystrokes`: số key hợp lệ khớp ký tự tiếp theo của current target / initial lock.
- `incorrectKeystrokes`: số key character có thể gõ nhưng không khớp trong trạng thái gameplay focus.
- `accuracy = correct / max(1, correct + incorrect)`, làm tròn một chữ số thập phân.
- `WPM`: hiển thị nếu có ý nghĩa; định nghĩa chuẩn `correctCharacters / 5 / activePlayingMinutes` và nêu rõ là tốc độ chơi, không ngầm coi tất cả là đánh máy văn bản.
- `perfectWords`: từ hoàn tất mà không có wrong key trong suốt target lock.
- `missedWords`: từng entry ID + timestamp + remainingText.
- Không tính key điều khiển (Esc, Tab, mute, Enter ở overlay) vào accuracy.

### 6.3. Combo

- Combo tăng +1 khi hoàn thành một block không có lỗi key trong attempt hiện tại; nếu gõ sai → reset combo (tùy mode practice có thể mềm hơn).
- Khi mất block chạm đất → reset combo.
- Hiển thị combo nhẹ, âm thanh/animation cấp độ chỉ ở mốc 3/5/10, đừng spam UI.

### 6.4. Mạng

- Khởi đầu `3/3`. Sau 3 lần damage hợp lệ game over.
- Thay đổi lives **từ GameReducer duy nhất**, không trừ mạng từ cả renderer + collision handler.

### 6.5. Chơi lại / thống kê / giáo dục

Round summary: score, best score local, word kills, skipped/missed words, accuracy, WPM, duration, max combo, level reached. Tab “Từ cần ôn” chứa danh sách từ bỏ lỡ và từ gõ sai. Cho phép **Play missed words** từ một pack tạm; từ private user không tự public.

---

## 7. GAME MODES — SỰ KHÁC NHAU CỦA MỤC TIÊU HỌC TẬP

### 7.1. Mode A: CLASSIC TYPING SURVIVAL (**P0 BẮT BUỘC**)

- Block ghi **tiếng Anh**; người chơi đọc và gõ từ trên block để bắn.
- Mục tiêu: chính tả, nhận diện dạng từ, tốc độ nhập.
- Chế độ mặc định, 3 hearts, sinh từ vô tận đến khi thua.

### 7.2. Mode B: MEANING DEFENSE (**P1**)

- Block hiển thị **nghĩa tiếng Việt** (vd `quả táo`), người chơi phải **nhớ** và gõ `apple`.
- **Vấn đề quan trọng:** không thể dùng first-letter auto-lock đơn giản vì không nhìn thấy English target và nhiều từ có nghĩa gần nhau. Giải pháp: mỗi block có tag số `1...n`; người chơi nhấn số tương ứng để chọn, sau đó gõ từ tiếng Anh. Desktop dùng số 1–6; mobile chạm block để chọn. Nếu chưa chọn block, các chữ tiếng Anh không kích hoạt fire.
- Nếu hai entries có cùng nghĩa hoặc một nghĩa có nhiều đáp án: xác định accepted answers `string[]`; cần validate ambiguity khi import. Thời điểm tính complete dựa vào accepted answer cụ thể được chọn, tránh cộng điểm sai.
- Hover/focus có thể hiển thị hint số ký tự (`_ _ _ _ _`) nhưng không hiện toàn bộ English mặc định.
- Nếu thiếu nghĩa, mode bị disable kèm lý do.

### 7.3. Mode C: LISTENING DEFENSE (**P2**)

- Block hiển thị icon âm thanh + ID; chơi phát âm từ, người dùng chọn block rồi gõ từ nghe được.
- TTS browser là best-effort, giọng/độ sẵn có khác nhau theo máy. Không dựa vào TTS làm điều kiện cho mode hoạt động nếu không có voice hợp lệ; cần disable/fallback rõ ràng.
- Không tự động phát âm 5 block một lúc; có chọn mục tiêu, âm thanh queue và replay button giới hạn.

### 7.4. Mode D: PRACTICE / ZEN (**P1**)

- Không mất mạng hoặc tốc độ thấp, phù hợp cho người mới; khi làm đúng phát âm + hiện nghĩa.
- Không dùng điểm của mode này cho competitive leaderboard.

### 7.5. Mode E: DAILY CHALLENGE / LEADERBOARD (**P2**)

- Cùng một curated pack + daily seed/difficulty, có thể so sánh nếu server validation tồn tại.
- Không hiển thị rank “công bằng” khi điểm hoàn toàn từ client có thể sửa qua DevTools.

**Không cho các mode P1/P2 trì hoãn việc hoàn thiện P0.** Nhưng thiết kế engine ngay từ đầu có mode strategy để mở rộng.

---

## 8. HỆ THỐNG TỪ VỰNG: TỔNG QUAN

Có hai nguồn dữ liệu, đưa về **một schema chuẩn**:

1. **Official Packs**: bộ từ do chủ DingDongSpeak tạo và xuất bản (JSON trong repo, seed hoặc Firestore admin-published).
2. **My Packs**: người dùng tự upload Excel/CSV hoặc tạo và sửa từ thủ công; private mặc định, lưu IndexedDB, tùy chọn sync theo account.

**Mọi game session phải dùng SNAPSHOT của pack tại lúc bắt đầu** để người dùng đang chơi không bị thay đổi dữ liệu khi sửa pack từ tab khác.

### 8.1. Các bộ từ mẫu đề xuất có thể cấu hình

- `Everyday English A1` — đồ vật, hoạt động thường ngày.
- `Food & Drinks` — đồ ăn và đồ uống.
- `School & Study` — học đường.
- `Travel & Transport` — du lịch, phương tiện.
- `Work & Business` — công việc.
- `IELTS Speaking — Common Topics` — từ/cụm từ theo chủ đề Speaking.
- `Academic Vocabulary` — từ học thuật, không tự tuyên bố là danh sách chuẩn chính thức của đơn vị khảo thí.
- `My Imported Vocabulary` — không phải một pack static: là thư viện riêng của người dùng.

Yêu cầu **ít nhất 4 official demo packs có nội dung thực**, mỗi pack **tối thiểu 25 entries chất lượng đã kiểm tra**, không copy-paste cùng một danh sách rồi thay tên. Cho phép admin bổ sung/sửa danh sách mà không cần sửa game engine. Nếu chưa có bộ IELTS được kiểm duyệt, ghi rõ “Chủ đề luyện tập” thay vì giả danh bộ đề chính thức.

### 8.2. Pack metadata

`id`, `slug`, `title`, `description`, `languagePair`, `sourceType` (`official|imported|manual`), `ownerId?`, `visibility` (`public|private`), `topic`, `level`, `tags`, `version`, `createdAt`, `updatedAt`, `wordCount`, `supportedModes`, `thumbnailTheme`, `entries`/reference.

### 8.3. VocabularyEntry chuẩn

```ts
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unknown';

export interface VocabularyEntry {
  id: string;                  // stable UUID or deterministic ID for built-in pack
  term: string;                // English source, e.g. "take part in"
  meaningVi?: string;          // e.g. "tham gia"
  ipa?: string;                // e.g. "/teɪk pɑːt ɪn/"
  partOfSpeech?: string;       // noun, verb, adjective, phrase ...
  exampleEn?: string;
  exampleVi?: string;
  synonyms?: string[];
  acceptedAnswers?: string[];  // only for semantic/meaning modes when curated
  category?: string;
  cefr?: CEFR;
  tags?: string[];
  notes?: string;
  sourceRow?: number;          // origin for Excel diagnostics
  disabledModes?: Array<'classic' | 'meaning' | 'listening'>;
}

export interface VocabularyPack {
  id: string;
  title: string;
  description?: string;
  sourceType: 'official' | 'imported' | 'manual';
  ownerId?: string;
  visibility: 'public' | 'private';
  level?: CEFR;
  topic?: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  entries: VocabularyEntry[];  // client snapshot; cloud may paginate/subcollection
}
```

**Nguyên tắc:** Không để schema của Excel “chảy” thẳng vào game engine; import adapter -> normalize/validate -> canonical pack -> game session.

---

## 9. IMPORT EXCEL: CHỨC NĂNG TRỌNG TÂM (**P0 BẮT BUỘC**)

### 9.1. File types và giới hạn

- Nhận `.xlsx` và `.csv` UTF-8; file `.xls` cũ: **không âm thầm parse**, hướng dẫn người dùng chuyển sang `.xlsx` hoặc CSV.
- Kích thước tối đa mặc định **5 MB**, có thể config; tối đa **5,000 dữ liệu/từ trên pack** (có thể config); tối thiểu 2 từ hợp lệ để Survival bình thường, 1 từ chỉ practice nếu thiết kế hỗ trợ.
- Không parse file dựa duy nhất extension/MIME (MIME có thể rỗng), xử lý exception khi container bị hỏng.
- Chọn sheet từ dropdown nếu XLSX có nhiều sheet, hiển thị số dòng và preview sheet. Bỏ qua dòng hoàn toàn trống và các dòng note/tiêu đề trước header sau khi user chọn header row.
- Dùng thư viện parser **được bảo trì, tương thích phiên bản hiện có** (tham khảo `read-excel-file` cho `.xlsx`, có browser export phù hợp phiên bản; CSV dùng parser an toàn như Papa Parse). **Kiểm tra API của version cài thật, không copy API cũ**.
- Parse phía client, có progress/worker nếu parser hỗ trợ. Hủy thao tác/cancel phải hoạt động và không để overlay treo.

### 9.2. Header mapping tự động

Phải hiểu những tiêu đề phổ biến:

| Trường chuẩn | Header chấp nhận | Bắt buộc? |
|---|---|---|
| `term` | `word`, `english`, `vocabulary`, `term`, `từ vựng`, `từ tiếng anh`, `english word` | **Có** |
| `meaningVi` | `meaning`, `vietnamese`, `translation`, `nghĩa`, `nghĩa tiếng việt`, `dịch nghĩa` | Không (bắt buộc nếu Meaning mode) |
| `ipa` | `ipa`, `phonetic`, `pronunciation`, `phiên âm` | Không |
| `partOfSpeech` | `pos`, `part of speech`, `loại từ`, `từ loại` | Không |
| `exampleEn` | `example`, `example_en`, `ví dụ`, `câu ví dụ` | Không |
| `exampleVi` | `example_vi`, `dịch ví dụ` | Không |
| `cefr` | `level`, `cefr`, `trình độ` | Không |
| `category` | `topic`, `category`, `chủ đề` | Không |
| `tags` | `tags`, `nhãn` | Không |
| `synonyms` | `synonyms`, `từ đồng nghĩa` | Không |

- Normalize header: trim, lowercase, Unicode NFC, collapse whitespace; chỉ bỏ dấu tiếng Việt **khi so header alias**, không bao giờ strip dấu của ý nghĩa.
- Nếu nhiều cột match cùng một field, **yêu cầu user chọn** thay vì âm thầm lấy cột đầu.
- Nếu không nhận ra cột term, hiển thị dropdown `Cột chứa từ tiếng Anh` (must set) và `Cột chứa nghĩa` (optional).
- Không xóa những cột chưa map mà không báo: hiển thị “X cột chưa được sử dụng”.

### 9.3. Excel import wizard — UI 5 bước

**Step 1 — Upload**

- Dropzone lớn đẹp, click browse, drag/drop; link “Tải file Excel mẫu”, mô tả “Chỉ cần 2 cột English + Vietnamese”.
- Hiển thị privacy note: “File được xử lý trên thiết bị; không tự tải file gốc lên máy chủ.”

**Step 2 — Select sheet + header**

- Với XLSX multi-sheet: dropdown sheet, selected header row (mặc định row 1, có thể chỉnh), peek dữ liệu 8 dòng.
- Với CSV: thử đọc UTF-8, nếu lỗi hiển thị cảnh báo encoding và hướng dẫn UTF-8.

**Step 3 — Map columns**

- Hiển thị 2 cột song song: `Cột Excel` ↔ `Trường game`. Default auto-map, cho sửa; preview live theo mapping.

**Step 4 — Validate + Edit**

- Bảng preview searchable/scrollable, mặc định 20 rows nhưng có pagination/virtualization; badge `Valid`, `Warning`, `Error`; tổng hợp `x hợp lệ / y lỗi / z trùng`.
- Hỗ trợ sửa trực tiếp cell dữ liệu chuẩn, exclude row, xem row number, duplicate resolution `keep first` / `keep last` / `merge meanings` khi an toàn.
- Lỗi **blocking**: thiếu term, term quá dài so config, sai ký tự không hỗ trợ, không còn item hợp lệ. Cảnh báo **nonblocking**: thiếu nghĩa (Classic vẫn dùng), thiếu example, IPA lạ.
- Có nút `Xuất danh sách lỗi` dưới dạng CSV với row number và lý do.

**Step 5 — Create Pack**

- Input tên bộ từ, mô tả, level/chủ đề (optional), chọn mode khả dụng.
- CTA `Lưu bộ từ`, `Lưu & chơi ngay`; success state hiển thị số entries.
- Cho `Back` không mất dữ liệu, `Cancel` với confirm nếu đã chỉnh sửa, không tạo pack nửa vời.

### 9.4. Template file

Tạo **downloadable real `.xlsx` template** từ client (có thể sử dụng `write-excel-file` hoặc thư viện tương thích), có sheet `Vocabulary` chứa headers + 5 ví dụ và sheet `Instructions` nếu thư viện hỗ trợ. Cung cấp CSV template song song làm fallback. Header chuẩn:

```csv
word,meaning_vi,ipa,part_of_speech,example_en,example_vi,level,category,tags
apple,quả táo,/ˈæp.əl/,noun,I eat an apple.,Tôi ăn một quả táo.,A1,Food,"fruit;daily"
beautiful,xinh đẹp,/ˈbjuː.tɪ.fəl/,adjective,This place is beautiful.,Nơi này rất đẹp.,A2,Description,adjective
study,học,/ˈstʌd.i/,verb,I study English.,Tôi học tiếng Anh.,A1,School,education
journey,chuyến hành trình,/ˈdʒɜː.ni/,noun,The journey was long.,Chuyến đi kéo dài.,B1,Travel,travel
important,quan trọng,/ɪmˈpɔː.tənt/,adjective,Practice is important.,Luyện tập rất quan trọng.,A2,General,daily
```

*(Các phiên âm/ví dụ là dữ liệu demo; người quản trị cần kiểm tra ngôn ngữ theo chuẩn nhất quán trước khi xuất bản chính thức.)*

### 9.5. Validation + normalization chi tiết

- `term`: required, `trim`, Unicode NFC, collapse inner whitespace; max ví dụ 60 ký tự và max 5 tokens cho default survival (nếu dài hơn: flag incompatible, không tự cắt mất chữ).
- `meaningVi`: optional, trim, normalize NFC, max 250 ký tự.
- `exampleEn/Vi`: max 500 ký tự; `notes`: max 1000 ký tự; mỗi tag <=40 ký tự; max 10 tags.
- Duplicate key: `${language}:${normalizeTerm(term)}` case-insensitive, standardized whitespace; giữ meaning variations/synonyms theo quy tắc merge mà user xác nhận.
- `cefr`: chỉ nhận A1/A2/B1/B2/C1/C2 hoặc `unknown`; mapping `a1`, `A 1` nếu cần; giá trị lạ warning.
- `word/meaning` chứa HTML/JS phải được xem như **plain text**; React text nodes/SDF texture, không `innerHTML` trực tiếp.
- Các ô Excel là formula: **không thực thi**; tùy parser lấy cached text/value hoặc đánh dấu cảnh báo; không mở external workbook links, không fetch remote images.
- Rows kiểu number/date/bool ở `term` → lỗi cho sửa, không ngầm biến ngày thành từ.
- Reject blank-only, newline-laden control chars, exceptionally long strings. Giới hạn decompressed ZIP bomb bằng parser options/guards nếu thư viện hỗ trợ, tuyệt đối không tin file size alone.
- Khi xuất ra CSV/Excel sau chỉnh sửa, escape các ô bắt đầu bằng `=`, `+`, `-`, `@`, tab/newline phù hợp chống CSV formula injection khi mở trong spreadsheet. Đảm bảo dữ liệu hiển thị/import lại không bị méo đáng kể; test round-trip.

### 9.6. Lỗi UX phải giải thích được

Ví dụ lỗi tiếng Việt:

- `Không đọc được file. Hãy chọn .xlsx hoặc .csv hợp lệ.`
- `Không tìm thấy cột từ tiếng Anh. Vui lòng chọn cột phù hợp.`
- `Dòng 17: Từ tiếng Anh bị trống.`
- `Dòng 43: "I love playing football in the afternoon" quá dài cho chế độ Survival chuẩn.`
- `Có 6 từ trùng nhau. Bạn có thể giữ bản đầu, bản cuối hoặc chỉnh sửa thủ công.`
- `Bộ từ chỉ có 1 từ hợp lệ. Hãy thêm ít nhất một từ nữa để bắt đầu Survival.`
- `Bộ từ chưa có nghĩa tiếng Việt nên chưa thể chơi chế độ Đoán nghĩa.`

### 9.7. Invariants import

- Không làm mất bộ từ đang tồn tại nếu import lỗi giữa chừng.
- Không lưu bản tạm chưa validate làm pack chính thức.
- Không tự public file private lên cloud.
- Cùng một file + cùng mapping tạo cùng danh sách normalized entries, ngoại trừ các ID ngẫu nhiên.
- Có thể upload lại file cùng tên nhưng nội dung khác; không coi tên file là ID.

---

## 10. QUẢN LÝ BỘ TỪ CỦA TÔI

### 10.1. Library UI

Mỗi pack card có cover/theme, tên, số từ, nguồn (Official/Personal), lần chơi gần nhất, mode supported, nút `Chơi`, `Xem từ`, menu `Sửa/Đổi tên/Nhân bản/Xuất/Xóa`.

- Search title, filter source/topic/level, sort recent/name/word count.
- Nếu không có pack cá nhân: empty state CTA upload Excel/CSV và link template.
- Pack official mặc định read-only; user có thể **Duplicate to My Packs** để sửa riêng mà không sửa official.
- Khi edit pack: inline editor/table, add/remove entry, import thêm từ, resolve duplicates; không sửa pack snapshot của session đang chạy.
- Delete pack: confirm, chỉ xóa pack người dùng; xóa local và sync (nếu user chọn) phải cập nhật không orphan records. Cần có export để tránh lock-in.

### 10.2. Persistence local-first

- **IndexedDB** cho packs (đặc biệt 5000 entries) + kết quả + import draft; không dồn data lớn vào localStorage.
- `localStorage` chỉ chứa settings nhẹ nếu phù hợp.
- Có versioned schema/migration, handling quota errors, stale data/version, crash recovery.
- Guest user được dùng đầy đủ chức năng cốt lõi; chỉ thông báo login khi thật sự cần cloud sync hoặc cross-device.
- Dữ liệu pack không bao gồm file Excel gốc trừ khi người dùng chủ động chọn lưu file gốc (MVP **không cần**).

### 10.3. Cloud optional, nếu DingDongSpeak có Firebase

- Firebase Auth hiện có: lấy user identity theo hooks/auth provider của repo.
- `/users/{uid}/wordDefenderPacks/{packId}` và `/users/{uid}/wordDefenderSessions/{sessionId}` (ví dụ).
- Official metadata: `/wordDefenderOfficialPacks/{packId}`; entries chia subcollection/document chunks thay vì nhồi một Firestore document >1 MiB.
- Kiểm tra quota/read/write costs, batching và khả năng offline cache; tránh write mỗi ký tự hoặc mỗi frame.
- Sync strategy explicit: local-first, optimistic UI, queue offline, conflict/version merge rõ; **không âm thầm overwrite** dữ liệu giữa các thiết bị.
- Nếu không có Auth/Firestore trong repo, **không phát sinh cấu hình Firebase giả**; hoàn thành local-first và tạo interface adapter để nối sau.

### 10.4. Quyền và bảo mật Firestore

- `userId === request.auth.uid` cho mọi private pack/session; validate ownership cả nested paths.
- Official published read only; create/update/delete bởi server/admin thật (custom claims), không dựa vào nút `Admin` bị ẩn trên client.
- Hạn chế max length/timestamps/schema ở rules/backend khi ghi cloud; đo kích thước packs và giới hạn số bản ghi.
- Do không thể tin score từ client, chưa triển khai global leaderboard công bằng nếu chưa có server verification/anti-cheat.

---

## 11. OFFICIAL PACKS — DỮ LIỆU CÓ SẴN DO CHỦ SỞ HỮU CUNG CẤP

### 11.1. Phương án đơn giản để chủ website thêm pack

- Thư mục `data/word-defender/official-packs/*.json` (hoặc nơi phù hợp) với JSON schema chung.
- Manifest index liệt kê pack metadata và lazy-load entries khi người dùng chọn; không import toàn bộ 100k từ vào bundle trang chủ.
- Có script `validate:word-packs` chạy schema validation, duplicate check, length compatibility, tiếng Việt UTF-8.
- `seed` 4 packs mẫu x25 entries, kèm tests kiểm tra pack count/validity.
- Ghi README rõ: **“Muốn thêm bộ từ mới: thêm JSON/CSV chuẩn vào thư mục này + cập nhật manifest/chạy script, không sửa gameplay.”**

### 11.2. Phương án admin dashboard (sau/hoặc nếu auth sẵn)

- Admin upload sheet, reuse toàn bộ import wizard; preview, sửa, set `visibility=public`, category/level/theme/cover.
- Publish có version, unpublished pack bị ẩn với guest nhưng dữ liệu private session cũ vẫn hoạt động qua snapshot.
- Admin permissions enforce server-side, audit who published/updated.

### 11.3. Data quality

- Không tự lấy dữ liệu copyrighted của bên thứ ba từ internet nếu không có quyền.
- Mỗi term và meaning phải có tính nhất quán; synonyms chỉ được dùng làm accepted answers sau khi curator duyệt.
- Trong UI official pack ghi `Biên soạn bởi DingDongSpeak` nếu đúng, không gắn logo/chứng nhận IELTS chính thức khi không có.

---

## 12. 3D ENGINE + TECH STACK ĐỀ XUẤT

### 12.1. Nếu dự án dùng React / Next.js

- **React + TypeScript** và `@react-three/fiber` + `three` + `@react-three/drei`; kiểm tra version tương thích React major hiện có. Không cài version alpha/experimental mặc định.
- **Game logic thuần TS**, không đặt toàn bộ logic vào `useFrame`/React state mỗi frame.
- **HUD HTML** bằng design system hiện có / Tailwind nếu repo đã dùng. React Three Fiber render scene; `useFrame` nhận snapshot và update `mesh.position/quaternion` trực tiếp.
- **Zustand** optional nếu repo đã dùng; nếu không, lightweight external game store/state machine đủ. Phần tick cao tần KHÔNG ép React rerender toàn app 60 lần/giây.
- **read-excel-file** (bản hiện hành, đúng API docs) cho `.xlsx`, Papa Parse cho `.csv`, **Dexie** nếu muốn IndexedDB wrapper. Tránh thêm quá nhiều dependency khi không cần.
- Test: Vitest/Jest theo repo, React Testing Library, Playwright (nếu có khả năng setup).
- **Next.js SSR guard:** 3D/WebGL và window-dependent libraries phải client-only (`dynamic import`, `ssr: false` nếu phù hợp route/components); không import `window` ở server module.

### 12.2. Nếu dự án không dùng React

- Three.js thuần với scene adapters; tương tự core modules/input/Excel/store; UI dùng framework hiện có. **Không rewrite toàn bộ web sang Next.js**.

### 12.3. Scene graph minh họa

```text
WorldScene
├─ PerspectiveCamera / controlled resize
├─ Atmosphere
│  ├─ SkyDome
│  ├─ CloudLayers
│  ├─ StarDust / Particles
│  └─ Fog / key lights
├─ DefenseGround
│  ├─ GroundPlatform
│  ├─ DefenseLine
│  ├─ DecorativeMeshes
│  └─ ImpactShockwavePool
├─ TurretRig
│  ├─ BaseMesh
│  ├─ RotatingMount
│  ├─ BarrelPivot
│  ├─ MuzzleFlash
│  └─ TargetingBeam
├─ FallingWordBlocks[]
│  ├─ Beveled3DBody
│  ├─ EmissiveOutline / SelectionReticle
│  ├─ TextSurface (dynamic, sharp)
│  └─ UrgencyIndicator
├─ ProjectilePool[]
├─ ImpactParticles / BreakupPool[]
└─ CSS/HTML HUD (separate overlay)
```

### 12.4. Performance architecture

- Gameplay tick **fixed timestep** (vd 1/60 s), renderer interpolated; elapsed time clamp sau tab sleep để không teleport gạch xuống đất.
- Render frame use `requestAnimationFrame` (R3F frame loop) và imperative updates, object pooling projectile/particles.
- Limit active blocks; cull offscreen objects; use instancing cho các geometry giống nhau khi phù hợp (text labels riêng).
- DPR dynamic 1–2 tùy thiết bị; low/medium/high quality options; bloom/shadow optional hoặc adaptive, không nặng CPU/GPU.
- Lazy-load game 3D module sau CTA, tránh bundle tăng tải landing page.
- Pause khi tab hidden và mất focus; resume countdown; cleanup WebGL resources/listeners/materials/textures khi unmount.
- Nếu `webglcontextlost`, lưu session state (nếu có thể) và hiển thị recovery/retry; nếu không hỗ trợ WebGL, fallback 2D vẫn chơi được hoặc có thông báo kèm nút fallback rõ ràng.
- Không phát âm nhiều từ cùng lúc, cancel speech khi game over/exit; audio buffer cleanup.

### 12.5. Frame budget mục tiêu

- Desktop thông thường: target 60 FPS trong scene 3D mức medium, input phản hồi trong cùng tick/game frame; không coi mục tiêu là cam kết mọi máy.
- Laptop tích hợp/mobile: adaptive 30–60 FPS; ưu tiên input đúng và chữ rõ hơn particle.
- Gameplay scene load trên mạng thường phải có progress/loading trạng thái; không ghi con số giả nếu chưa đo.
- Chạy browser performance profile và ghi kết quả thực tế vào QA report (device/browser/độ phân giải/quality/active blocks).

---

## 13. TÁCH GAME LOGIC KHỎI RENDER (CỰC KỲ QUAN TRỌNG)

```ts
type GamePhase =
  | 'boot' | 'loading' | 'ready' | 'countdown'
  | 'playing' | 'paused' | 'resume_countdown'
  | 'game_over' | 'summary' | 'error';

type BlockState = 'spawning' | 'active' | 'destroyed' | 'missed';

interface FallingBlock {
  id: string;
  entryId: string;
  displayText: string;
  typingText: string;
  typedIndex: number;
  state: BlockState;
  x: number;
  y: number;
  z: number;
  speedUnitsPerSecond: number;
  spawnedAtMs: number;
  protectedUntilMs?: number;
}

interface SessionStats {
  score: number;
  lives: number;
  level: number;
  killed: number;
  missed: number;
  correctKeys: number;
  incorrectKeys: number;
  maxCombo: number;
  elapsedPlayingMs: number;
}

interface GameSnapshot {
  phase: GamePhase;
  seed: number;
  mode: 'classic' | 'meaning' | 'listening' | 'zen';
  packId: string;
  blocks: FallingBlock[];
  lockedBlockId: string | null;
  stats: SessionStats;
  gameTimeMs: number;
}

type GameEvent =
  | { type: 'KEY_CORRECT'; blockId: string; charIndex: number }
  | { type: 'KEY_WRONG'; blockId?: string }
  | { type: 'TARGET_LOCKED'; blockId: string }
  | { type: 'TARGET_RELEASED'; blockId: string }
  | { type: 'SHOT_FIRED'; blockId: string; charIndex: number }
  | { type: 'BLOCK_DESTROYED'; blockId: string; entryId: string; points: number }
  | { type: 'BLOCK_MISSED'; blockId: string; entryId: string }
  | { type: 'LIFE_LOST'; remainingLives: number }
  | { type: 'LEVEL_UP'; level: number }
  | { type: 'GAME_OVER' };
```

**Engine API kỳ vọng:**

```ts
interface WordDefenderEngine {
  start(config: SessionConfig): void;
  update(dtSeconds: number): void;
  receiveCharacter(key: string, eventTimeMs?: number): void;
  selectTargetById(id: string): void;
  cycleTarget(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  getSnapshot(): Readonly<GameSnapshot>;
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void;
  onEvent(listener: (event: GameEvent) => void): () => void;
  dispose(): void;
}
```

**Tuyệt đối không** thêm bớt một heart ở nhiều nơi, không dùng DOM event trực tiếp bên trong simulation để test không được. Event queue phải quyết định thứ tự rõ ràng. Renderer chỉ phản ánh snapshot và event visual, không được trực tiếp viết điểm/heart vào core state.

### 13.1. Pseudocode xử lý ký tự

```text
ON_CHARACTER(char):
  if phase != PLAYING or input not focused: return
  if key is control/IME/repeat: return
  normalized = normalizeTypedKey(char)
  target = lockedBlock

  if target == null:
    candidates = active blocks whose first expected char == normalized
    if candidates empty:
      incorrectKeys += 1
      emit KEY_WRONG
      return
    target = min(candidates, timeToGround then spawnTime then stable ID)
    lockedBlockId = target.id
    emit TARGET_LOCKED

  expected = target.typingText[target.typedIndex]
  if normalized != expected:
    incorrectKeys += 1
    combo = 0
    emit KEY_WRONG
    return

  target.typedIndex += 1
  correctKeys += 1
  emit KEY_CORRECT + SHOT_FIRED

  if target.typedIndex == length(target.typingText):
    mark target destroyed immediately
    award score / update combo / stats
    emit BLOCK_DESTROYED
    unlock target
```

### 13.2. Pseudocode simulation update

```text
UPDATE_FIXED_TICK(dt):
  if phase != PLAYING: return
  drain input events ordered by timestamp
  spawn director according to active deadlines / cap / seed
  for each active block:
    block.y -= block.speed * dt
    if block.y <= groundThreshold:
      mark missed and remove from active set
      emit BLOCK_MISSED
      if grace window permits:
        lives -= 1
        emit LIFE_LOST
      if blocked == lockedBlockId: unlock
  if lives <= 0:
    phase = GAME_OVER
    stop scheduled spawns
    emit GAME_OVER
```

**Chú ý:** Event input nên process trước movement trong cùng tick để tránh tranh chấp milliseconds bất công; có thể dùng physics frame accumulator và tick index. `dt` không dựa trực tiếp Date.now delta unconstrained.

---

## 14. MOBILE, RESPONSIVE, CONTROLS

### 14.1. Desktop (primary)

- Landscape game canvas chiếm phần lớn viewport; HUD ở trên, thanh tiến độ gõ ở dưới.
- `keydown` chỉ active khi game playing/game root focus; không ăn phím khi ở dialog/settings/import wizard.
- Phím điều khiển: `A-Z`/space/apostrophe/hyphen cho typing, `Tab` cycle target, `Esc` pause, `M` mute nếu không trùng typing; tốt nhất mute bằng UI hoặc hotkey với modifier để tránh ăn mất chữ trong từ.
- Hướng dẫn điều khiển ngắn trên màn hình Ready và menu pause.

### 14.2. Mobile/tablet

Phải giải quyết việc **bàn phím hệ điều hành che mất game**. Chọn một trong hai giải pháp và triển khai đúng:

**Phương án khuyến nghị P0 mobile:** game dùng vùng nhập text focus ở bottom/input dock; khi keyboard native mở, render 3D viewport tự resize phía trên keyboard (Visual Viewport API hoặc responsive fallback) và giảm game speed / max blocks theo profile mobile. Bật autocorrect=off, autocapitalize=off, autocomplete=off, spellcheck=false. Bắt `input`/`beforeinput` với composition handling; không đơn giản dựa `keydown` (soft keyboard có thể không emit từng key nhất quán). Khi user chọn mục tiêu, focus input không gây scroll jump.

**Phương án nâng cấp:** custom on-screen keyboard 3 hàng bên dưới scene cho game arcade; phải đảm bảo thiết kế phù hợp điện thoại 360px, accessibility và phản hồi touch; không thêm nếu gây UX tệ.

- Taps trên block có thể chọn mục tiêu; vẫn cần keyboard.
- Mobile 30–50% slower theo config và giảm max active; không dùng cùng leaderboard desktop/ranked nếu khác difficulty mà không phân biệt.
- Portrait tối thiểu 360px: chữ >=14–16px tương đương UI, target hit area >=44px; landscape support nếu khả thi.
- Hỗ trợ safe-area, notch, dynamic address bar, scroll prevention trong game nhưng không khóa scroll toàn website.

### 14.3. Accessibility

- HUD accessible text/aria labels, lives không chỉ hiển thị icon, sound toggle, captions cho hiệu ứng chính.
- Color-blind friendly: selected block có outline + reticle + prefix highlighting; urgent có icon/symbol ngoài màu.
- Reduced motion và low effects settings.
- Keyboard focus visible cho toàn bộ menu/dialog; Escape closes dialogs/pause theo thứ tự focus, không trap khi không cần.
- WebGL fallback/2D mode cho máy yếu có cùng luật chơi (renderer khác, engine như nhau).

---

## 15. UI SCREENS CHI TIẾT

### 15.1. Game Hub

Hero: `WORD DEFENDER 3D` + tagline `Gõ đúng. Bắn trúng. Giữ vững phòng tuyến.`; cinematic live 3D turret/slow moving blocks (lazily loaded, có poster/fallback), CTA primary “Chơi ngay”, CTA secondary “Tải bộ từ Excel”; small play instruction; sections:

- `BỘ TỪ NỔI BẬT`: 4–8 official pack cards.
- `BỘ TỪ CỦA BẠN`: saved private packs, CTA create/import.
- `CHẾ ĐỘ CHƠI`: Classic active, Meaning/Zen theo roadmap nếu implemented; disabled mode có reason chứ không phải nút vô tác dụng.
- `CÁCH CHƠI`: 3 bước animation/illustration.
- `KỶ LỤC CÁ NHÂN` & last session data nếu có.

### 15.2. Pre-game Setup

Pack info, số từ dùng được cho mode, chọn mode, difficulty (`Easy/Normal/Hard`, default Normal), sound/music toggles, theme optional, estimated round time ghi không hứa hẹn. Nút “Bắt đầu” và “Trở lại”. Phải có preview 10 từ để biết user đã chọn đúng pack.

### 15.3. Countdown / Tutorial

Onboarding lần đầu: `Gõ từng chữ trong viên gạch` → `Súng bắn theo chữ bạn gõ` → `Đừng để gạch chạm đất (3 mạng)`; demo 1 khối và input ngắn nếu khả thi; sau đó 3-2-1. Lần sau cho Skip tutorial từ settings.

### 15.4. HUD gameplay

- Header left: logo/exit confirmation.
- Header center: level + small progress.
- Header right: score, hearts (3 icons), pause/settings.
- World: target reticle + gạch dễ đọc; câu chữ quan trọng không bị HUD che.
- Bottom: `TARGET: APP__`, combo, accuracy, optional small meaning / IPA sau khi tiêu diệt (toggle).
- Nếu chưa lock: `Gõ chữ đầu tiên của một từ để khóa mục tiêu`.

### 15.5. Pause / Settings

Resume, restart confirmation, exit confirmation, volume FX, music toggle, pronunciation toggle, graphics quality (Auto/Low/Medium/High), reduced motion; văn bản giải thích `Game sẽ dừng khi bạn chuyển tab`.

### 15.6. Game Over / Summary

Màn kết thúc được thiết kế đẹp như reward screen: score counter animation, new personal best, level, words killed, accuracy, max combo, session duration, 3–8 từ cần ôn với nghĩa; CTA `CHƠI LẠI`, `ÔN TỪ VỪA SAI`, `CHỌN BỘ TỪ KHÁC`. Nếu không có missed words, hiện “Không có từ bị bỏ lỡ” thật, không data fake.

### 15.7. Import Wizard / Library

Visual ngang hàng với game hub: cards có độ sâu, drag/drop affordance rõ, cảnh báo lỗi thân thiện, sticky footer action. **Không dùng 3D nặng phía sau modal preview** để tránh giật khi parse Excel.

---

## 16. AUDIO, PRONUNCIATION, PEDAGOGY

- Tách **SFX audio mixer** và **pronunciation channel**. SFX không được đè lời phát âm thành tiếng ồn.
- Khi destroy: optional overlay từ + nghĩa trong 800–1400 ms, không che target nguy hiểm; nếu game speed cao, đưa nghĩa vào sidebar/feed hoặc post-game thay vì overlay giữa màn.
- Phát âm có thể dùng `SpeechSynthesis` browser nếu voice tiếng Anh hợp lệ sẵn có; detect voice loaded, chọn `en-US`/`en-GB`, không assume mọi trình duyệt có giọng chất lượng đồng đều.
- TTS autoplay cần user gesture, toggle default off/on hợp lý; `speechSynthesis.cancel()` khi thoát/pause nếu queue bị tắc; pronunciation không ảnh hưởng scoring.
- Post-game review chứa flashcard nhanh: word, meaning, example (nếu có) và nút phát âm; không generate definitions/IPA bằng AI giả khi thiếu dữ liệu.
- Có thể sau này áp dụng spaced repetition: `lastSeenAt`, `mistakeCount`, `mastery`, `nextReviewAt`, nhưng P0 chỉ cần danh sách sai/bỏ lỡ và play missed words.

---

## 17. DATABASE + LOCAL DATA SCHEMAS

```ts
interface GameSessionRecord {
  id: string;
  packId: string;
  packTitleSnapshot: string;
  packVersion: number;
  mode: string;
  difficulty: string;
  seed: number;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  score: number;
  maxCombo: number;
  accuracy: number;
  correctKeys: number;
  incorrectKeys: number;
  wordsDestroyed: number;
  wordsMissed: number;
  reachedLevel: number;
  missedEntryIds: string[];
  incorrectEntryIds: string[];
  isRankedEligible: boolean;
  clientVersion: string;
}

interface PlayerGameSettings {
  soundFxVolume: number;
  musicVolume: number;
  pronunciationEnabled: boolean;
  graphicsQuality: 'auto' | 'low' | 'medium' | 'high';
  reducedMotion: boolean;
  showMeaningOnKill: boolean;
  skipTutorial: boolean;
  preferredDifficulty: 'easy' | 'normal' | 'hard';
}
```

- Persist sessions when result finalized, not every frame.
- Save high score by `(packId, mode, difficulty, platformProfile)` for honest comparisons; save global personal best separately if desired.
- Store `packVersion`/snapshot hash on session for reproducibility; do not put raw full Excel in result.
- Privacy: users có thể xóa dữ liệu học tập cục bộ bằng UI `Xóa dữ liệu trò chơi` với confirm; nếu có cloud sync, nói rõ local và cloud khác nhau.
- Data export personal packs to CSV/JSON; nếu hỗ trợ export user history, phân biệt private/local với cloud.

---

## 18. ANTI-CHEAT, PRIVACY, SECURITY, RELIABILITY

### 18.1. Chống gian lận leaderboard

- Offline/local scores không cần anti-cheat nặng; score hiển thị chỉ trên thiết bị.
- Nếu public leaderboard: **client score là không đáng tin**. Server tạo challenge seed/pack snapshot; client gửi event log compressed (timestamps, target ids/characters, game version); server validate impossibly fast rates, stage scheduling, score invariants, session length. Mức chống cheat này vẫn không tuyệt đối; ưu tiên public daily challenge với server-side simulation/replay verification khi khả thi. Có rate limiting và abuse detection.
- Không ghi `userSubmittedScore` thẳng vào Firestore collection public và coi đó là điểm hợp lệ.

### 18.2. Privacy Excel

- Người dùng được thông báo file được đọc locally; nội dung không gửi lên hệ thống trừ khi chủ động bật sync/publish. Không analytics log nguyên term/meaning hoặc toàn bộ file người dùng.
- Cần làm rõ dữ liệu khi guest xóa browser storage có thể mất, nên có `Export pack`.
- Không cho user private pack vô tình xuất hiện ở Official Packs.

### 18.3. Web app security

- Sanitize plain text, never eval dynamic formulas, no external script from Excel, respect CSP repo.
- Không cho upload executable asset, không render HTML có trong cell dưới dạng HTML.
- Validate server-side mọi Cloud API input; phân quyền admin claims ở server/rules.
- Không lộ API keys/secret tokens. Không gọi Firebase Admin SDK từ browser.
- Async cancellation và error boundaries tránh leak event listeners/audio loops/WebGL contexts khi route unmount.

### 18.4. Resilience

- Bad Excel → clear recoverable error, no crash.
- Empty/corrupt local IndexedDB → migrate/reset có confirm và export nếu đọc được.
- Missing font/audio asset → fallback, game vẫn chơi.
- WebGL disabled → 2D fallback chơi được hoặc hỗ trợ trạng thái error xác định (ưu tiên 2D fallback trong P0 production).
- Network lost → local mode vẫn chơi; lazy official pack cache những pack đã tải.
- Tab hidden → auto pause; back to foreground → resume countdown.

---

## 19. KIẾN TRÚC MODULE / FOLDER SUGGESTION

> Điều chỉnh cho đúng repo. Đây là skeleton domain, không buộc copy y nguyên.

```text
src/
  features/
    word-defender/
      README.md
      types/
        vocabulary.ts
        game.ts
      config/
        balance.ts
        visualTheme.ts
      data/
        official-packs/
          manifest.json
          everyday-a1.json
          food-and-drinks.json
          school-study.json
          travel-transport.json
      core/
        engine.ts
        game-reducer.ts
        input-normalizer.ts
        targeting.ts
        spawner.ts
        difficulty-director.ts
        collision.ts
        scoring.ts
        random.ts
        events.ts
      scene/
        WordDefenderCanvas.tsx
        WorldScene.tsx
        SkyAtmosphere.tsx
        DefenseGround.tsx
        TurretRig.tsx
        FallingWordBlock.tsx
        ProjectilePool.tsx
        VisualEffects.tsx
        QualityManager.tsx
      ui/
        GameHub.tsx
        PackSelector.tsx
        PreGameSetup.tsx
        GameHUD.tsx
        PauseModal.tsx
        GameOverSummary.tsx
        ImportWizard.tsx
        PackLibrary.tsx
        PackEditor.tsx
        SettingsPanel.tsx
      services/
        pack-repository.ts
        local-pack-repository.ts
        official-pack-repository.ts
        firebase-pack-repository.ts  (if applicable)
        excel-parser.ts
        csv-parser.ts
        map-columns.ts
        validate-entries.ts
        export-template.ts
        audio-service.ts
        session-repository.ts
      hooks/
        useGameEngine.ts
        useKeyboardInput.ts
        useMobileInput.ts
        usePackLibrary.ts
      tests/
        engine.test.ts
        targeting.test.ts
        scoring.test.ts
        spawn-director.test.ts
        excel-import.test.ts
        import-validation.test.ts
        pack-library.test.ts
      e2e/
        word-defender-game.spec.ts
        word-defender-import.spec.ts
      index.ts
app/ or pages/ (follow existing repo)
  games/word-defender/...
```

Nếu app hiện có `src/app`/`pages` cụ thể, đặt route ở đúng location. Component nào chỉ render WebGL phải dynamic-import client-side khi chạy trong SSR.

---

## 20. API / ADAPTER CONTRACTS

### 20.1. PackRepository

```ts
interface PackRepository {
  listOfficial(): Promise<PackSummary[]>;
  getOfficialPack(id: string): Promise<VocabularyPack | null>;
  listMyPacks(): Promise<PackSummary[]>;
  getMyPack(id: string): Promise<VocabularyPack | null>;
  saveMyPack(pack: VocabularyPack): Promise<VocabularyPack>;
  deleteMyPack(id: string): Promise<void>;
  duplicateOfficialToMyPacks(id: string): Promise<VocabularyPack>;
}
```

### 20.2. ImportService

```ts
interface ImportedSheet {
  name: string;
  rowCount: number;
  headers: string[];
  sampleRows: unknown[][];
}

interface ImportValidationResult {
  validEntries: VocabularyEntry[];
  issues: Array<{
    rowNumber: number;
    field?: string;
    severity: 'error' | 'warning';
    message: string;
  }>;
  duplicates: Array<{ normalizedTerm: string; rows: number[] }>;
}
```

**Implementation tách thành** parse file → choose sheet/header → map columns → normalize → validate → user resolves → create pack. Không làm một `importExcel(file)` function khổng lồ vừa render UI vừa tự save.

### 20.3. AudioService / Renderer Adapter

```ts
interface GameAudio {
  unlockAfterGesture(): Promise<void>;
  playShot(): void;
  playHit(): void;
  playDestroy(): void;
  playGroundImpact(): void;
  speakWord(text: string, language?: string): Promise<void>;
  setMuted(muted: boolean): void;
  stopAll(): void;
  dispose(): void;
}
```

Renderer chỉ subscribe events và snapshots. Cùng engine core phải chạy được trong test mà không tạo `<canvas>`.

---

## 21. DEVELOPMENT PLAN — TRIỂN KHAI THEO VERTICAL SLICES

### Milestone 0 — Reconnaissance + design integration

- Đọc repo. Xác định React/Next.js version, TS config, auth/Firebase, routing, style tokens, test infra.
- Xác định dependencies đã có và xung đột. Có giải pháp 3D tương thích version thực tế.
- Lập file kế hoạch công việc nhỏ trong repo và commit/checkpoint hợp lý (không sửa file khác ngoài scope).

**Output:** route placeholder có loading đúng, domain folders, type schemas, không phá build.

### Milestone 1 — Gameplay vertical slice chân thực

- Scene 3D đẹp ở mức đầu tiên, turret 3D, falling block 3D có text rõ, bullets/particles.
- Game engine complete first: spawn, targeting, key -> shot, destroy, 3 lives, collision, score, pause, restart, game over.
- Official demo pack 25+ entries, run loop bằng 1 click từ hub.
- Tests targeting/engine timing/fairness.

**Exit criteria:** người dùng chơi được 3+ lượt liên tục không reload/crash, không phải fake interaction.

### Milestone 2 — Excel import + library local-first

- Import `.xlsx` + CSV, sheet selection, header mapping, preview/error, pack naming, save in IndexedDB, download template.
- Library card view, edit/duplicate/export/delete, choose imported pack then play.
- Handle invalid file, duplicates, non-English characters, oversized file, reload persistence.

**Exit criteria:** user có file Excel 2 cột làm được một vòng complete trong browser.

### Milestone 3 — Product polish + education

- Finish visual style premium, environment SFX, settings, reduced-motion, adaptive graphics.
- Onboarding, responsive desktop/mobile, first-time guidance.
- Game over stats, word review, best score; additional curated official packs.
- Loading/empty/error states, no UI dead ends.

### Milestone 4 — Existing-account integration / admin

- Nếu auth/Firestore đã có: optional cloud sync, permissions/security rules, admin content tools.
- Server-side tests/emulator rules nếu cloud writes có mặt.
- Không yêu cầu user đăng nhập để import và chơi.

### Milestone 5 — QA / release readiness

- Unit tests, e2e critical flows, regression tests existing app, lint/typecheck/build.
- Performance pass desktop/mobile, error handling, accessibility audit.
- README cách chạy, cách thêm official pack, Excel format, game balance config và limits.
- Summary of implemented vs deferred features; ghi rõ nếu chưa có global leaderboard / meaning / listening.

**YÊU CẦU TRIỂN KHAI TRONG MỘT LẦN:** Nếu có đủ thời gian và công cụ, thực hiện tuần tự đến Milestone 5. Nếu bị giới hạn context/time, hoàn thiện **ít nhất một vertical slice chạy được end-to-end** và đánh dấu cụ thể phần chưa làm; không tự ý đổi yêu cầu 3D hoặc Excel thành “demo” chỉ vì dễ hơn.

---

## 22. QA / TEST CASES CỤ THỂ (**KHÔNG ĐƯỢC BỎ**)

### 22.1. Unit: targeting & typing

- `APPLE` đang rơi, gõ `a p p l e` → đúng 5 shots, 1 block_destroyed, score + đúng 1 lần.
- Gõ nhanh trong 200ms tổng cộng vẫn ghi nhận đủ key dù projectile chưa bay tới.
- Sai `x` khi đang gõ `AP__E` → không tăng typedIndex, không bắn, accuracy giảm, target giữ nguyên.
- Hai block `APPLE`, `APPLY` → ký tự `a` lock block gần đất hơn (hoặc priority configured); `Tab` chuyển block, đúng behavior không crash.
- Repeated physical keydown (`event.repeat`) không tạo hit mới.
- `Esc` pause không bị tính wrong key; `Space` trong phrase được capture đúng; modifier keys không ảnh hưởng.
- Từ `DON'T`, `ICE CREAM`, `WELL-BEING` phải theo chính sách punctuation rõ.
- One locked block missed → target reset; next correct prefix chọn block khác.
- Key đánh vào modal nhập tên pack không bắn vào game phía sau.

### 22.2. Unit: timing / lives / spawn

- 1 block chạm đất → trừ 1 heart duy nhất.
- 3 damage hợp lệ → GAME_OVER; không spawn thêm sau game over.
- Complete vào same tick block chạm đất → ưu tiên người chơi, không trừ mạng.
- Pause 60s → block không rơi; resume countdown xong mới rơi.
- Tab hidden/throttled 30s → game không nhảy 30s về phía trước.
- Không spawn quá MAX_ACTIVE hoặc ngoài safe boundaries; camera/projected hitbox không overlap quá giới hạn.
- 2 block cùng chạm đất trong grace window → không trừ 2 hearts tức thời; sau cooldown thì damage bình thường.
- Stable random seed cùng config → cùng lịch spawn (nếu timestamp simulated giống nhau).
- 100 lượt start/restart/exit → không nhân đôi event listeners, không crash do WebGL resources leak.

### 22.3. Excel import

- 2 columns `English`, `Vietnamese` → auto-map thành `term`, `meaningVi`.
- Header tiếng Việt có dấu → auto-map đúng.
- XLSX nhiều sheet → chọn sheet B chỉ import B.
- Trống/duplicates/case variants/leading whitespace → normalize, warning đúng.
- Row with HTML `<script>alert(1)</script>` → render literal text hoặc từ chối theo chính sách, không chạy script.
- Unsupported `.xls`/`.exe`/corrupted `.xlsx` → recoverable message.
- File >5MB / rows >max → fail safely, không freeze browser.
- Missing meaning → Classic enabled, Meaning mode disabled + reason.
- Import tạo 1 pack, reload tab → pack còn; xóa → pack biến mất; export -> reimport preserves core content.
- CSV bắt đầu `=HYPERLINK(...)` khi export phải được escape chống formula injection.
- Import Cancel/Back không tạo pack bị lặp/để lại dangling state.

### 22.4. E2E flows

1. Guest visit → chọn `Food & Drinks` → Start → gõ 1 từ → block explode → làm rơi 3 lần → summary → restart.
2. Guest upload Excel 2 cột → map → preview → save → play → get score → reload → find same pack.
3. Edit personal pack → add/remove term → save → next session uses new version, previous result unchanged.
4. Pause/resume and route away → no gameplay input leak into other app pages.
5. Mobile 390x844: menu navigation, import file, start game, native keyboard functional; no critical button obstructed.
6. WebGL disabled: fallback usable / clear guidance; UI doesn't crash.
7. If Firebase configured: user A cannot read/write private pack of user B, guest can't publish official pack, verified admin can publish.

### 22.5. Acceptance checklist (manual)

- [ ] 3D turret thật sự quay khi lock target, bullet xuất hiện ở muzzle và bay theo target.
- [ ] Word blocks có depth, material, light; text vẫn nhìn rõ khi đang rơi.
- [ ] Gõ đúng mỗi ký tự cảm giác phản hồi ngay; gõ sai không bắn.
- [ ] Hoàn thành từ làm block biến mất/nổ đúng một lần.
- [ ] Mất 3 mạng cho đúng 3 damage hợp lệ và game over.
- [ ] Không lag đáng kể ở 5–8 active words trên laptop tầm trung.
- [ ] Chơi được với pack dựng sẵn và pack Excel upload.
- [ ] Excel file tối giản 2 cột được parse và map không cần hướng dẫn kỹ thuật.
- [ ] Import có preview, lỗi theo dòng và download template.
- [ ] Packs private giữ được sau refresh; chỉ owner có quyền nếu cloud sync.
- [ ] Official packs có thể bổ sung mà không sửa engine.
- [ ] Tất cả CTA chính có hành vi thật; no sample fake screens.
- [ ] Game mượt, chữ tương phản, mobile usable, reduced motion.
- [ ] Typecheck/lint/tests/build pass; có README vận hành.

---

## 23. NON-FUNCTIONAL REQUIREMENTS VÀ REGRESSION SAFETY

- TypeScript strict, readable comments trong thuật toán khó; không `any` tràn lan hoặc silently swallow errors.
- Test deterministic engine ở môi trường không WebGL. Freeze time/random và inject RNG.
- Core gameplay không phụ thuộc API network; offline-first.
- Mọi event listener/animation frame/timer/audio subscription phải dispose sạch.
- UI không block main thread khi import dataset trung bình; nếu dataset lớn, parse worker hoặc chunking.
- Bundle heavy 3D và spreadsheet parser lazy-loaded theo route/wizard; không làm home page chậm.
- Không thay đổi global CSS selectors bừa bãi; scope styles/classes.
- Tương thích browser mới của Chrome/Edge/Firefox/Safari theo môi trường hiện có, test ít nhất Chrome + một browser khác.
- Fail-open hay fail-closed rõ ràng: dữ liệu không hợp lệ **không** được vào engine; missing optional audio/visual assets **không** được làm game không chơi được.
- Có minimal analytics events nếu repo đã có analytics: `game_started`, `word_destroyed` (không nhất thiết gửi per key), `game_finished`, `excel_import_succeeded`, `excel_import_failed` (không ghi raw personal vocabulary). Không thêm tracker bên thứ ba khi chưa có đồng ý/chính sách.
- Localization keys tập trung nếu app đã hỗ trợ i18n; title/CTA tiếng Việt; số/đơn vị format phù hợp.

---

## 24. RISKS & QUYẾT ĐỊNH KỸ THUẬT

| Rủi ro | Tác hại | Phòng ngừa |
|---|---|---|
| Scene quá 3D làm chữ khó đọc | Người chơi thất bại không công bằng | Text panel billboard/SDF, camera angle hạn chế, contrast minimum |
| React rerender 60 FPS | Game giật/chậm | Game core external store, imperative mesh updates, throttle UI updates |
| Animation block input | Gõ nhanh bị mất chữ | Input event queue + VFX asynchronous |
| Excel nhập cột đa dạng | User không import được | Header alias mapping + manual dropdown + preview |
| File khổng lồ/corrupt | Browser treo | Limit size/count, worker/chunk, error handling |
| Dữ liệu private lộ | Mất niềm tin | Local-first, no auto upload, Firestore owner rules |
| CSS/UI ảnh hưởng main site | Regression DingDongSpeak | Isolated feature route, scoped styles, regression tests |
| Một file nhiều phrase dài | Impossible gameplay | Mode compatibility validation + length-based difficulty |
| Mobile virtual keyboard | Che game, input khác desktop | Separate mobile input adapter / viewport resize |
| Score client-side dễ sửa | Leaderboard không công bằng | Local score trước, ranked verify server later |
| WebGL không support | Không dùng được game | Canvas 2D fallback hoặc user recovery rõ ràng |
| Dữ liệu official kém chất lượng | Học sai tiếng Anh | Curated packs, validation, audit examples |

---

## 25. CÁC QUYẾT ĐỊNH MẶC ĐỊNH ĐỂ KHÔNG CẦN HỎI LẠI

| Quyết định | Default |
|---|---|
| Tên sản phẩm | Word Defender 3D, thuộc DingDongSpeak |
| Audience | Người Việt học tiếng Anh |
| UI language | Tiếng Việt |
| Primary mode | Classic Typing Survival |
| Initial hearts | 3 |
| Game ending | Endless survival, kết thúc khi hết tim |
| Targeting | First char auto-lock, nearest danger first, Tab cycle |
| Typing check | Case-insensitive English letters; spaces/punctuation theo config |
| Desktop | Phương án thiết kế/chơi tốt nhất |
| Mobile | Responsive & native typing support; difficulty adjusted |
| 3D | Real Three.js scene, HTML UI overlay |
| Excel input | `.xlsx`, `.csv`; `.xls` yêu cầu convert |
| File min | 2 valid words for survival (1 in practice only) |
| File max | 5 MB / 5000 entries configurable |
| Saving | IndexedDB local-first; Firebase optional if existing |
| Official packs | JSON manifest + curated demo packs; publish UI if admin available |
| Feedback | SFX + hit particle + score + optional word meaning |
| Login | Không bắt buộc để chơi và upload |
| Monetization | Chưa triển khai/paywall trong MVP |
| Competitive leaderboard | Deferred until reasonable anti-cheat/server verification |
| Art style | Cinematic sci-fi, deep blue + cyan + warm projectiles |
| Accessibility | Reduced motion, color-independent cues, 2D fallback |

Khi chi tiết kỹ thuật phát sinh ambiguity, chọn default hợp lý nhất và **ghi rationale** thay vì dừng việc xây sản phẩm để hỏi câu không thiết yếu.

---

## 26. MẪU BỘ TỪ DÙNG ĐỂ SMOKE TEST (KHÔNG ĐỦ THAY THẾ 4 PACK 25+ ENTRIES)

```json
{
  "id": "demo-everyday-a1",
  "title": "Everyday English A1",
  "description": "Các từ cơ bản trong cuộc sống hằng ngày",
  "sourceType": "official",
  "visibility": "public",
  "tags": ["beginner", "daily"],
  "version": 1,
  "entries": [
    { "id": "e1", "term": "apple", "meaningVi": "quả táo", "cefr": "A1", "category": "Food" },
    { "id": "e2", "term": "school", "meaningVi": "trường học", "cefr": "A1", "category": "Education" },
    { "id": "e3", "term": "family", "meaningVi": "gia đình", "cefr": "A1", "category": "People" },
    { "id": "e4", "term": "music", "meaningVi": "âm nhạc", "cefr": "A1", "category": "Hobbies" },
    { "id": "e5", "term": "garden", "meaningVi": "khu vườn", "cefr": "A1", "category": "Home" },
    { "id": "e6", "term": "window", "meaningVi": "cửa sổ", "cefr": "A1", "category": "Home" },
    { "id": "e7", "term": "friend", "meaningVi": "bạn bè", "cefr": "A1", "category": "People" },
    { "id": "e8", "term": "study", "meaningVi": "học", "cefr": "A1", "category": "Education" }
  ]
}
```

Mã triển khai phải bảo đảm `createdAt`, `updatedAt` hoặc giá trị metadata tương ứng được điền khi seed/save, theo validator thực. Đây chỉ là mẫu nội dung và shape, không phải pack production hoàn chỉnh.

---

## 27. CHECKPOINTS ĐỂ CLAUDE CODE TỰ KIỂM SOÁT CHẤT LƯỢNG

Sau từng milestone, tự trả lời:

1. **Tôi đã chạy thực tế chưa?** Hay chỉ có code trông hợp lý?
2. **Có screenshot/gameplay/video visual evidence nội bộ (nếu browser tools sẵn có) không?** Không được khẳng định đã kiểm tra hình ảnh nếu chưa thể mở trang.
3. **Excel 2 cột của user bất kỳ có đi từ upload tới playable pack chưa?**
4. **Mỗi key đúng tạo một shot thực?** Hay chỉ đổi chữ tức thời?
5. **Tim mất đúng luật?** Có bug double collision / multiple simultaneous damage không?
6. **Từ 3D có nhìn rõ ở nhiều kích thước/góc máy không?**
7. **Cấu trúc app cũ có còn chạy không?**
8. **Có memory/performance leaks hay API console errors không?**
9. **Tất cả nút liên quan đến luồng chính có hoạt động không?**
10. **Cái gì còn deferred?** Báo trung thực và chính xác.

---

## 28. FINAL DELIVERY FORMAT BẮT BUỘC CỦA CLAUDE CODE

Cuối triển khai, trả lời ngắn gọn bằng tiếng Việt với cấu trúc:

```text
WORD DEFENDER 3D — HANDOFF
1. Đã xây dựng: [tính năng THỰC SỰ chạy]
2. Đường dẫn truy cập/route:
3. Cách chạy local: [lệnh package manager, env nếu có]
4. Công nghệ đã dùng và vì sao tương thích repo:
5. Dùng bộ từ có sẵn: [đường dẫn thêm bộ từ]
6. Import Excel: [định dạng hỗ trợ, giới hạn và hướng dẫn 2 cột]
7. Tests: [lệnh và kết quả thật, lỗi còn tồn tại]
8. Đã kiểm tra UI trên: [thiết bị/trình duyệt thực tế đã mở]
9. Những chức năng hoãn lại / limitation: [minh bạch]
10. Các file chính được tạo/sửa:
```

**Không được kết luận “đã hoàn thành toàn bộ” khi chưa có upload Excel + game 3D + gameplay end-to-end chạy thật.**

---

## 29. TÀI LIỆU KỸ THUẬT THAM KHẢO (ĐỌC ĐÚNG PHIÊN BẢN)

- React Three Fiber docs: https://r3f.docs.pmnd.rs/ — chọn phiên bản tương ứng major React.
- Three.js docs: https://threejs.org/docs/ — real 3D geometry, camera, shaders, performance.
- Three.js text strategies: https://threejs.org/manual/en/creating-text.html — DOM/3D/SDF/troika options.
- `read-excel-file`: https://www.npmjs.com/package/read-excel-file — chú ý API export thay đổi giữa các major, dùng API version đang cài.
- IndexedDB (MDN): https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Firebase Security Rules: https://firebase.google.com/docs/rules/rules-and-auth
- Firebase custom claims: https://firebase.google.com/docs/auth/admin/custom-claims
- WCAG: https://www.w3.org/WAI/standards-guidelines/wcag/

**Tài liệu version có thể đổi theo thời gian:** luôn inspect `package.json`, official docs và runtime thật trước khi dùng code API/library. Không cố định bản dependency không tương thích React/Next.js repo.

---

# 30. PROMPT KẾT THÚC — HÃY BẮT ĐẦU TRIỂN KHAI NGAY

> **Claude Code, hãy dùng tài liệu này làm đặc tả nguồn duy nhất cho module game Word Defender 3D. Đầu tiên đọc repo và các quy ước hiện hữu, sau đó tự tổ chức kế hoạch triển khai theo các milestone, thực hiện và kiểm thử. Ưu tiên sản phẩm hoạt động đầy đủ, đẹp thực sự, gameplay mượt, Excel upload đúng, built-in packs đúng, và không phá chức năng khác. Đừng dừng ở mức viết PRD hay prototype UI. Việc triển khai phải có code thật, test thật và báo cáo thật. Những phần P1/P2 có thể tách thành giai đoạn sau nếu cần, nhưng P0 phải hoàn chỉnh end-to-end.**

---

*Prepared as an implementation specification for DingDongSpeak / Word Defender 3D.*
