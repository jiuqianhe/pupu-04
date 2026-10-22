import { allowRequest, apiError, getDeepSeek, getModel, json, outputJSON, readJSON } from "../lib/deepseek.js";

export default {
  async fetch(request) {
    try {
      if (!allowRequest(request, "arrange", 10)) return json({ error: "请求较多，请稍后再试" }, 429);
      const body = await readJSON(request);
      const text = String(body.text || "").slice(0, 5000);
      const images = Array.isArray(body.images) ? body.images.filter(value => /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value)).slice(0, 2) : [];
      const content = [{
        type: "text",
        text: `请把这份告别记录整理为可直接展示的中文文本。事件标题：${String(body.eventTitle || "告别记录").slice(0, 120)}。用户原文：${text || "（用户没有填写文字，请仅根据图片做克制描述，不猜测身份、地点或关系。）"}。识别图片中可见的信息，保留用户语气与事实，不虚构图片外信息，不让宠物拟人化发言。请只返回 JSON 对象：{"arrangedRecord":"...","layoutChoice":"reference 或 photo-first 或 text-first","imageCaptions":["..."]}。`
      }, ...images.map(url => ({ type: "image_url", image_url: { url, detail: "low" } }))];
      const response = await getDeepSeek().chat.completions.create({
        model: getModel(),
        messages: [{ role: "user", content }],
        response_format: { type: "json_object" },
        max_tokens: 1100
      });
      const result = outputJSON(response);
      if (!["reference", "photo-first", "text-first"].includes(result.layoutChoice)) result.layoutChoice = "text-first";
      return json(result);
    } catch (error) { return apiError(error); }
  }
};
