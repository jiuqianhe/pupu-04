import { allowRequest, apiError, getDeepSeek, getModel, json, outputJSON, readJSON } from "../lib/deepseek.js";

const levels = [
  "轻轻观察与回想，不要求处理物品",
  "接触一件熟悉的小物或日常角落",
  "记录一个具体习惯或共同片段",
  "用文字、声音或图像表达想说的话",
  "完成一件温和的纪念或分享行动",
  "进行可撤回、不过度刺激的象征性整理",
  "由主人自主选择告别方式并照顾此刻的自己"
];

export default {
  async fetch(request) {
    try {
      if (!allowRequest(request, "event", 12)) return json({ error: "请求较多，请稍后再试" }, 429);
      const body = await readJSON(request);
      const step = Math.max(1, Math.min(7, Number(body.step) || 1));
      const stories = Array.isArray(body.stories) ? body.stories.slice(0, 12) : [];
      const completedEvents = Array.isArray(body.completedEvents) ? body.completedEvents.slice(0, 7) : [];
      const excludedEvents = Array.isArray(body.excludedEvents) ? body.excludedEvents.slice(0, 10) : [];
      const response = await getDeepSeek().chat.completions.create({
        model: getModel(),
        messages: [
          {
            role: "system",
            content: `你为失去宠物的人设计一件温柔、具体、可完成的告别小事。当前是第 ${step}/7 阶段：${levels[step - 1]}。尊重用户节奏；不要求丢弃重要物品；不冒充逝去的宠物说话；不做医疗诊断；不鼓励危险行为、公开隐私或接触陌生人。结合故事真实细节；故事不足时使用普通但不编造事实的事件。避免与已完成或排除的事件重复。请只返回 JSON 对象：{"title":"...","short":"...","body":"...","after":"..."}。`
          },
          { role: "user", content: JSON.stringify({ step, stories, completedEvents, excludedEvents, replacement: Boolean(body.replacement) }) }
        ],
        response_format: { type: "json_object" },
        max_tokens: 700
      });
      const task = outputJSON(response);
      if (![task.title, task.short, task.body, task.after].every(value => typeof value === "string" && value.trim())) throw new Error("The model returned an incomplete event");
      return json({ task });
    } catch (error) { return apiError(error); }
  }
};
