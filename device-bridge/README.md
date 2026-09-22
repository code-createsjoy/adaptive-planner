# Adaptive Planner ↔ XiaoZhi bridge

Bridge này chạy trên Mac/server, không chạy Python trên ESP32.

Luồng hiện tại:

1. Poll `GET /api/timeblocks?date=YYYY-MM-DD` từ Adaptive Planner.
2. Đến thời gian nhắc, tạo Ogg/Opus bằng `say` + `ffmpeg` và gửi lệnh `notify` tới robot.
3. Sau khi phát xong, mở một lượt nghe XiaoZhi.
4. Nhận sự kiện STT từ robot qua `ws://ROBOT_IP:8080/ws`.
5. `done` đánh dấu block hoàn thành; `move it to 16:00` cập nhật giờ; câu khác gửi qua `parse-intent` rồi cập nhật block đang chờ.

## Chạy local

Trước khi chạy bridge, Adaptive backend phải đang chạy tại `http://127.0.0.1:8080`.
Frontend có thể chạy tại `http://localhost:5173` như bình thường.

```bash
cd /Users/VoThiXuanHoa/.codex/.chatgpt-projects/g-p-6aaf6d5a07ac8191a5358e79f8b0fe75/adaptive-planner/device-bridge
XIAOZHI_DEVICE_IP=172.20.10.5 python3 adaptive_robot_bridge.py
```

Mặc định bridge dùng tiếng Anh, giọng `Samantha`, và phong cách nhắc nhẹ nhàng. Có thể chọn phong cách `gentle`, `direct`, hoặc `minimal`:

```bash
XIAOZHI_DEVICE_IP=172.20.10.5 \
BRIDGE_LANGUAGE=en \
BRIDGE_REMINDER_STYLE=gentle \
python3 adaptive_robot_bridge.py
```

Hoặc truyền trực tiếp khi chạy:

```bash
python3 adaptive_robot_bridge.py --language en --style direct
```

Bridge chỉ đánh dấu một lần nhắc là đã gửi sau khi WebSocket robot nhận được lệnh; nếu robot tạm mất kết nối, lần nhắc sẽ được thử lại ở vòng poll kế tiếp.

Nếu địa chỉ Mac không tự nhận đúng, đặt thêm `BRIDGE_HOST_IP=172.20.10.2`.

Sau khi nạp firmware tùy biến, robot dùng WebSocket nội bộ ở `ws://ROBOT_IP:8080/ws`.
Địa chỉ `:8081` trong firmware War-Tank cũ không còn là giao diện điều khiển của bridge này.

Yêu cầu: Python có package `websockets`, macOS có lệnh `say`, và có `ffmpeg`. Bridge chỉ cập nhật các block có ID số; lịch lặp có ID dạng `routine-...` cần được chuyển thành block cụ thể trước khi đánh dấu hoàn thành.
