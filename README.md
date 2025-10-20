# 🍅 Pomodoro Timer App

Ứng dụng quản lý thời gian theo phương pháp Pomodoro, được xây dựng với React Native và Expo.

## 📖 Giới thiệu

Pomodoro Timer là ứng dụng giúp tăng năng suất làm việc theo kỹ thuật Pomodoro - phương pháp quản lý thời gian chia công việc thành các phiên 25 phút (work) xen kẽ với 5 phút nghỉ ngơi (break). Khi kết thúc thời gian sẽ hiện thị thông báo và rung thiết bị.

### ✨ Tính năng chính

**Yêu cầu cơ bản:**
- ⏱️ **Timer Work/Break**: 25 phút làm việc, 5 phút nghỉ ngơi
- 🔔 **Thông báo nền**: Nhận notification khi phiên kết thúc (ngay cả khi app đang chạy nền)
- 💾 **Lưu lịch sử**: Tất cả phiên hoàn thành được lưu vào AsyncStorage
- 📳 **Haptic Feedback**: Rung phản hồi khi tương tác
- 🔆 **Keep Awake**: Giữ màn hình sáng trong khi timer chạy

**Tính năng mở rộng:**
- ⚙️ **Tùy chỉnh thời gian**: Điều chỉnh thời lượng work và break theo ý muốn
- 📊 **Biểu đồ thống kê**: Line chart hiển thị số phiên làm việc trong 7 ngày
- 📝 **Danh sách phiên gần đây**: Xem 5 phiên vừa hoàn thành
- 🎨 **UI đẹp mắt**: Gradient background thay đổi theo mode (tím cho work, hồng cho break)
- 🌙 **Dark theme**: Giao diện tối thoải mái cho mắt

## 🚀 Cài đặt và Chạy

### Yêu cầu

- Node.js 18+ 
- npm hoặc yarn
- Expo Go app (cho test trên điện thoại thật)
- Xcode (cho iOS) hoặc Android Studio (cho Android)

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Chạy ứng dụng

```bash
# Khởi động Expo development server
npx expo start

# Hoặc chạy trực tiếp trên platform cụ thể
npx expo start --ios       # iOS Simulator
npx expo start --android   # Android Emulator
npx expo start --web       # Web Browser
```

### Bước 3: Chọn platform

Sau khi chạy `npx expo start`, bạn có thể:
- Nhấn `i` để mở iOS Simulator
- Nhấn `a` để mở Android Emulator  
- Quét QR code bằng Expo Go app (trên điện thoại thật)
- Nhấn `w` để mở trên web browser

## 📱 Hướng dẫn sử dụng

### Sử dụng Timer

1. **Chọn chế độ**: Work (làm việc) hoặc Break (nghỉ ngơi)
2. **Bắt đầu**: Nhấn nút "Start" để timer đếm ngược
3. **Tạm dừng**: Nhấn "Pause" nếu cần dừng lại
4. **Reset**: Nhấn "Reset" để đặt lại timer

### Tùy chỉnh cài đặt

1. Nhấn icon ⚙️ ở góc trên phải
2. Nhập thời gian Work (phút)
3. Nhập thời gian Break (phút)
4. Nhấn "Save" để lưu

### Xem thống kê

1. Nhấn icon 📊 ở góc trên phải
2. Xem biểu đồ 7 ngày gần nhất
3. Xem danh sách 5 phiên gần đây

## 🏗️ Kiến trúc dự án

```
Pomodoro/
├── app/
│   ├── _layout.tsx              # Root layout
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigation (ẩn tab bar)
│       └── index.tsx            # Màn hình chính
├── components/
│   └── pomodoro-timer.tsx       # Component chính (~600 lines)
├── types/
│   └── pomodoro.ts              # TypeScript type definitions
├── utils/
│   ├── storage.ts               # Quản lý AsyncStorage
│   ├── notifications.ts         # Xử lý thông báo
│   └── stats.ts                 # Tính toán thống kê
├── assets/                      # Hình ảnh và media
├── app.json                     # Cấu hình Expo
└── package.json                 # Dependencies
```

## 🛠️ Công nghệ sử dụng

### Core Technologies
- **React Native** - Framework mobile
- **Expo** - Toolchain và SDK
- **TypeScript** - Type safety

