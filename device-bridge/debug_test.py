import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import asyncio
import json
import websockets
import time

async def main():
    print("Connecting to robot ws://10.38.219.148:8080/ws...")
    async with websockets.connect("ws://10.38.219.148:8080/ws") as ws:
        print("Connected!")
        msg = {
            "type": "notify",
            "audio_url": "http://10.38.219.99:8765/test_gtts.ogg",
            "subtitles": [{"start_ms": 0, "text": "Xin chào, tôi là robot trợ lý của bạn"}]
        }
        print("Sending notify msg with OGG OPUS...")
        await ws.send(json.dumps(msg))
        print("Sent! Waiting 6s...")
        await asyncio.sleep(6)

if __name__ == "__main__":
    asyncio.run(main())
