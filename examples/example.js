const WavToMp3Converter = require("../toMp3");

async function example() {
  const converter = new WavToMp3Converter();

  try {
    // 转换单个文件
    await converter.convertFile("./input.wav", "./output.mp3", {
      bitrate: "64k",
      quality: 9,
    });
    console.log("✅ 转换完成!");
  } catch (error) {
    console.error("❌ 转换失败:", error.message);
  }
}

example();
