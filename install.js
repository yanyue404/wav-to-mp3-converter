#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 WAV 转 MP3 转换器 - 安装脚本\n");

// 检查 Node.js 版本
function checkNodeVersion() {
  console.log("📋 检查 Node.js 版本...");
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split(".")[0]);

    if (major >= 14) {
      console.log(`✅ Node.js 版本: ${version} (符合要求)`);
      return true;
    } else {
      console.log(`❌ Node.js 版本过低: ${version} (需要 14.0.0 或更高)`);
      return false;
    }
  } catch (error) {
    console.log("❌ 无法检查 Node.js 版本");
    return false;
  }
}

// 检查 FFmpeg
function checkFfmpeg() {
  console.log("\n📋 检查 FFmpeg...");
  try {
    const output = execSync("ffmpeg -version", { encoding: "utf8" });
    const version = output.split("\n")[0];
    console.log(`✅ FFmpeg 已安装: ${version}`);
    return true;
  } catch (error) {
    console.log("❌ FFmpeg 未安装或不在 PATH 中");
    console.log("\n📥 请安装 FFmpeg:");
    console.log("Windows: https://ffmpeg.org/download.html");
    console.log("macOS: brew install ffmpeg");
    console.log("Linux: sudo apt install ffmpeg");
    return false;
  }
}

// 安装 npm 依赖
function installDependencies() {
  console.log("\n📋 安装 npm 依赖...");
  try {
    if (fs.existsSync("package.json")) {
      console.log("📦 运行 npm install...");
      execSync("npm install", { stdio: "inherit" });
      console.log("✅ npm 依赖安装完成");
      return true;
    } else {
      console.log("❌ package.json 文件不存在");
      return false;
    }
  } catch (error) {
    console.log("❌ npm 依赖安装失败:", error.message);
    return false;
  }
}

// 测试转换器
function testConverter() {
  console.log("\n📋 测试转换器...");
  try {
    const WavToMp3Converter = require("./toMp3");
    const converter = new WavToMp3Converter();
    console.log("✅ 转换器加载成功");
    return true;
  } catch (error) {
    console.log("❌ 转换器测试失败:", error.message);
    return false;
  }
}

// 创建示例文件
function createExampleFiles() {
  console.log("\n📋 创建示例文件...");

  const exampleDir = "./examples";
  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir, { recursive: true });
  }

  // 创建示例脚本
  const exampleScript = `const WavToMp3Converter = require('../toMp3');

async function example() {
  const converter = new WavToMp3Converter();
  
  try {
    // 转换单个文件
    await converter.convertFile('./input.wav', './output.mp3', {
      bitrate: '320k',
      quality: 0
    });
    console.log('✅ 转换完成!');
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
  }
}

example();
`;

  fs.writeFileSync(path.join(exampleDir, "example.js"), exampleScript);
  console.log("✅ 示例文件已创建: ./examples/example.js");
}

// 显示使用说明
function showUsage() {
  console.log("\n🎉 安装完成! 使用说明:\n");

  console.log("📝 编程方式使用:");
  console.log('  const WavToMp3Converter = require("./toMp3");');
  console.log("  const converter = new WavToMp3Converter();");
  console.log('  await converter.convertFile("input.wav", "output.mp3");\n');

  console.log("💻 命令行使用:");
  console.log("  node cli.js input.wav output.mp3");
  console.log("  node cli.js --help  # 查看帮助\n");

  console.log("📁 批量转换:");
  console.log("  node cli.js ./wav_folder ./mp3_folder\n");

  console.log("🧪 运行测试:");
  console.log("  npm test\n");

  console.log("📖 更多信息请查看 README.md");
}

// 主安装流程
async function main() {
  console.log("🚀 开始安装 WAV 转 MP3 转换器...\n");

  const checks = [
    { name: "Node.js 版本", fn: checkNodeVersion },
    { name: "FFmpeg", fn: checkFfmpeg },
    { name: "npm 依赖", fn: installDependencies },
    { name: "转换器测试", fn: testConverter },
  ];

  let allPassed = true;

  for (const check of checks) {
    if (!check.fn()) {
      allPassed = false;
      console.log(`\n⚠️  ${check.name} 检查失败，请手动解决后重新运行安装脚本`);
    }
  }

  if (allPassed) {
    createExampleFiles();
    showUsage();
  } else {
    console.log("\n❌ 安装未完成，请解决上述问题后重新运行");
    process.exit(1);
  }
}

// 运行安装
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ 安装过程出错:", error.message);
    process.exit(1);
  });
}

module.exports = {
  checkNodeVersion,
  checkFfmpeg,
  installDependencies,
  testConverter,
};
