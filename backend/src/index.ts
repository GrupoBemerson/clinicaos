import app from './app';
import dotenv from 'dotenv';
import './scheduler';
import { createServer } from 'http'
import { setupWebSocket } from './wsServer'

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

const server = createServer(app)
setupWebSocket(server)

server.listen(PORT, () => {
  console.log(`ClinicaOS backend listening on port ${PORT}`);
});
