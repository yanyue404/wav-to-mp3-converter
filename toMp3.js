const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

/**
 * WAV 文件转 MP3 的快速转换器
 */
class WavToMp3Converter {
  constructor() {
    // 检查 ffmpeg 是否可用
    this.checkFfmpeg()
  }

  /**
   * 检查 ffmpeg 是否已安装
   */
  checkFfmpeg() {
    ffmpeg.getAvailableCodecs((err, codecs) => {
      if (err) {
        console.error('❌ FFmpeg 未安装或不可用，请先安装 FFmpeg')
        console.log('安装指南: https://ffmpeg.org/download.html')
        process.exit(1)
      }
      console.log('✅ FFmpeg 已就绪')
    })
  }

  /**
   * 转换单个 WAV 文件为 MP3
   * @param {string} inputPath - 输入的 WAV 文件路径
   * @param {string} outputPath - 输出的 MP3 文件路径（可选）
   * @param {Object} options - 转换选项
   * @returns {Promise<string>} 返回输出文件路径
   */
  async convertFile(inputPath, outputPath = null, options = {}) {
    return new Promise((resolve, reject) => {
      // 验证输入文件
      if (!fs.existsSync(inputPath)) {
        reject(new Error(`输入文件不存在: ${inputPath}`))
        return
      }

      // 如果没有指定输出路径，自动生成
      if (!outputPath) {
        const inputDir = path.dirname(inputPath)
        const inputName = path.basename(inputPath, path.extname(inputPath))
        outputPath = path.join(inputDir, `${inputName}.mp3`)
      }

      // 默认转换选项
      const defaultOptions = {
        bitrate: '192k', // MP3 比特率
        channels: 2, // 声道数
        sampleRate: 44100, // 采样率
        quality: 0, // 质量 (0-9, 0 为最高质量)
      }

      const finalOptions = { ...defaultOptions, ...options }

      console.log(`🔄 开始转换: ${path.basename(inputPath)}`)
      console.log(`📁 输出文件: ${outputPath}`)

      const startTime = Date.now()

      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate(finalOptions.bitrate)
        .audioChannels(finalOptions.channels)
        .audioFrequency(finalOptions.sampleRate)
        .audioQuality(finalOptions.quality)
        .on('start', (commandLine) => {
          console.log('🚀 转换命令:', commandLine)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`📊 转换进度: ${progress.percent.toFixed(1)}%`)
          }
        })
        .on('end', () => {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2)
          console.log(`✅ 转换完成! 耗时: ${duration}秒`)
          console.log(`📁 输出文件: ${outputPath}`)
          resolve(outputPath)
        })
        .on('error', (err) => {
          console.error('❌ 转换失败:', err.message)
          reject(err)
        })
        .save(outputPath)
    })
  }

  /**
   * 批量转换 WAV 文件
   * @param {string[]} inputFiles - 输入文件路径数组
   * @param {string} outputDir - 输出目录（可选）
   * @param {Object} options - 转换选项
   * @returns {Promise<string[]>} 返回输出文件路径数组
   */
  async convertBatch(inputFiles, outputDir = null, options = {}) {
    const results = []

    console.log(`🔄 开始批量转换 ${inputFiles.length} 个文件...`)

    for (let i = 0; i < inputFiles.length; i++) {
      const inputFile = inputFiles[i]
      let outputFile = null

      if (outputDir) {
        const fileName = path.basename(inputFile, path.extname(inputFile))
        outputFile = path.join(outputDir, `${fileName}.mp3`)
      }

      try {
        console.log(`\n📁 处理文件 ${i + 1}/${inputFiles.length}: ${path.basename(inputFile)}`)
        const result = await this.convertFile(inputFile, outputFile, options)
        results.push(result)
      } catch (error) {
        console.error(`❌ 文件转换失败: ${inputFile}`, error.message)
        results.push(null)
      }
    }

    const successCount = results.filter((r) => r !== null).length
    console.log(`\n🎉 批量转换完成! 成功: ${successCount}/${inputFiles.length}`)

    return results
  }

  /**
   * 转换目录中的所有 WAV 文件
   * @param {string} inputDir - 输入目录
   * @param {string} outputDir - 输出目录（可选）
   * @param {Object} options - 转换选项
   * @returns {Promise<string[]>} 返回输出文件路径数组
   */
  async convertDirectory(inputDir, outputDir = null, options = {}) {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`输入目录不存在: ${inputDir}`)
    }

    // 查找所有 WAV 文件
    const files = fs
      .readdirSync(inputDir)
      .filter((file) => file.toLowerCase().endsWith('.wav'))
      .map((file) => path.join(inputDir, file))

    if (files.length === 0) {
      console.log('📁 目录中没有找到 WAV 文件')
      return []
    }

    console.log(`📁 找到 ${files.length} 个 WAV 文件`)

    // 如果没有指定输出目录，使用输入目录
    if (!outputDir) {
      outputDir = inputDir
    } else if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    return this.convertBatch(files, outputDir, options)
  }
}

// 使用示例
async function main() {
  const converter = new WavToMp3Converter()

  // 示例 1: 转换单个文件
  try {
    await converter.convertFile('./2023042304_00015.wav', './output.mp3', {
      bitrate: '128k', // 高质量
      quality: 9, // 最高质量
    })
  } catch (error) {
    console.error('单个文件转换失败:', error.message)
  }

  /*   // 示例 2: 批量转换
  try {
    const files = ["./file1.wav", "./file2.wav", "./file3.wav"];
    await converter.convertBatch(files, "./output", {
      bitrate: "192k",
      quality: 2,
    });
  } catch (error) {
    console.error("批量转换失败:", error.message);
  }

  // 示例 3: 转换整个目录
  try {
    await converter.convertDirectory("./wav_files", "./mp3_files", {
      bitrate: "256k",
      quality: 1,
    });
  } catch (error) {
    console.error("目录转换失败:", error.message);
  } */
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error)
}

module.exports = WavToMp3Converter
