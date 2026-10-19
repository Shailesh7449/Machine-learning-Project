export default async function handler(req: any, res: any) {
  try {
    if (typeof globalThis.DOMMatrix === 'undefined') {
      (globalThis as any).DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor() {}
      };
    }
    if (typeof globalThis.Path2D === 'undefined') {
      (globalThis as any).Path2D = class Path2D {};
    }
    const module = await import('../server.js');
    const app = module.default;
    return app(req, res);
  } catch (err: any) {
    console.error('Initialization error:', err);
    res.status(500).json({ 
      error: 'Initialization failed', 
      message: err.message, 
      stack: err.stack 
    });
  }
}
