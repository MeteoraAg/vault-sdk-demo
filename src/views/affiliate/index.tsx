import { FC, useEffect, useState } from "react";
import VaultImpl, { constants } from "@mercurial-finance/vault-sdk";
import { StaticTokenListResolutionStrategy, TokenInfo } from "@solana/spl-token-registry";
import { useConnection } from "@solana/wallet-adapter-react";

import { VaultInfo } from "types";
import VaultRow from "views/home/VaultRow";
import { PublicKey } from "@solana/web3.js";
import AffiliateInfo from "./AffiliateDetails";

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const URL = constants.KEEPER_URL['mainnet-beta'];
const SOL_TOKEN_INFO = tokenMap.find((token) => token.symbol === 'SOL') as TokenInfo;

export const AffiliateView: FC = ({ }) => {
    const { connection } = useConnection();

    const [availableVaults, setAvailableVaults] = useState<{ vaultImpl: VaultImpl, vaultInfo: VaultInfo }[]>([]);

    useEffect(() => {
        const init = async () => {
            const vaultsInfoResponse = await fetch(`${URL}/vault_info`)
            const vaultsInfo = await vaultsInfoResponse.json() as VaultInfo[];

            // This Partner only supports SOL
            const vaultsToInit = vaultsInfo
                .filter(vault => vault.token_address === SOL_TOKEN_INFO.address)
                .map(async (vault) => {
                    const tokenInfo = tokenMap.find(token => token.address === vault.token_address);
                    if (!tokenInfo) return null;

                    return {
                        vaultInfo: vault,
                        vaultImpl: await VaultImpl.create(
                            connection,
                            SOL_TOKEN_INFO,
                            {
                                affiliateId: new PublicKey('7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF')
                            },
                        ),
                    }
                });

            Promise.all(vaultsToInit).then((availableVaults) => setAvailableVaults(availableVaults.filter(Boolean)));
        }

        if (tokenMap.length === 0) return;
        init();
    }, [tokenMap])

    return (
        <div className='flex items-center justify-center flex-col my-8'>
            <h2 className='break-words w-[80%]'>Affiliate ID: 7236FoaWTXJyzbfFPZcrzg3tBpPhGiTgXsGWvjwrYfiF</h2>
            <h3 className='break-words w-[80%]'>*this Partner only supports SOL</h3>

            {availableVaults.map(vault => (
                <VaultRow key={vault.vaultInfo.token_address} vaultImpl={vault.vaultImpl} vaultInfo={vault.vaultInfo}>
                    <AffiliateInfo vaultImpl={vault.vaultImpl} vaultInfo={vault.vaultInfo} />
                </VaultRow>
            ))}
        </div>
    )
};