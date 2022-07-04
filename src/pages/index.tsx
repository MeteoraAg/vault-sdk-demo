import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Vault SDK demo - Solana Scaffold</title>
        <meta
          name="description"
          content="Mercurial Finance Vault SDK demo"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
