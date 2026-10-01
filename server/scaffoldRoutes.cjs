const fs = require('fs');
const path = require('path');

const routes = [
  'admin', 'student', 'faculty', 'hod', 'advisor', 'parent', 
  'attendance', 'leave', 'notification', 'chat', 'report', 'ai', 'dashboard'
];

const boilerplate = `import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ success: true, message: 'Endpoint active' }));

export default router;
`;

const routesDir = path.join(__dirname, 'src', 'routes');
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

routes.forEach(route => {
  const filePath = path.join(routesDir, `${route}.js`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, boilerplate);
    console.log(`Created ${route}.js`);
  }
});
