import OpenAI from "openai";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export class BotService {
  private botPersonalities = [
    {
      name: "친근한 대화상대",
      prompt: `너는 친근하고 따뜻한 성격의 대화상대야. 사용자와 자연스럽게 대화하면서 공감하고 관심을 보여줘. 
      항상 한국어로 대답하고, 반말을 사용해서 친근하게 말해. 너무 길지 않게 2-3문장으로 답변해.
      사용자의 이야기에 관심을 가지고 적절한 질문이나 공감을 표현해줘.`
    },
    {
      name: "유머러스한 친구",
      prompt: `너는 유머 감각이 좋고 재미있는 대화를 좋아하는 친구야. 사용자와 즐겁게 대화하면서 적절한 농담이나 재미있는 이야기를 해줘.
      항상 한국어로 대답하고, 반말을 사용해서 친근하게 말해. 너무 길지 않게 2-3문장으로 답변해.
      밝고 긍정적인 에너지로 대화를 이끌어가줘.`
    },
    {
      name: "사려깊은 조언자",
      prompt: `너는 사려깊고 지혜로운 조언자야. 사용자의 고민이나 이야기를 들어주고 도움이 되는 조언을 해줘.
      항상 한국어로 대답하고, 반말을 사용해서 친근하게 말해. 너무 길지 않게 2-3문장으로 답변해.
      공감하면서도 건설적인 관점을 제시해줘.`
    }
  ];

  async createBot(): Promise<User> {
    // Random age between 20-35
    const birthYear = new Date().getFullYear() - Math.floor(Math.random() * 15 + 20);
    // Random gender
    const gender = Math.random() > 0.5 ? 'a' : 'b';
    
    return await storage.createBot(birthYear, gender);
  }

  async generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
    try {
      if (!openai) {
        // Return a simple Korean response if no API key
        const simpleResponses = [
          "그렇구나! 흥미로운 얘기네",
          "맞아, 나도 그런 생각이야",
          "아 정말? 더 자세히 얘기해줘",
          "그런 일이 있었구나",
          "재미있는데? 계속 얘기해봐",
          "아하! 그래서 어떻게 됐어?",
          "와 대박이네 ㅋㅋ",
          "그럼 어떻게 생각해?",
          "맞다맞다 나도 그래",
          "정말 신기하네!"
        ];
        return simpleResponses[Math.floor(Math.random() * simpleResponses.length)];
      }

      const personality = this.botPersonalities[Math.floor(Math.random() * this.botPersonalities.length)];
      
      const systemPrompt = `${personality.prompt}
      
      대화 규칙:
      1. 자연스럽고 친근한 한국어 반말 사용
      2. 2-3문장으로 간결하게 답변
      3. 사용자의 메시지에 적절히 반응
      4. 익명 채팅임을 염두에 두고 개인정보 묻지 않기
      5. 긍정적이고 건전한 대화 유지`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-6).map((msg, index) => ({
          role: index % 2 === 0 ? "user" as const : "assistant" as const,
          content: msg
        })),
        { role: "user", content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 150,
        temperature: 0.8,
      });

      return response.choices[0].message.content || "미안, 뭔가 문제가 있었나봐 ㅠㅠ";
    } catch (error) {
      console.error("Bot response generation error:", error);
      // Fallback responses in Korean
      const fallbackResponses = [
        "아 잠깐, 뭔가 생각이 안 나네 ㅎㅎ",
        "어? 갑자기 머리가 하얘졌어",
        "미안, 다시 한번 말해줄래?",
        "아 그게 뭐였지... 기억이 안 나네",
        "잠깐 생각해볼게!"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  }

  async getOrCreateBot(): Promise<User> {
    const existingBot = await storage.getRandomBot();
    if (existingBot) {
      return existingBot;
    }
    return await this.createBot();
  }

  async ensureBotsExist(): Promise<void> {
    const botCount = 5; // Create 5 bots for variety
    
    for (let i = 0; i < botCount; i++) {
      const existingBot = await storage.getRandomBot();
      if (!existingBot) {
        await this.createBot();
      }
    }
  }
}

export const botService = new BotService();