### Expo Modules
- `expo-notifications` - Push notifications
- `expo-keep-awake` - Giữ màn hình sáng
- `expo-haptics` - Haptic feedback
- `expo-linear-gradient` - Gradient backgrounds

### Libraries
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-chart-kit` - Vẽ biểu đồ
- `react-native-svg` - SVG support cho charts

## 📊 Tính năng chi tiết

### 1. Timer Management
```typescript
- Countdown timer với hiển thị MM:SS
- Progress bar trực quan
- Tự động chuyển mode sau khi hoàn thành
- Hoạt động background với notification
```

### 2. Data Persistence
```typescript
// Mỗi session được lưu với cấu trúc:
{
  id: "1729425600000",
  mode: "work" | "break",
  duration: 1500,              // seconds
  completedAt: "2025-10-20T10:30:00.000Z",
  date: "2025-10-20"
}
```

### 3. Statistics & Analytics
```typescript
- Biểu đồ line chart 7 ngày
- Tính tổng số phiên work/break
- Tính tổng thời gian làm việc
- Danh sách sessions gần đây
```

### 4. Notifications
```typescript
- Permission request tự động
- Schedule notification khi start timer
- Immediate notification khi complete
- Android notification channel custom
```

## 🎨 Giao diện

### Color Scheme

**Work Mode (Purple Gradient)**
```
Start: #667eea
End:   #764ba2
```

**Break Mode (Pink Gradient)**
```
Start: #f093fb  
End:   #f5576c
```

### Typography
- Header: 24px, Bold
- Timer: 72px, Bold, Tabular nums
- Body: 16-20px
- Small: 12-14px

## 🧪 Testing

### Test trên thiết bị thật (Khuyến nghị)
```bash
# iOS
npx expo start
# Quét QR code bằng Camera app (iOS 11+)

# Android  
npx expo start
# Quét QR code bằng Expo Go app
```

### Test notifications
⚠️ **Lưu ý**: Notifications không hoạt động trên iOS Simulator. Cần test trên thiết bị thật.

### Test checklist
- [ ] Timer đếm ngược chính xác
- [ ] Chuyển mode tự động khi hết giờ
- [ ] Notification xuất hiện khi complete
- [ ] Sessions được lưu vào AsyncStorage
- [ ] Settings persist sau khi restart app
- [ ] Biểu đồ hiển thị đúng data
- [ ] Haptic feedback hoạt động
- [ ] Background timer hoạt động

## 📚 Tài liệu bổ sung

- **ARCHITECTURE.md** - Chi tiết kiến trúc và data flow
- **HUONG_DAN.md** - Hướng dẫn sử dụng chi tiết (Tiếng Việt)
- **TESTING_GUIDE.md** - Checklist và scenarios test
- **QUICK_REFERENCE.md** - Tham khảo nhanh APIs và commands
- **CLEANUP_SUMMARY.md** - Quá trình dọn dẹp code

## 🐛 Troubleshooting

### Notifications không hoạt động
- ✅ Test trên thiết bị thật (không phải simulator)
- ✅ Kiểm tra đã cấp quyền notification
- ✅ Kiểm tra Settings → Notifications

### Timer không chạy background
- ✅ Đây là hành vi bình thường trên web
- ✅ Test trên iOS/Android app
- ✅ Notification sẽ nhắc khi timer hết

### Biểu đồ không hiển thị
- ✅ Hoàn thành ít nhất 1 session trước
- ✅ Kiểm tra `react-native-svg` đã cài
- ✅ Xem console logs để debug

## 📝 Changelog

### Version 1.0.0 (2025-10-20)
- ✅ Initial release
- ✅ Work/Break timer với 25/5 phút
- ✅ Notifications và haptic feedback
- ✅ AsyncStorage persistence
- ✅ 7-day statistics chart
- ✅ Customizable durations
- ✅ Beautiful gradient UI

## 🤝 Contributing

Dự án này được tạo cho mục đích học tập. Contributions được chào đón!

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và cá nhân.

## 👨‍💻 Author

Được phát triển như một phần của môn học **Đa nền tảng** (Cross-platform Development).

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - Amazing development platform
- [React Native](https://reactnative.dev) - Cross-platform framework
- [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) - Time management method

---

**Made with ❤️ using React Native & Expo**

🍅 Start being productive with Pomodoro Timer today!
