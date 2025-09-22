export default function handler(req, res) {
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

  // Accept header x-admin-pass or ?pass= query param
  const provided = req.headers['x-admin-pass'] || req.query.pass || '';

  if (provided !== ADMIN_PASS) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(global.submissions || []);
}
