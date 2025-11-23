import requests
import subprocess
import os
 # [
 #        'AIzaSyB20kFF1Gk0QaJ2Fp2Cbol3mxJDTAVH3wg',
 #        'AIzaSyD8aLRL3OESOA1jILadzAowxTB2gkYelDI',
 #        "AIzaSyCvHRoH7oHsJa8J2D4kZIOJ5qxG4ZNHXm0",
 #        "AIzaSyDX9zdJZ_gjtzsMJVmXpydlWhhLBJqQrEU",
 #        "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
 #        "AIzaSyBQ3qm1lKfXV5cU1iSkRtZMCth-hX3pQFk",
 #        "AIzaSyAbV964qC-RA_IM8Ahop0sXzJr2JxF1z6c",
 #        'AIzaSyDNmkp0npHbiH66BAao_gEn4lOR8JusaDs',
 #        'AIzaSyCY3jy3dbfsPaAODkWG9TuJPO1_Zx5YUzs',
 #        'AIzaSyC7h06DcW0p4sPYpeuJ7IRVGAgrX35NG2I',
 #        'AIzaSyCv6jdoUC3YslqkNj42YNZEhjtWmbBkYEM',
 #        "AIzaSyDI2qwZTK72gQfGRhEqfUSPebTnwigxLr4",
 #        "AIzaSyBm4rDY29N4R-U20-hBJ4tA45wxg2z9Lv4",
 #        "AIzaSyDPkKH6qBKtSWkK5ehS0lSphoAkS4pHfmo",
 #        "AIzaSyCqLl6G7nzuh9iPIvOrmPdCJqrFw0y0vnk",
 #        "AIzaSyCitJXSJ9G7mAIA1-oMVh-_rSjmbShjU08",
 #        "AIzaSyDxWOF9rW-f8lX3U5lK-WTg9bChnsM0ig4",
 #        "AIzaSyDr7ZjjcUP4wHkjXt3LZsrUdgPaLW0T6dc",
 #        "AIzaSyCE58-h4E5Sp2GijN4XnLN4DkKDVquzpOo",
 #        "AIzaSyCGa9gOdKkz4QJ5Tr7Vabobh4hrr0y1xFk",
 #        "AIzaSyCOXHD0afikC6z8Jm6r6wkBXszC9eKC_ic",
 #        "AIzaSyBu6dCYz1z-aQ8l5vLd1r55GHxc9-toecc",
 #        "AIzaSyAoSdTiXXROp6tk6jvhzum_cg1X_Wjtp7Y",
 #        "AIzaSyDhxq4_Xzz0vC85P0geecoAAOlECWS9Grg",
 #        "AIzaSyDTkO6p5M9o0dcSS6D8SiudNMUmZoRClv4",
 #        "AIzaSyBOQlJH-cTymUxrGc7b5o2d6LC6mt1azKk",
 #        'AIzaSyCodUmU64wINsUpqstOtom-yVxf_W3TkEk',
 #        'AIzaSyDn463tQhMveGgtqw82s5dUQoF6vuPeDG8',
 #        "AIzaSyBK2VDH3TRBQFDTVO8gWKaznKjvAq3-Cyg",
 #        "AIzaSyCcZqDMBa8FcAdBxqE1o6YYvzlygmpBx14",
 #        "AIzaSyCiJfsrCsbstRhsZDZANLXt6NuvfZxfkoU",
 #        "AIzaSyAQMplJDe4bLfcnHXxlMrhFmGmoK-Ly9Qk",
 #        "AIzaSyCETBi_6UT5zVuu6JvjcuQU4l8IiPHCxxM",
 #        "AIzaSyBPJoPtPj-sZTTAkmOOzdeYtuxqib3UvNg",
 #        "AIzaSyAUyO9moTg00Dk6m4eOU1ILkR_izAuxj_8",
 #        'AIzaSyBDJi9htw2_i1C6-1Z8wM9OGuGFJYkgpyo',
 #        "AIzaSyAggNllQF0N_2iMGJskVFc-FXsCIb1Stlc",
 #        "AIzaSyD6dBGo5WtH6-wD_i50gFnljhe1cC64RwM",
 #        "AIzaSyDvbIMxu6bp9Ixwpa9xXSqPT2e5yldZP7M",
 #        "AIzaSyAv6VA8VBLwWwVY5Q_hsj2iQITyJ_CvBDs",
 #        "AIzaSyDTp1JrJ_p5SP_uJOJFCmiufuC_kz-UvW4",
 #        "AIzaSyD6Q-h3nRkphE3Jwcj0dBj58l2Wxj_qnko",
 #        "AIzaSyCJ6m5jckjG-qynYQd_w9n66L-vUud6t3g",
 #        "AIzaSyBMbNZD6Q_zmzErjpfK_l9Ti7FMtzYAadA",
 #        "AIzaSyB0zdmxHxrPn75LBQVRkyjTKp78OUz4L8M",
 #        "AIzaSyBkWFY-CQB7h6COqvMwgfeSCOQl6SggxA0",
 #        "AIzaSyDwPa9c4zRh0TdEQvzhIts9nrlvLlffZX8",
 #        "AIzaSyD6GHN1RcJlxyBpEOlr3JkE_j7lAvD6aV0",
 #        "AIzaSyB4egABJpjJ-yhZXZg5Tu7NVRPeTOS7fTE",
 #        "AIzaSyAZXsPlu18MC7JZq4YzDbdOdwN2caV5LdQ",
 #        "AIzaSyCYSvelMrwczLgwvYHJKOzqu4pxZoaW8Fk",
 #        "AIzaSyDLl73qSYNQS6LHb3QCqzfPkuhy4ZIHLoQ",
 #        "AIzaSyDgHsfABcItnJu0Vgb-YQK-p7zjFwuDNk0",
 #        "AIzaSyClBDBdbBrP6P8ugqGKuid0qZW82cPF7B8",
 #        "AIzaSyAonOZVggKfRuWsE5gjGrbXwuXBRfSFlWs",
 #        "AIzaSyC43J6YfEHMLHteuehjvwX73OKU9pR1QSU",
 #        "AIzaSyD6GHN1RcJlxyBpEOlr3JkE_j7lAvD6aV0",
 #        "AIzaSyAPtCim4ke9C8SwsY2bXszsQotGfxE-XH4",
 #        "AIzaSyCy7RhBIx5BtuX06WIxoR2daFT_qmOmEw0",
 #        "AIzaSyAL-1EPzs7oAksCNELykmyF5h-xNHykZZ4",
 #        "AIzaSyBAETClT_PMhBZrD7KrGFrEt3hUY07Qxfw",
 #        "AIzaSyBv9GHyMba0gy28ALwa9hpQNWpxAoUyB5g",
 #        "AIzaSyDu1xR2pb0Hz6PFOSodKYpOetNpLxXnlnk",
 #        "AIzaSyA22FnF111OpvUCLxyr3L3tY1hXr0RjrMc",
 #        "AIzaSyDNuTvU_1Q3bS-LXSqFymuEcVpESv6thl8",
 #        "AIzaSyDrzUv_h4UXEO6ktLia-sp6i54s5suN-sQ",
 #        "AIzaSyB_VRWMdouEQe8r6Lf--uSijZfACNGuDfI",
 #        "AIzaSyAC1AY-8PaorKscv_es8wyQmojrGU2RwIY",
 #        "AIzaSyCmjIQK4RoPzvjxxepC3hBiEgTLaMkIe1k",
 #        "AIzaSyA4iMYAQpqqwAup7rG2takDJz-2_gG338M",
 #        "AIzaSyADiuoPIC_LhcTANQavgWdJ5aNsK-C86BE",
 #        "AIzaSyDyXtvUClHo5GL3S8WAJN3tIGOYwEGZ120",
 #    ]
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
