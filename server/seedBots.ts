import { botService } from "./botService";

export async function seedInitialBots() {
  try {
    // Create 5 diverse bots
    const bots = [
      { birthYear: 1998, gender: 'a' },
      { birthYear: 2000, gender: 'b' },
      { birthYear: 1997, gender: 'a' },
      { birthYear: 2001, gender: 'b' },
      { birthYear: 1999, gender: 'a' }
    ];

    for (const botData of bots) {
      await botService.createBot(botData.birthYear, botData.gender);
    }
    
    console.log('Initial bots created successfully');
  } catch (error) {
    console.error('Error creating initial bots:', error);
  }
}