#!/usr/bin/env python3
"""Local Adaptive Planner <-> XiaoZhi bridge.

The ESP32 keeps running XiaoZhi. This process polls Adaptive Planner, serves
short Ogg/Opus notification files, and listens for XiaoZhi STT events over the
board's local WebSocket endpoint.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import re
import socket
import subprocess
import threading
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import websockets


BACKEND_URL = os.getenv("ADAPTIVE_BACKEND_URL", "http://127.0.0.1:8080/api").rstrip("/")
DEVICE_IP = os.getenv("XIAOZHI_DEVICE_IP", "172.20.10.5")
AUDIO_PORT = int(os.getenv("BRIDGE_AUDIO_PORT", "8765"))
POLL_SECONDS = int(os.getenv("BRIDGE_POLL_SECONDS", "10"))
AUDIO_DIR = Path(os.getenv("BRIDGE_AUDIO_DIR", Path(__file__).with_name("audio-cache")))
TTS_VOICE = os.getenv("BRIDGE_TTS_VOICE", "")
BRIDGE_LANGUAGE = os.getenv("BRIDGE_LANGUAGE", "en").strip().lower()
BRIDGE_REMINDER_STYLE = os.getenv("BRIDGE_REMINDER_STYLE", "gentle").strip().lower()

SUPPORTED_LANGUAGES = {"en", "vi"}
SUPPORTED_STYLES = {"gentle", "direct", "minimal"}


def local_ip() -> str:
    """Return the Mac's LAN address used to serve audio to the ESP32."""
    override = os.getenv("BRIDGE_HOST_IP")
    if override:
        return override
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect((DEVICE_IP, 8080))
        return probe.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        probe.close()


def api_request(path: str, method: str = "GET", payload: Any | None = None) -> Any:
    body = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        f"{BACKEND_URL}{path}", data=body, headers=headers, method=method
    )
    with urllib.request.urlopen(request, timeout=8) as response:
        if response.status == 204:
            return None
        return json.loads(response.read().decode("utf-8"))


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.lower())
    return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")


def parse_time(text: str) -> str | None:
    match = re.search(
        r"\b([01]?\d|2[0-3])(?:\s*[:.]\s*(\d{2})|\s*h(?:\s*(\d{2}))?)?\s*(am|pm)?\b",
        text.lower(),
    )
    if not match:
        return None
    hour = int(match.group(1))
    minute = int(match.group(2) or match.group(3) or 0)
    period = match.group(4)
    if period == "pm" and hour < 12:
        hour += 12
    elif period == "am" and hour == 12:
        hour = 0
    return f"{hour:02d}:{minute:02d}"


