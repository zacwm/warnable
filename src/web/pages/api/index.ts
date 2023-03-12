import { NextApiResponse, NextApiRequest } from 'next';

export default function handler(
  req: NextApiRequest & { modules: any },
  res: NextApiResponse,
) {
  res.status(200).json({
    status: 'ok',
    modules: Object.keys(req.modules.modules).map((key: string) => {
      const module = req.modules.modules[key];
      return {
        name: module.name,
        version: module.version,
        description: module.description,
      };
    }),
  });
}