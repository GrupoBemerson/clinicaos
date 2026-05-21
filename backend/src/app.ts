import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import consultaRoutes from './routes/consultaRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import financeRoutes from './routes/financeRoutes';
import prontuarioRoutes from './routes/prontuarioRoutes';
import modeloProntuarioRoutes from './routes/modeloProntuarioRoutes';
import prescricaoRoutes from './routes/prescricaoRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/consultas', consultaRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/financeiro', financeRoutes);
app.use('/prontuarios', prontuarioRoutes);
app.use('/modelos-prontuario', modeloProntuarioRoutes);
app.use('/prontuarios', prontuarioRoutes);
app.use('/', prescricaoRoutes);

// basic error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
