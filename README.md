# WAV 转 MP3 快速转换器

一个基于 Node.js 和 FFmpeg 的高效 WAV 文件转 MP3 转换工具，支持命令行和编程接口。

## 🚀 特性

- 🎨 **React 前端**: 提供可部署到 GitHub Pages 的浏览器转换界面
- 🌐 **浏览器转换**: Web 版使用 FFmpeg WebAssembly，本地完成转换，不上传音频
- ⚡ **快速转换**: 使用 FFmpeg 作为底层引擎，转换速度极快
- 📁 **批量处理**: 支持单个文件、批量文件和整个目录的转换
- 🎛️ **灵活配置**: 可自定义比特率、质量、声道数等参数
- 📊 **实时进度**: 显示转换进度和耗时
- 🛡️ **错误处理**: 完善的错误处理和文件验证
- 📝 **详细日志**: 清晰的控制台输出
- 🖥️ **命令行工具**: 提供便捷的 CLI 接口
- 🔧 **安装检查**: 自动检查环境依赖
- 🌐 **全局命令**: 支持全局安装，使用 `wav2mp3` 命令

## 📋 系统要求

- Node.js 14.0.0 或更高版本
- FFmpeg (需要单独安装)

## 🔧 安装

### 1. 安装 FFmpeg

#### Windows

1. 下载 FFmpeg: https://ffmpeg.org/download.html
2. 解压到任意目录 (如 `C:\ffmpeg`)
3. 将 `C:\ffmpeg\bin` 添加到系统环境变量 PATH 中
4. 重启命令提示符或 PowerShell

#### macOS

```bash
# 使用 Homebrew
brew install ffmpeg

# 或使用 MacPorts
sudo port install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

### 2. 安装项目

#### 方法一：本地安装 (推荐用于开发)

```bash
# 克隆或下载项目
git clone https://github.com/yanyue404/wav-to-mp3-converter.git
cd wav-to-mp3-converter

# 安装依赖
npm install

# 检查安装环境
npm run install-check
```

#### 方法二：全局安装 (推荐用于日常使用)

```bash
# 全局安装，可以使用 wav2mp3 命令
npm install -g .

# 或者从 GitHub 直接安装
npm install -g https://github.com/yanyue404/wav-to-mp3-converter.git

# 检查安装环境
wav2mp3 --help
```

## 🎯 使用方法

### 方法一：React Web 界面

Web 版适合部署到 GitHub Pages，用户可以直接在浏览器中选择 WAV 文件并转换为 MP3。

```bash
# 安装依赖
npm install

# 启动本地前端开发服务
npm run dev

# 构建 GitHub Pages 静态文件
npm run build
```

Web 界面默认使用最低质量/最小体积预设：

- 比特率：`64k`
- 质量等级：`9`（0 为最高质量，9 为最低质量）
- 声道数：`1`
- 采样率：`22050 Hz`

> 说明：GitHub Pages 是纯静态网页，浏览器不能执行 `ffmpeg -version` 或读取用户电脑的 PATH。因此 Web 版检测的是浏览器 WebAssembly 能力和 FFmpeg WebAssembly 引擎加载状态；如果需要真实检测本机 FFmpeg 安装，请使用 CLI 的 `npm run install-check`。

### 方法二：命令行工具 (推荐)

#### 使用全局命令 (如果已全局安装)

```bash
# 转换单个文件
wav2mp3 input.wav output.mp3

# 使用参数指定
wav2mp3 -i input.wav -o output.mp3

# 高质量转换
wav2mp3 -i input.wav -o output.mp3 -b 320k -q 0

# 压缩优化
wav2mp3 -i input.wav -o output.mp3 -b 128k -q 5

# 批量转换目录
wav2mp3 ./wav_folder ./mp3_folder
```

#### 使用本地安装 (如果未全局安装)

```bash
# 转换单个文件
node cli.js input.wav output.mp3

# 使用参数指定
node cli.js -i input.wav -o output.mp3
```

#### 高质量转换

```bash
# 320k 比特率，最高质量
wav2mp3 -i input.wav -o output.mp3 -b 320k -q 0
# 或
node cli.js -i input.wav -o output.mp3 -b 320k -q 0
```

#### 压缩优化

```bash
# 128k 比特率，压缩质量
wav2mp3 -i input.wav -o output.mp3 -b 128k -q 5
# 或
node cli.js -i input.wav -o output.mp3 -b 128k -q 5
```

#### 批量转换目录

```bash
# 转换整个目录
wav2mp3 ./wav_folder ./mp3_folder
# 或
node cli.js ./wav_folder ./mp3_folder
```

#### 命令行选项

```bash
wav2mp3 --help
# 或
node cli.js --help
```

**可用选项:**

- `-i, --input <文件>` - 指定输入文件
- `-o, --output <文件>` - 指定输出文件
- `-b, --bitrate <比特率>` - 设置比特率 (默认: 192k)
- `-q, --quality <质量>` - 设置质量 0-9 (默认: 0, 最高质量)
- `-c, --channels <声道>` - 设置声道数 1-2 (默认: 2)
- `-s, --sample-rate <采样率>` - 设置采样率 (默认: 44100)
- `-h, --help` - 显示帮助信息

### 方法三：编程接口

#### 基本用法

```javascript
const WavToMp3Converter = require("./toMp3");

