import 'dotenv/config';
import { createServer } from '@/core/server.js';
import { env } from '@/core/config/env.js';

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
