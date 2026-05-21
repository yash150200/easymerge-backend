const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const convertRoutes = require('./routes/convert');
const mergeRoutes = require('./routes/merge');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Ensure output directories exist ──
['uploads', 'outputs'].forEach(dir => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ── Middleware ──
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving (for downloads) ──
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// ── Routes ──
app.use('/api/convert', convertRoutes);
app.use('/api/merge', mergeRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ EasyMerge backend is running',
    timestamp: new Date().toISOString(),
  });
});
app.get('/', (req, res) => {
  res.send('EasyMerge Backend Running ✅');
});
// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Periodic cleanup: remove files older than 1 hour ──
setInterval(() => {
  ['uploads', 'outputs'].forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    fs.readdir(dirPath, (err, files) => {
      if (err) return;
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          const ageMs = Date.now() - stats.mtimeMs;
          if (ageMs > 60 * 60 * 1000) fs.unlink(filePath, () => {});
        });
      });
    });
  });
}, 15 * 60 * 1000); // Every 15 minutes

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 EasyMerge backend running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://<YOUR_LOCAL_IP>:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health\n`);
});
