const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// API para obtener encuestas
app.get('/api/surveys', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             (SELECT COUNT(*) FROM survey_questions WHERE survey_id = s.id) as question_count
      FROM surveys s 
      WHERE is_active = true 
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API para obtener preguntas de una encuesta
app.get('/api/surveys/:id/questions', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const result = await pool.query(`
      SELECT * FROM survey_questions 
      WHERE survey_id = $1 
      ORDER BY order_index
    `, [surveyId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API para enviar respuestas de encuesta
app.post('/api/surveys/:id/submit', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const surveyId = req.params.id;
    const { responses, userEmail } = req.body;
    
    // Por ahora, crear un usuario temporal o usar IP
    const userIp = req.ip || req.connection.remoteAddress;
    let userId;
    
    // Crear o obtener usuario temporal basado en IP
    const userResult = await client.query(`
      INSERT INTO users (email, ip_address, referral_code) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (email) DO UPDATE SET ip_address = $2
      RETURNING id
    `, [userEmail || `temp_${Date.now()}@temp.com`, userIp, `IP${Date.now()}`]);
    
    userId = userResult.rows[0].id;
    
    // Verificar si ya completó esta encuesta
    const existingResult = await client.query(`
      SELECT id FROM user_completed_surveys 
      WHERE user_id = $1 AND survey_id = $2
    `, [userId, surveyId]);
    
    if (existingResult.rows.length > 0) {
      throw new Error('Ya has completado esta encuesta');
    }
    
    // Guardar respuestas
    for (const [questionKey, answer] of Object.entries(responses)) {
      const questionResult = await client.query(`
        SELECT id FROM survey_questions 
        WHERE survey_id = $1 AND question_key = $2
      `, [surveyId, questionKey]);
      
      if (questionResult.rows.length > 0) {
        await client.query(`
          INSERT INTO user_survey_responses (user_id, survey_id, question_id, answer_text)
          VALUES ($1, $2, $3, $4)
        `, [userId, surveyId, questionResult.rows[0].id, JSON.stringify(answer)]);
      }
    }
    
    // Marcar encuesta como completada y procesar recompensa
    const surveyResult = await client.query(`
      SELECT survey_key FROM surveys WHERE id = $1
    `, [surveyId]);
    
    if (surveyResult.rows.length > 0) {
      await client.query(`SELECT process_survey_reward($1, $2)`, [userId, surveyResult.rows[0].survey_key]);
    }
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: 'Encuesta enviada correctamente' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Inicializar base de datos en el primer arranque
async function initializeDatabase() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('Inicializando base de datos...');
      const fs = require('fs');
      const schemaSQL = fs.readFileSync('schema.sql', 'utf8');
      await pool.query(schemaSQL);
      console.log('Base de datos inicializada');
    }
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
}

app.listen(port, async () => {
  console.log(`Servidor corriendo en puerto ${port}`);
  await initializeDatabase();
});