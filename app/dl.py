import requests
import subprocess
import os

def download_video_r2(url, video_file):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/141.0.0.0 Safari/537.36",
        "Referer": "https://tktube.com/"
    }

    with requests.get(url, stream=True, headers=headers) as r:
        r.raise_for_status()
        with open(video_file, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    print(f"Tải video xong: {video_file}")


def extract_audio(video_file, audio_file):
    # Trích âm thanh bằng FFmpeg
    cmd = [
        "ffmpeg",
        "-i", video_file,     # Input video
        "-vn",                # Bỏ phần hình (video)
        "-acodec", "mp3",     # Xuất ra codec âm thanh mp3
        audio_file
    ]

    subprocess.run(cmd, check=True)
    print(f"Đã xuất âm thanh: {audio_file}")


if __name__ == "__main__":
    video_url = ""

    video_file = "video_temp.mp4"
    audio_file = "output.mp3"

    download_video_r2(video_url, video_file)
    extract_audio(video_file, audio_file)

    # Xóa file video tạm nếu muốn
    os.remove(video_file)
