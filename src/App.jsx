import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import ffmpegWorkerUrl from "@ffmpeg/ffmpeg/worker?worker&url";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const ENGINE_LOAD_TIMEOUT = 45000;

const PRESETS = {
  smallest: {
    label: "最小体积",
    description: "默认最低质量，适合语音、预览和快速分享。",
    bitrate: "64k",
    quality: 9,
    channels: 1,
    sampleRate: 22050,
  },
  balanced: {
    label: "平衡模式",
    description: "兼顾体积与清晰度，适合日常音频。",
    bitrate: "128k",
    quality: 5,
    channels: 2,
    sampleRate: 44100,
  },
  high: {
    label: "高质量",
    description: "更高比特率，适合音乐和归档。",
    bitrate: "256k",
    quality: 1,
    channels: 2,
    sampleRate: 48000,
  },
};

const BITRATES = ["64k", "96k", "128k", "192k", "256k", "320k"];
const SAMPLE_RATES = [22050, 32000, 44100, 48000];

function formatFileSize(size) {
  if (!size) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getOutputName(file) {
  const baseName = file?.name?.replace(/\.[^.]+$/, "") || "converted";
  return `${baseName}.mp3`;
}

async function toTimedBlobURL(url, mimeType) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ENGINE_LOAD_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`资源加载失败: ${response.status} ${url}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(new Blob([blob], { type: mimeType }));
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function App() {
  const ffmpegRef = useRef(null);
  const enginePromiseRef = useRef(null);
  const outputUrlRef = useRef(null);
  const [engineStatus, setEngineStatus] = useState("idle");
  const [engineMessage, setEngineMessage] = useState("等待检测浏览器 FFmpeg 引擎");
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState("smallest");
  const [settings, setSettings] = useState(PRESETS.smallest);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState([]);
  const [download, setDownload] = useState(null);
  const [error, setError] = useState("");

  const wasmSupported = useMemo(() => typeof WebAssembly === "object", []);
  const canConvert = file && wasmSupported && !isConverting;
  const isEngineLoading = engineStatus === "loading";
  const engineLabel = isEngineLoading ? "加载中" : engineStatus === "ready" ? "已就绪" : "待加载";
  const convertButtonText =
    isConverting && isEngineLoading
      ? "正在加载转换引擎..."
      : isConverting
        ? "正在转换..."
        : isEngineLoading
          ? "正在加载转换引擎..."
          : "开始转换为 MP3";

  function loadEngine() {
    setError("");

    if (!wasmSupported) {
      setEngineStatus("error");
      setEngineMessage("当前浏览器不支持 WebAssembly，无法加载 FFmpeg 引擎。");
      return null;
    }

    if (ffmpegRef.current) {
      setEngineStatus("ready");
      setEngineMessage("浏览器 FFmpeg 引擎已就绪");
      return ffmpegRef.current;
    }

    if (enginePromiseRef.current) {
      return enginePromiseRef.current;
    }

    enginePromiseRef.current = (async () => {
      try {
        setEngineStatus("loading");
        setEngineMessage("正在预热 FFmpeg WebAssembly 核心，首次加载会下载并编译引擎...");

        const ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ message }) => {
          if (message) {
            setLogLines((lines) => [message, ...lines].slice(0, 5));
          }
        });
        ffmpeg.on("progress", ({ progress: ratio }) => {
          if (Number.isFinite(ratio)) {
            setProgress(Math.max(0, Math.min(100, Math.round(ratio * 100))));
          }
        });

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), ENGINE_LOAD_TIMEOUT);
        const classWorkerURL = new URL(ffmpegWorkerUrl, window.location.href).href;
        const coreURL = await toTimedBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await toTimedBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm");

        console.info("[ffmpeg] 开始加载 WebAssembly 引擎", {
          classWorkerURL,
          coreSource: `${CORE_BASE_URL}/ffmpeg-core.js`,
        });

        await ffmpeg.load({
          classWorkerURL,
          coreURL,
          wasmURL,
        }, { signal: controller.signal });
        window.clearTimeout(timeoutId);

        ffmpegRef.current = ffmpeg;
        setEngineStatus("ready");
        setEngineMessage("浏览器 FFmpeg 引擎已就绪，转换会在本机浏览器内完成。");
        return ffmpeg;
      } catch (loadError) {
        console.warn("[ffmpeg] WebAssembly 加载失败", {
          name: loadError?.name,
          message: loadError?.message || String(loadError),
          workerUrl: ffmpegWorkerUrl,
          coreBaseURL: CORE_BASE_URL,
          error: loadError,
        });
        ffmpegRef.current?.terminate();
        ffmpegRef.current = null;
        enginePromiseRef.current = null;
        setEngineStatus("error");
        setEngineMessage("FFmpeg 引擎加载失败，请检查网络、浏览器版本或点击检测按钮重试。");
        setError(
          loadError?.name === "AbortError"
            ? "FFmpeg 引擎加载超时，请检查 CDN 网络连接后重试。"
            : loadError?.message || String(loadError) || "FFmpeg 引擎加载失败"
        );
        return null;
      }
    })();

    return enginePromiseRef.current;
  }

  useEffect(() => {
    if (!wasmSupported || ffmpegRef.current || enginePromiseRef.current) {
      return undefined;
    }

    const warmup = () => {
      loadEngine();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmup, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(warmup, 400);
    return () => window.clearTimeout(timer);
  }, [wasmSupported]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    setError("");
    setDownload(null);
    setProgress(0);
    setLogLines([]);

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".wav")) {
      setFile(null);
      setError("请选择 WAV 格式的音频文件。");
      return;
    }

    setFile(selectedFile);
    loadEngine();
  }

  function handlePresetChange(nextPreset) {
    setPreset(nextPreset);
    if (nextPreset !== "custom") {
      setSettings(PRESETS[nextPreset]);
    }
  }

  function updateSetting(key, value) {
    setPreset("custom");
    setSettings((current) => ({
      ...current,
      [key]: key === "bitrate" ? value : Number(value),
    }));
  }

  async function convertFile() {
    if (!file) {
      setError("请先选择一个 WAV 文件。");
      return;
    }

    setIsConverting(true);
    setError("");
    setDownload(null);
    setProgress(0);
    setLogLines([]);

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    const inputName = "input.wav";
    const outputName = "output.mp3";

    try {
      const ffmpeg = await loadEngine();
      if (!ffmpeg) {
        return;
      }

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-y",
        "-i",
        inputName,
        "-codec:a",
        "libmp3lame",
        "-b:a",
        settings.bitrate,
        "-q:a",
        String(settings.quality),
        "-ac",
        String(settings.channels),
        "-ar",
        String(settings.sampleRate),
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      setDownload({
        url,
        name: getOutputName(file),
        size: blob.size,
      });
      setProgress(100);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (convertError) {
      console.warn("WAV 转 MP3 失败", convertError);
      setError(convertError.message || "转换失败，请更换文件或降低输入文件大小后重试。");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Browser FFmpeg Converter</span>
          <h1>WAV 转 MP3，直接在浏览器完成</h1>
          <p>
            默认采用最低质量、最小体积的转换方式，也可以切换到平衡或高质量模式。
            文件不会上传服务器，转换过程运行在你的浏览器里。
          </p>
          <div className="hero-actions">
            <label className="primary-upload">
              选择 WAV 文件
              <input type="file" accept=".wav,audio/wav,audio/x-wav" onChange={handleFileChange} />
            </label>
            <button className="ghost-button" type="button" onClick={loadEngine} disabled={engineStatus === "loading"}>
              {engineStatus === "loading" ? "检测中..." : "检测 FFmpeg 引擎"}
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className={`status-dot ${engineStatus}`} />
          <span>FFmpeg 检测</span>
          <strong>{engineMessage}</strong>
          <small>
            GitHub Pages 无法读取本机 PATH，本页面检测的是浏览器内置 WebAssembly 能力与
            FFmpeg WebAssembly 引擎加载状态。
          </small>
        </div>
      </section>

      <section className="workspace">
        <div className="panel file-panel">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>音频文件</h2>
              <p>选择一个 WAV 文件后开始转换，建议先使用 200MB 以内文件测试。</p>
            </div>
          </div>

          <label className={`drop-zone ${file ? "has-file" : ""}`}>
            <input type="file" accept=".wav,audio/wav,audio/x-wav" onChange={handleFileChange} />
            <span>{file ? "已选择文件" : "点击选择 WAV 文件"}</span>
            <strong>{file ? file.name : "支持 .wav 文件"}</strong>
            <small>{file ? formatFileSize(file.size) : "转换在本机浏览器内运行，不上传音频。"}</small>
          </label>

          <div className="engine-grid">
            <div>
              <span>WebAssembly</span>
              <strong>{wasmSupported ? "支持" : "不支持"}</strong>
            </div>
            <div>
              <span>转换引擎</span>
              <strong>{engineLabel}</strong>
            </div>
          </div>
        </div>

        <div className="panel settings-panel">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>转换质量</h2>
              <p>默认最低质量；质量数字越大，压缩越明显，文件通常越小。</p>
            </div>
          </div>

          <div className="preset-grid">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                className={`preset-card ${preset === key ? "active" : ""}`}
                key={key}
                type="button"
                onClick={() => handlePresetChange(key)}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              比特率
              <select value={settings.bitrate} onChange={(event) => updateSetting("bitrate", event.target.value)}>
                {BITRATES.map((bitrate) => (
                  <option key={bitrate} value={bitrate}>
                    {bitrate}
                  </option>
                ))}
              </select>
            </label>
            <label>
              质量等级
              <input
                min="0"
                max="9"
                type="range"
                value={settings.quality}
                onChange={(event) => updateSetting("quality", event.target.value)}
              />
              <small>{settings.quality} / 9，9 为最低质量</small>
            </label>
            <label>
              声道数
              <select value={settings.channels} onChange={(event) => updateSetting("channels", event.target.value)}>
                <option value="1">单声道</option>
                <option value="2">立体声</option>
              </select>
            </label>
            <label>
              采样率
              <select value={settings.sampleRate} onChange={(event) => updateSetting("sampleRate", event.target.value)}>
                {SAMPLE_RATES.map((sampleRate) => (
                  <option key={sampleRate} value={sampleRate}>
                    {sampleRate} Hz
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="convert-button" type="button" onClick={convertFile} disabled={!canConvert}>
            {convertButtonText}
          </button>
        </div>
      </section>

      <section className="panel result-panel">
        <div className="section-heading">
          <span>03</span>
          <div>
            <h2>转换结果</h2>
            <p>转换完成后会生成 MP3 下载链接。</p>
          </div>
        </div>

        <div className="progress-track" aria-label="转换进度">
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span>{isConverting ? "转换进行中" : "当前进度"}</span>
          <strong>{progress}%</strong>
        </div>

        {error && <div className="alert error">{error}</div>}

        {download && (
          <div className="download-card">
            <div>
              <span>转换完成</span>
              <strong>{download.name}</strong>
              <small>{formatFileSize(download.size)}</small>
            </div>
            <a className="download-button" href={download.url} download={download.name}>
              下载 MP3
            </a>
          </div>
        )}

        {logLines.length > 0 && (
          <div className="log-box">
            {logLines.map((line, index) => (
              <code key={`${line}-${index}`}>{line}</code>
            ))}
          </div>
        )}
      </section>

      <section className="info-strip">
        <div>
          <strong>GitHub Pages 友好</strong>
          <span>纯静态构建，无需服务器。</span>
        </div>
        <div>
          <strong>本地浏览器转换</strong>
          <span>音频文件不上传。</span>
        </div>
        <div>
          <strong>CLI 仍可使用</strong>
          <span>保留 Node.js + FFmpeg 命令行能力。</span>
        </div>
      </section>
    </main>
  );
}
