# 告别蒲蒲｜DeepSeek 课堂展示版

这是可直接部署到 GitHub + Vercel 的课堂展示项目。视觉页面仍为原始单文件界面；静态图片、CSS、脚本和私人小岛都已内嵌到 `index.html`，因此不会因为 Vercel 路径、中文目录或缺少资源文件夹而丢图。

## 展示版行为

- 每次刷新或重新打开都会清空本地故事、告别进度、媒体和聊天。
- 当前页面会话内，栖所故事会作为生成递进告别事件的上下文。
- 图文整理最多临时发送两张由浏览器压缩的图片；本项目不会保存这些图片。
- AI 接口失败时自动使用原有本地事件、排版和对话，不中断课堂演示。

## 摇晃抽取

- 手机：在风原首页实体摇晃设备即可抽取；iPhone/iPad 首次使用前需要先轻触页面一次并同意“动作与方向”权限。
- 电脑：在风原首页用鼠标或触控板快速左右来回晃动即可抽取。
- 若电脑浏览器能提供设备运动传感器，也会同时响应实体摇晃。
- 页面上的抽取按钮仍然保留，作为权限未开启或设备不支持传感器时的辅助入口。
- 每次触发后立即停止监听并进入任务流程，不会因为同一次晃动重复抽取。

## 部署到 Vercel

1. 在 GitHub 创建空仓库，将本目录所有文件上传到仓库根目录。
2. 在 Vercel 选择 **New Project**，导入该仓库。
3. Framework Preset 选择 **Other**；Build Command、Output Directory、Install Command 都留空。
4. 在 Vercel 项目的 **Settings → Environment Variables** 添加以下变量，并选择 Production、Preview、Development：

   | Key | Value |
   | --- | --- |
   | `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |
   | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |
   | `DEEPSEEK_MODEL` | `deepseek-flash` |

5. 保存变量后执行 **Redeploy**，再打开新的 Vercel 链接测试。

不要将真实 API Key 写进 `index.html`、`.env.example` 或 GitHub 仓库。

## 本地测试

复制 `.env.example` 为 `.env.local` 并填入自己的测试 Key，然后运行：

```bash
npm install
npm run dev
```

请使用 `vercel dev` 提供的 `http://localhost:3000` 地址测试 AI 接口。直接双击 `index.html` 时，视觉页面可打开，但没有 `/api` 服务，因此会自动使用本地备用内容。

## 上线检查

- 用手机打开 Vercel 的 HTTPS 地址，确认首页、栖所、记录和私人小岛图片正常。
- 首次点击“摇动蒲公英抽取事件”以触发 iPhone 运动权限，再测试摇晃。
- 分别测试 AI 告别事件、含图片的记录整理和精灵对话。
- 若出现本地备用提示，在 Vercel 的 Runtime Logs 中检查环境变量是否已保存到当前部署，并确认已重新部署。