def duration_minutes(block: dict[str, Any]) -> int:
    try:
        start = datetime.strptime(block["startTime"], "%H:%M")
        end = datetime.strptime(block["endTime"], "%H:%M")
        return max(1, int((end - start).total_seconds() // 60))
    except (KeyError, TypeError, ValueError):
        return 30


def create_audio(text: str, voice: str = "") -> tuple[Path, float]:
    """Use macOS speech synthesis, then convert to the Ogg Opus format XiaoZhi expects."""
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
    ogg_path = AUDIO_DIR / f"{digest}.ogg"
    if ogg_path.exists():
        return ogg_path, max(3.0, len(text) / 12.0)

    aiff_path = AUDIO_DIR / f"{digest}.aiff"
    say_command = ["say", "-o", str(aiff_path)]
    if voice:
        say_command[1:1] = ["-v", voice]
    say_command.append(text)
    subprocess.run(say_command, check=True, capture_output=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(aiff_path),
            "-ac",
            "1",
            "-c:a",
            "libopus",
            "-b:a",
            "24k",
            str(ogg_path),
        ],
        check=True,
        capture_output=True,
    )
    aiff_path.unlink(missing_ok=True)
    return ogg_path, max(3.0, len(text) / 12.0)


class QuietAudioHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        return


class Bridge:
    def __init__(
        self,
        language: str = BRIDGE_LANGUAGE,
        reminder_style: str = BRIDGE_REMINDER_STYLE,
        tts_voice: str = TTS_VOICE,
    ) -> None:
        self.device_socket: Any | None = None
        self.send_lock = asyncio.Lock()
        self.pending: dict[str, dict[str, Any]] = {}
        self.fired: set[str] = set()
        self.audio_host = local_ip()
        self.language = language if language in SUPPORTED_LANGUAGES else "en"
        self.reminder_style = reminder_style if reminder_style in SUPPORTED_STYLES else "gentle"
        self.tts_voice = tts_voice or ("Samantha" if self.language == "en" else "")

    def reminder_text(self, title: str, minutes_before: int) -> str:
        """Build a short reminder in the selected language and tone."""
        if self.language == "vi":
            if self.reminder_style == "minimal":
                return f"{title}, {minutes_before} phút nữa." if minutes_before else f"Đến giờ: {title}."
            if self.reminder_style == "direct":
                return f"{title} bắt đầu sau {minutes_before} phút." if minutes_before else f"Đến giờ {title}."
            return (
                f"Nhắc nhẹ: {title} bắt đầu sau {minutes_before} phút. Bạn có thể chuẩn bị từ từ."
                if minutes_before
                else f"Nhắc nhẹ: đã đến giờ {title}. Bạn có thể bắt đầu khi sẵn sàng."
            )

        if self.reminder_style == "minimal":
            return f"{title}, {minutes_before} min." if minutes_before else f"Now: {title}."
        if self.reminder_style == "direct":
            return f"{title} starts in {minutes_before} minutes." if minutes_before else f"It is time for {title}."
        return (
            f"A gentle reminder: {title} starts in {minutes_before} minutes. You have time to get ready."
            if minutes_before
            else f"A gentle reminder: it is time for {title}. Begin when you are ready."
        )

    def response_text(self, kind: str, title: str = "this task", time: str = "") -> str:
        if self.language == "vi":
            messages = {
                "done": f"Đã đánh dấu hoàn thành: {title}.",
                "moved": f"Đã dời {title} sang {time}.",
                "updated": f"Đã cập nhật lịch: {title}.",
                "retry": "Mình chưa hiểu. Bạn nói đã xong hoặc nói dời sang mấy giờ nhé.",
                "backend": "Adaptive hiện chưa phản hồi, mình sẽ thử lại sau.",
                "recurring": "Việc này là lịch lặp, hiện cần cập nhật trên Adaptive.",
            }
        else:
            messages = {
                "done": f"Marked complete: {title}.",
                "moved": f"Moved {title} to {time}.",
                "updated": f"Updated the schedule: {title}.",
                "retry": "I did not catch that. Say done, or tell me what time to move it to.",
                "backend": "Adaptive is not responding right now. I will try again later.",
                "recurring": "This is a recurring schedule. Please update it in Adaptive.",
            }
        return messages[kind]

    def is_done_command(self, text: str) -> bool:
        normalized = normalize(text)
        return any(
            phrase in normalized
            for phrase in (
                "da xong", "hoan thanh", "xong roi", "da lam",
                "done", "all done", "finished", "complete", "completed",
            )
        )

    def is_move_command(self, text: str) -> bool:
        normalized = normalize(text)
        return any(
            phrase in normalized
            for phrase in (
                "doi", "sang gio", "chuyen gio", "move", "reschedule", "later", "change the time",
            )
        )

    async def send(self, message: dict[str, Any]) -> None:
        if self.device_socket is None:
            raise RuntimeError("XiaoZhi local WebSocket is not connected")
        async with self.send_lock:
            await self.device_socket.send(json.dumps(message, ensure_ascii=False))

    async def notify(self, text: str) -> bool:
        if self.device_socket is None:
            print("[bridge] Bỏ qua nhắc lịch: robot chưa kết nối WebSocket")
            return False
        # Refresh this in case the Mac moved onto the robot's hotspot after startup.
        self.audio_host = local_ip()
        audio_path, estimated_seconds = await asyncio.to_thread(create_audio, text, self.tts_voice)
        relative_path = urllib.parse.quote(audio_path.name)
        try:
            await self.send(
                {
                    "type": "notify",
                    "audio_url": f"http://{self.audio_host}:{AUDIO_PORT}/{relative_path}",
                    "subtitles": [{"start_ms": 0, "text": text}],
                }
            )
        except (OSError, websockets.WebSocketException, RuntimeError) as error:
            print(f"[bridge] Không gửi được nhắc lịch: {error}")
            return False
        # The notification protocol is intentionally one-way. After playback,
        # open a normal XiaoZhi listening turn so the user can answer naturally.
        await asyncio.sleep(estimated_seconds + 0.8)
        if self.device_socket is not None:
            try:
                await self.send({"type": "listen"})
            except (OSError, websockets.WebSocketException, RuntimeError) as error:
                print(f"[bridge] Không mở được lượt nghe: {error}")
                return False
        return True

    async def poll_calendar(self) -> None:
        while True:
            try:
                today = date.today().isoformat()
                blocks = await asyncio.to_thread(api_request, f"/timeblocks?date={today}")
                now = datetime.now()
                self.fired = {marker for marker in self.fired if marker.startswith(f"{today}:")}
                for block in blocks or []:
                    if block.get("isCompleted") or block.get("isBufferBlock"):
                        continue
                    block_id = str(block.get("id", ""))
                    start = block.get("startTime")
                    if not block_id or not start:
                        continue
                    try:
                        start_at = datetime.strptime(f"{today} {start}", "%Y-%m-%d %H:%M")
                    except ValueError:
                        continue
                    reminder_values = block.get("reminderMinutesBefore") or [0]
                    for minutes in reminder_values:
                        trigger_at = start_at - timedelta(minutes=int(minutes))
                        marker = f"{today}:{block_id}:{minutes}"
                        if marker in self.fired:
                            continue
                        if timedelta(seconds=-2) <= now - trigger_at <= timedelta(seconds=75):
                            title = block.get("title", "this task")
                            if await self.notify(self.reminder_text(title, int(minutes))):
                                self.fired.add(marker)
                                self.pending[block_id] = block
                                break
            except (urllib.error.URLError, TimeoutError, OSError, ValueError) as error:
                print(f"[bridge] Adaptive chưa sẵn sàng: {error}")
            await asyncio.sleep(POLL_SECONDS)

    async def handle_stt(self, text: str) -> None:
        if not self.pending:
            return
        block_id, block = next(reversed(self.pending.items()))
        try:
            if self.is_done_command(text):
                if not block_id.isdigit():
                    await self.notify(self.response_text("recurring"))
                    return
                await asyncio.to_thread(
                    api_request,
                    f"/timeblocks/{block_id}",
                    "PUT",
                    {"isCompleted": True},
                )
                await self.notify(self.response_text("done", block.get("title", "this task")))
                self.pending.pop(block_id, None)
                return

            if self.is_move_command(text):
                new_start = parse_time(text)
                if new_start and block_id.isdigit():
                    start_at = datetime.strptime(new_start, "%H:%M")
                    new_end = (start_at + timedelta(minutes=duration_minutes(block))).strftime("%H:%M")
                    await asyncio.to_thread(
                        api_request,
                        f"/timeblocks/{block_id}",
                        "PUT",
                        {"startTime": new_start, "endTime": new_end},
                    )
                    await self.notify(self.response_text("moved", block.get("title", "this task"), new_start))
                    self.pending.pop(block_id, None)
                    return

            parsed = await asyncio.to_thread(
                api_request, "/planner/parse-intent", "POST", {"prompt": text}
            )
            updates = {
                key: parsed[key]
                for key in ("title", "detail", "startTime", "endTime", "category", "energyLevel", "priority", "deadline")
                if parsed.get(key) is not None
            }
            if updates and block_id.isdigit():
                await asyncio.to_thread(api_request, f"/timeblocks/{block_id}", "PUT", updates)
                await self.notify(self.response_text("updated", updates.get("title", block.get("title", "this task"))))
                self.pending.pop(block_id, None)
            else:
                await self.notify(self.response_text("retry"))
        except (urllib.error.URLError, TimeoutError, OSError, ValueError, KeyError) as error:
            print(f"[bridge] Không cập nhật được Adaptive: {error}")
            await self.notify(self.response_text("backend"))

    async def receive_device_events(self) -> None:
        uri = f"ws://{DEVICE_IP}:8080/ws"
        while True:
            try:
                print(f"[bridge] Đang kết nối {uri}")
                async with websockets.connect(uri, ping_interval=20, open_timeout=8) as websocket:
                    self.device_socket = websocket
                    print("[bridge] Đã kết nối robot")
                    async for raw_message in websocket:
                        try:
                            message = json.loads(raw_message)
                        except json.JSONDecodeError:
                            continue
                        if message.get("type") == "stt":
                            print(f"[bridge] Robot nghe: {message.get('text', '')}")
                            await self.handle_stt(message.get("text", ""))
            except (OSError, TimeoutError, asyncio.TimeoutError, websockets.WebSocketException) as error:
                print(f"[bridge] Robot chưa kết nối: {error}")
            finally:
                self.device_socket = None
            await asyncio.sleep(3)

    async def run(self) -> None:
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        handler = lambda *args, **kwargs: QuietAudioHandler(
            *args, directory=str(AUDIO_DIR), **kwargs
        )
        server = ThreadingHTTPServer(("0.0.0.0", AUDIO_PORT), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        print(f"[bridge] Audio server: http://{self.audio_host}:{AUDIO_PORT}/")
        await asyncio.gather(self.receive_device_events(), self.poll_calendar())


def main() -> None:
    parser = argparse.ArgumentParser(description="Adaptive Planner XiaoZhi bridge")
    parser.add_argument("--language", choices=sorted(SUPPORTED_LANGUAGES), default=BRIDGE_LANGUAGE)
    parser.add_argument("--style", choices=sorted(SUPPORTED_STYLES), default=BRIDGE_REMINDER_STYLE)
    parser.add_argument("--voice", default=TTS_VOICE, help="macOS say voice name")
    args = parser.parse_args()
    try:
        asyncio.run(Bridge(args.language, args.style, args.voice).run())
    except KeyboardInterrupt:
        print("\n[bridge] Đã dừng")


if __name__ == "__main__":
    main()