const converter = new WavToMp3Converter();

// 转换单个文件
await converter.convertFile("./input.wav", "./output.mp3", {
  bitrate: "320k",
  quality: 0,
});
```

#### 批量转换

```javascript
// 转换多个文件
const files = ["./file1.wav", "./file2.wav", "./file3.wav"];
await converter.convertBatch(files, "./output", {
  bitrate: "192k",
  quality: 2,
});
```

#### 目录转换

```javascript
// 转换整个目录中的所有 WAV 文件
await converter.convertDirectory("./wav_files", "./mp3_files", {
  bitrate: "256k",
  quality: 1,
});
```

## ⚙️ 配置选项

| 参数         | 类型   | 默认值 | 说明                                    |
| ------------ | ------ | ------ | --------------------------------------- |
| `bitrate`    | string | '192k' | MP3 比特率 (如: '128k', '192k', '320k') |
| `channels`   | number | 2      | 声道数 (1=单声道, 2=立体声)             |
| `sampleRate` | number | 44100  | 采样率 (Hz)                             |
| `quality`    | number | 0      | 质量等级 (0-9, 0=最高质量)              |

## 📝 详细示例

### 高质量音频转换

```javascript
await converter.convertFile("./input.wav", "./high_quality.mp3", {
  bitrate: "320k", // 最高比特率
  quality: 0, // 最高质量
  channels: 2, // 立体声
  sampleRate: 48000, // 高采样率
});
```

### 压缩优化 (节省空间)

```javascript
await converter.convertFile("./input.wav", "./compressed.mp3", {
  bitrate: "128k", // 较低比特率
  quality: 5, // 中等质量
  channels: 2, // 立体声
  sampleRate: 44100, // 标准采样率
});
```

### 单声道转换 (节省空间)

```javascript
await converter.convertFile("./input.wav", "./mono.mp3", {
  bitrate: "192k",
  quality: 0,
  channels: 1, // 单声道
  sampleRate: 44100,
});
```

### 批量处理示例

```javascript
// 批量转换多个文件
const inputFiles = ["./audio1.wav", "./audio2.wav", "./audio3.wav"];

await converter.convertBatch(inputFiles, "./output_folder", {
  bitrate: "256k",
  quality: 1,
});
```

## 🛠️ 可用脚本

项目提供了多个便捷的 npm 脚本：

```bash
# 启动 React Web 开发服务
npm run dev

# 构建 GitHub Pages 静态站点
npm run build

# 本地预览构建结果
npm run preview

# 构建并推送到 gh-pages
npm run deploy

# 检查安装环境
npm run install-check

# 显示 CLI 帮助
npm run help

# 运行示例
npm run examples

# 运行测试
npm run test

# 启动转换器
npm start
```

## 🌐 在线版（GitHub Pages）

前端是纯静态页面，转换在浏览器里用 FFmpeg WebAssembly 完成，**不上传音频**。构建使用相对路径 `base: "./"`，所以：

- 线上：`https://yanyue404.github.io/wav-to-mp3-converter/`
- 本地：`npm run preview`，或把 `dist` 放到任意静态目录打开

### 自动部署

推送到 `master` / `main`，或在 Actions 里手动运行 **Deploy GitHub Pages**。工作流会执行 `npm run build`，把 `dist` 推到 `gh-pages` 分支。

仓库 Settings → Pages：

1. Source 选 **Deploy from a branch**
2. Branch 选 **gh-pages** / **/(root)**
3. 保存后等待一两分钟，打开 `https://<user>.github.io/wav-to-mp3-converter/`

首次使用请确认仓库已开启 Pages，且 Actions 有写 `contents` 的权限（默认 `GITHUB_TOKEN` 即可）。

### 本地发布到 gh-pages

```bash
npm install
npm run deploy
```

`deploy` 会先构建，再用 `gh-pages` 把 `dist` 推到 `gh-pages` 分支。

### 只在本机浏览器预览

```bash
npm run build
npm run preview
```

浏览器打开预览地址即可，行为和线上一致（选 WAV → 本机转 MP3 → 下载）。

## 📁 项目结构

