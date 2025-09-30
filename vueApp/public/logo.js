// https://www.design.com/maker/logo/246d163f-91da-4bf8-9e6e-3bb3784670e4/draft/4ea26d3b-d43a-4721-b1ab-23c343eeab4d?savedDraft=True

function downloadCanvasAsImage() {
  var canvas = document.getElementById("js-maker-canvas");
  canvas.toBlob(
    function (blob) {
      // 创建一个临时的URL指向这个blob对象
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "canvas-image.png"; // 设置下载文件名
      a.click();
      // 释放URL对象
      URL.revokeObjectURL(url);
    },
    "image/png",
    1.0
  );
}

downloadCanvasAsImage();
