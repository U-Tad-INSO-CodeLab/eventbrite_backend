import 'dotenv/config';
import { createServer } from './core/server';
import { env } from './core/config/env';

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
