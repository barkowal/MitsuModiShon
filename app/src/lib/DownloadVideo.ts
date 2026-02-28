import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export const DownloadVideo = async (frames: Array<string>) => {
  const ffmpeg = new FFmpeg();

  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  for (let i = 0; i < frames.length; i++) {
    const imageBlob = await fetchFile(frames[i]);
    await ffmpeg.writeFile(`${i}.png`, imageBlob);
  }

  await ffmpeg.exec(["-framerate", "24", "-i", "%d.png", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-f", "mp4", "output.mp4"]);

  const data = await ffmpeg.readFile("output.mp4");

  const videoUrl = URL.createObjectURL(new Blob([data], { type: "video/mp4" }));

  const a = document.createElement("a");
  a.href = videoUrl;
  a.download = "output.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  ffmpeg.terminate();
};
