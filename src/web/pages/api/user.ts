import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  console.dir([session]);

  if (session) {
    // Fetch the accounts from the database
    const sequelizeDatabase = global.database;
    const accountsModel = await sequelizeDatabase.models.account;
    const account = await accountsModel.findOne({
      where: {
        userId: session.user.id,
      }
    });

    if (account) {
      return res.status(200).json({
        nice: 'yes',
        account: account,
      });
    }
  }

  res.status(200).json({
    nice: 'no',
  });
}