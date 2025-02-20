export default function apiKeyMiddleware(handler) {
    return async (req, res) => {
      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Invalid or missing API key' });
      }
  
      return handler(req, res);
    };
  }