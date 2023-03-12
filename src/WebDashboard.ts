import { createServer } from 'http';
import { parse } from 'url';
import path from 'path';
import next from 'next';

export default class WebDashboard {
  constructor(modules: any) {
    const dev = process.env.NODE_ENV !== 'production';
    const app = next({
      dev,
      hostname: 'localhost',
      port: 3000,
      dir: path.join(__dirname, './web'),
    });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
      createServer((req: any, res: any) => {
        const parsedUrl = parse(req.url!, true);
        // Pass modules to the api routes
        if (parsedUrl.pathname?.startsWith('/api')) {
          req.modules = modules;
        }
        handle(req, res, parsedUrl);
      }).listen(3000, (err?: any) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
      });
    });
  }
}