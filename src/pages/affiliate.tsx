import type { NextPage } from "next";
import Head from "next/head";
import { AffiliateView } from "../views";

const Affiliate: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>Vault SDK demo - Solana Scaffold</title>
                <meta
                    name="description"
                    content="Mercurial Finance Vault SDK demo"
                />
            </Head>
            <AffiliateView />
        </div>
    );
};

export default Affiliate;
