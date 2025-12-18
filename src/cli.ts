import 'dotenv/config';
import * as readline from 'readline';
import { runSentimentAnalysisTool } from './services/toolService.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('Welcome to the Sentiment Analysis CLI Tool!');
  console.log('Enter team names to analyze sentiment. Type "exit" at any prompt to quit.\n');

  while (true) {
    const team1 = await ask('Enter team1: ');
    if (team1.toLowerCase() === 'exit') break;

    const team2 = await ask('Enter team2: ');
    if (team2.toLowerCase() === 'exit') break;

    try {
      const result = await runSentimentAnalysisTool(team1, team2, console.log);
      console.log('\n--- Results ---');
      console.log(`Score: ${result.rationalScore}`);
      console.log(`Confidence: ${result.confidence}`);
      console.log(`Reasoning: ${result.reasoning}`);
      console.log(`Sources: ${result.sources.join(', ')}\n`);
    } catch (error: any) {
      console.error('Error:', error.message);
    }

    const cont = await ask('Continue? (y/n): ');
    if (cont.toLowerCase() !== 'y') break;
  }

  console.log('Goodbye!');
  rl.close();
}

main().catch(console.error);