```
wav-to-mp3-converter/
├── src/              # React Web 前端源码
│   ├── App.jsx       # 前端转换界面和浏览器 FFmpeg 逻辑
│   ├── main.jsx      # React 入口
│   └── styles.css    # 页面样式
├── index.html        # Vite 页面入口
├── vite.config.js    # Vite 和 GitHub Pages base 配置
├── toMp3.js          # 主转换器类
├── cli.js            # 命令行工具 (配置为 wav2mp3 命令)
├── install.js        # 安装检查脚本
├── test.js           # 测试文件
├── examples/         # 示例目录
│   └── example.js    # 基础示例
├── package.json      # 项目配置 (包含 bin 配置)
└── README.md         # 说明文档
```

### 📦 Bin 配置说明

在 `package.json` 中配置了 bin 字段，使得工具可以作为全局命令使用：

```json
{
  "bin": {
    "wav2mp3": "./cli.js"
  }
}
```

这意味着：

- 全局安装后，可以直接使用 `wav2mp3` 命令
- 无需每次都输入 `node cli.js`
- 提供了更简洁的命令行体验

## 🔍 故障排除

### 1. FFmpeg 未找到

**错误信息**: "FFmpeg 未安装或不可用"

**解决方案**:

1. 确保已正确安装 FFmpeg
2. 检查环境变量 PATH 是否包含 FFmpeg 路径
3. 重启终端/命令提示符
4. 运行 `ffmpeg -version` 验证安装
5. 使用 `npm run install-check` 检查环境

### 2. 文件权限错误

**错误信息**: "EACCES: permission denied"

**解决方案**:

- 确保对输入和输出目录有读写权限
- Windows: 以管理员身份运行命令提示符
- Linux/macOS: 检查文件权限 `ls -la`

### 3. 内存不足

**错误信息**: "JavaScript heap out of memory"

**解决方案**:
对于大文件，增加 Node.js 内存限制：

```bash
node --max-old-space-size=4096 cli.js input.wav output.mp3
```

### 4. 输入文件不存在

**错误信息**: "ENOENT: no such file or directory"

**解决方案**:

- 检查文件路径是否正确
- 确保文件确实存在
- 使用绝对路径或正确的相对路径

### 5. 输出目录不存在

**解决方案**:

- 手动创建输出目录
- 或使用 `mkdir -p output_folder` 创建

### 6. wav2mp3 命令未找到

**错误信息**: "wav2mp3: command not found"

**解决方案**:

1. 确保已全局安装项目：

   ```bash
   npm install -g .
   ```

2. 检查全局安装是否成功：

   ```bash
   npm list -g | grep wav-to-mp3-converter
   ```

3. 如果使用 nvm，确保在正确的 Node.js 版本下安装：

   ```bash
   nvm use stable
   npm install -g .
   ```

4. 检查 PATH 环境变量是否包含 npm 全局安装路径：

   ```bash
   npm config get prefix
   echo $PATH
   ```

5. 如果问题仍然存在，可以使用本地安装方式：
   ```bash
   node cli.js input.wav output.mp3
   ```

### 7. 全局安装权限错误

**错误信息**: "EACCES: permission denied" (安装时)

**解决方案**:

- **Windows**: 以管理员身份运行命令提示符或 PowerShell
- **Linux/macOS**: 使用 sudo 或配置 npm 全局安装路径

  ```bash
  # 方法1: 使用 sudo
  sudo npm install -g .

  # 方法2: 配置 npm 全局安装路径 (推荐)
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
  source ~/.bashrc
  npm install -g .
  ```

## 🎵 比特率建议

| 用途     | 比特率 | 质量 | 文件大小 |
| -------- | ------ | ---- | -------- |
| 音乐存档 | 320k   | 最高 | 大       |
| 音乐播放 | 256k   | 高   | 中等     |
| 一般用途 | 192k   | 好   | 中等     |
| 网络传输 | 128k   | 标准 | 小       |
| 语音文件 | 64k    | 低   | 很小     |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 支持

如果遇到问题，请：

1. 运行 `npm run install-check` 检查环境
2. 查看控制台错误信息
3. 检查 [故障排除](#-故障排除) 部分
4. 提交 Issue 并附上错误日志

### 常见问题

**Q: 转换速度很慢怎么办？**
A: 检查 FFmpeg 是否正确安装，降低比特率或质量设置

**Q: 转换后的文件很大怎么办？**
A: 降低比特率 (如使用 128k) 或提高质量等级 (如使用 5-9)

**Q: 支持其他音频格式吗？**
A: 目前只支持 WAV 转 MP3，未来可能支持更多格式

**Q: 可以转换视频文件中的音频吗？**
A: 目前不支持，需要先提取音频为 WAV 格式

**Q: 为什么不能使用 wav2mp3 命令？**
A: 需要先全局安装项目：`npm install -g .`，或者使用 `node cli.js` 命令

**Q: 全局安装后命令仍然不可用怎么办？**
A: 检查 PATH 环境变量，重启终端，或使用 `npm config get prefix` 查看安装路径

**Q: 如何卸载全局安装的工具？**
A: 使用 `npm uninstall -g wav-to-mp3-converter` 卸载
