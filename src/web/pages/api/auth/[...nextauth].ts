import NextAuth from "next-auth";
import SequelizeAdapter, { models } from "@next-auth/sequelize-adapter"
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: 'https://discord.com/api/oauth2/authorize?scope=identify%20guilds',
    }),
  ],
  adapter: SequelizeAdapter(global.database),
  callbacks: {
    async signIn({ user, account, profile, isNewUser }) {
      console.dir([user, account, profile, isNewUser]);
      return true;
    },
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);