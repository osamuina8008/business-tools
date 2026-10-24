"""復習フィードの講義・掛け合いを Edge の声で MP3 にする。できたものだけ記録し、再実行で続きから。"""
import asyncio, hashlib, json, time
from pathlib import Path
import edge_tts

HERE = Path(__file__).resolve().parent
LECTURE = "ja-JP-NanamiNeural"
SENSEI = "ja-JP-KeitaNeural"
SEITO = "ja-JP-NanamiNeural"
RATE = "+0%"

def hid(voice, text):
    return hashlib.sha1(f"{voice}\n{RATE}\n{text}".encode()).hexdigest()[:12]

async def main():
    topics = json.loads((HERE / "topic_struct.json").read_text())
    out = HERE / "audio"
    out.mkdir(exist_ok=True)
    man_path = HERE / "audio" / "manifest.json"
    manifest = {}
    if man_path.exists():
        manifest = json.loads(man_path.read_text()).get("items", {})
    jobs = []
    for key, st in topics.items():
        if not isinstance(st, dict):
            continue
        lec = (st.get("lecture") or "").strip()
        if lec:
            jobs.append((key, "lecture", None, LECTURE, lec))
        for i, line in enumerate(st.get("talk") or []):
            text = (line.get("t") or "").strip()
            if text:
                voice = SENSEI if line.get("w") == "先生" else SEITO
                jobs.append((key, "talk", i, voice, text))
    sem = asyncio.Semaphore(6)
    done = 0
    failed = []
    start = time.monotonic()

    def write():
        payload = {
            "lectureVoice": LECTURE,
            "senseiVoice": SENSEI,
            "seitoVoice": SEITO,
            "rate": RATE,
            "items": manifest,
        }
        tmp = man_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=1))
        tmp.replace(man_path)

    async def one(key, kind, idx, voice, text):
        nonlocal done
        name = f"{hid(voice, text)}.mp3"
        target = out / name
        part = target.with_suffix(".part")
        async with sem:
            for attempt in range(4):
                try:
                    if not target.exists() or target.stat().st_size < 800:
                        await asyncio.wait_for(
                            edge_tts.Communicate(text, voice, rate=RATE).save(str(part)),
                            timeout=90,
                        )
                        if part.stat().st_size < 800:
                            raise RuntimeError("empty")
                        part.replace(target)
                    slot = manifest.setdefault(key, {})
                    if kind == "lecture":
                        slot["lecture"] = "audio/" + name
                    else:
                        talk = slot.setdefault("talk", [])
                        while len(talk) <= idx:
                            talk.append("")
                        talk[idx] = "audio/" + name
                    done += 1
                    if done % 20 == 0 or done == len(jobs):
                        write()
                        print(f"{done}/{len(jobs)} {round(time.monotonic()-start)}s", flush=True)
                    return
                except Exception as e:
                    part.unlink(missing_ok=True)
                    if attempt == 3:
                        failed.append(key)
                        print("failed", key, kind, idx, type(e).__name__, flush=True)
                    else:
                        await asyncio.sleep(2 * (attempt + 1))

    await asyncio.gather(*(one(*job) for job in jobs))
    write()
    print("COMPLETE", done, "failed", len(failed), flush=True)
    if failed:
        raise SystemExit(1)

if __name__ == "__main__":
    asyncio.run(main())
