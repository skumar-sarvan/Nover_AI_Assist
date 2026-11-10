export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'nover-ai-demo',
    model: 'claude-opus-5-5',
    time: new Date().toISOString(),
  });
}
