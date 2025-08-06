#!/usr/bin/env node

const WavToMp3Converter = require("./toMp3");
const path = require("path");
const fs = require("fs");

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: null,
    bitrate: "192k",
    quality: 0,
    channels: 2,
    sampleRate: 44100,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-i":
      case "--input":
        options.input = args[++i];
        break;
      case "-o":
      case "--output":
        options.output = args[++i];
        break;
      case "-b":
      case "--bitrate":
        options.bitrate = args[++i];
        break;
      case "-q":
      case "--quality":
        options.quality = parseInt(args[++i]);
        break;
      case "-c":
      case "--channels":
        options.channels = parseInt(args[++i]);
        break;
      case "-s":
      case "--sample-rate":
        options.sampleRate = parseInt(args[++i]);
        break;
      default:
        if (!options.input) {
          options.input = arg;
        } else if (!options.output) {
          options.output = arg;
        }
    }
  }

  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
🎵 WAV 转 MP3 转换器 - 命令行工具

用法:
  node cli.js <输入文件> [输出文件] [选项]
  node cli.js -i <输入文件> -o <输出文件> [选项]

参数:
  <输入文件>              输入的 WAV 文件路径
  [输出文件]              输出的 MP3 文件路径 (可选)

选项:
  -i, --input <文件>       指定输入文件
  -o, --output <文件>      指定输出文件
  -b, --bitrate <比特率>   设置比特率 (默认: 192k)
  -q, --quality <质量>     设置质量 0-9 (默认: 0, 最高质量)
  -c, --channels <声道>    设置声道数 1-2 (默认: 2)
  -s, --sample-rate <采样率> 设置采样率 (默认: 44100)
  -h, --help              显示此帮助信息

示例:
  # 基本转换
  node cli.js input.wav output.mp3

  # 高质量转换
  node cli.js -i input.wav -o output.mp3 -b 320k -q 0

  # 压缩优化
  node cli.js input.wav -b 128k -q 5

  # 批量转换目录
  node cli.js ./wav_folder ./mp3_folder

比特率选项:
  128k  - 标准质量
  192k  - 高质量 (默认)
  256k  - 更高质量
  320k  - 最高质量

质量等级:
  0     - 最高质量 (默认)
  1-3   - 高质量
  4-6   - 中等质量
  7-9   - 低质量
`);
}

// 主函数
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  if (!options.input) {
    console.error("❌ 错误: 请指定输入文件");
    console.log("使用 --help 查看帮助信息");
    process.exit(1);
  }

  const converter = new WavToMp3Converter();

  try {
    // 检查输入路径
    const inputPath = path.resolve(options.input);

    if (!fs.existsSync(inputPath)) {
      console.error(`❌ 错误: 输入文件不存在: ${inputPath}`);
      process.exit(1);
    }

    const stats = fs.statSync(inputPath);

    if (stats.isDirectory()) {
      // 转换整个目录
      console.log(`📁 转换目录: ${inputPath}`);
      const outputDir = options.output || path.join(path.dirname(inputPath), "mp3_output");

      const results = await converter.convertDirectory(inputPath, outputDir, {
        bitrate: options.bitrate,
        quality: options.quality,
        channels: options.channels,
        sampleRate: options.sampleRate,
      });

      console.log(`\n🎉 目录转换完成! 成功转换 ${results.filter((r) => r !== null).length} 个文件`);
    } else {
      // 转换单个文件
      const outputPath =
        options.output ||
        path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + ".mp3");

      console.log(`🔄 开始转换: ${path.basename(inputPath)}`);
      console.log(`📁 输出文件: ${outputPath}`);
      console.log(
        `⚙️  设置: 比特率=${options.bitrate}, 质量=${options.quality}, 声道=${options.channels}, 采样率=${options.sampleRate}`
      );

      const result = await converter.convertFile(inputPath, outputPath, {
        bitrate: options.bitrate,
        quality: options.quality,
        channels: options.channels,
        sampleRate: options.sampleRate,
      });

      console.log(`\n✅ 转换成功: ${result}`);
    }
  } catch (error) {
    console.error("❌ 转换失败:", error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ 程序错误:", error.message);
    process.exit(1);
  });
}

module.exports = { parseArgs, showHelp };
