import { readFileSync } from 'node:fs';

const message = readFileSync(process.argv[2], 'utf8').trim();
const pattern = /^[A-Z][A-Z0-9]+-\d+ \| (feat|fix|docs|refactor|test|chore|style|perf|build|ci|revert): .+$/;

if (!pattern.test(message)) {
  console.error('Invalid commit message. Use: TICKET-123 | feat: describe the change');
  process.exit(1);
}