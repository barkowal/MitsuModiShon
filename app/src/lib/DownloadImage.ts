export function DownloadImage(data: string, filename: string = "render") {
  const href = data;

  const link = document.createElement("a");
  link.href = data;
  link.download = filename + ".png";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
