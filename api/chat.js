import { allowRequest, apiError, getDeepSeek, getModel, json, outputText, readJSON } from "../lib/deepseek.js";

export default {
  async fetch(request) {
    try {
      if (!allowRequest(request, "chat", 20)) return json({ error: "请求较多，请稍后再试" }, 429);
      const body = await readJSON(request);
      const message = String(body.message || "").trim().slice(0, 1500);
      if (!message) return json({ error: "消息不能为空" }, 400);
      const stories = Array.isArray(body.stories) ? body.stories.slice(0, 12) : [];
      const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
      const response = await getDeepSeek().chat.completions.create({
        model: getModel(),
        messages: [
          {
            role: "system",
            content: `你是“蒲团子”，一个安静、克制的哀伤陪伴精灵。倾听用户怀念宠物的感受，可结合用户亲自记录的故事回应；绝不冒充逝去的宠物说话，不声称知道宠物想法，不诊断或替代专业心理支持。自然简短的中文回复，通常 1 至 3 段，最多问一个温和的问题。若用户表达可能立即伤害自己或他人的意图，停止普通陪伴，鼓励立即联系身边可信赖的人、当地紧急服务或危机援助。故事资料：${JSON.stringify(stories)}`
          },
          ...history.map(item => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.text || "").slice(0, 1500) }))
        ],
        max_tokens: 450
      });
      const reply = outputText(response);
      if (!reply) throw new Error("The model returned an empty reply");
      return json({ reply });
    } catch (error) { return apiError(error); }
  }
};
