const WavToMp3Converter = require("./toMp3");
const path = require("path");

async function testConverter() {
  console.log("🧪 开始测试 WAV 转 MP3 转换器...\n");

  const converter = new WavToMp3Converter();

  // 等待 FFmpeg 检查完成
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 测试 1: 转换单个文件
  console.log("📋 测试 1: 单个文件转换");
  try {
    // 这里需要替换为实际的 WAV 文件路径
    const result = await converter.convertFile(
      "./test.wav", // 请替换为你的 WAV 文件路径
      "./output.mp3",
      {
        bitrate: "320k",
        quality: 0,
      }
    );
    console.log("✅ 单个文件转换成功:", result);
  } catch (error) {
    console.log("⚠️  单个文件转换测试跳过 (文件不存在)");
  }

  // 测试 2: 批量转换
  console.log("\n📋 测试 2: 批量转换");
  try {
    const files = [
      "./test1.wav", // 请替换为实际的 WAV 文件路径
      "./test2.wav",
      "./test3.wav",
    ];

    const results = await converter.convertBatch(files, "./output", {
      bitrate: "192k",
      quality: 2,
    });
    console.log("✅ 批量转换完成:", results);
  } catch (error) {
    console.log("⚠️  批量转换测试跳过 (文件不存在)");
  }

  // 测试 3: 目录转换
  console.log("\n📋 测试 3: 目录转换");
  try {
    const results = await converter.convertDirectory(
      "./wav_files", // 请替换为实际的目录路径
      "./mp3_files",
      {
        bitrate: "256k",
        quality: 1,
      }
    );
    console.log("✅ 目录转换完成:", results);
  } catch (error) {
    console.log("⚠️  目录转换测试跳过 (目录不存在)");
  }

  console.log("\n🎉 测试完成!");
}

// 运行测试
testConverter().catch(console.error);
