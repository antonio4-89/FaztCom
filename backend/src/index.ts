import 'dotenv/config';
import http from 'http';
import { app } from './app';
import { setIO } from './socket';

const PORT = process.env.PORT ?? 3000;

const server = http.createServer(app);

setIO(server);

server.listen(PORT, () => {
  console.log(`\n🚀  FaztCom backend running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL ?? 'not set'}\n`);
});
