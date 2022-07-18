// Next, React
import { FC, useEffect, useState } from 'react';
import { StaticTokenListResolutionStrategy } from "@solana/spl-token-registry";
import { useConnection } from '@solana/wallet-adapter-react';

import VaultImpl, { KEEPER_URL } from '@mercurial-finance/vault-sdk';

import VaultRow from './VaultRow';
import { VaultInfo } from 'types';

const tokenMap = new StaticTokenListResolutionStrategy().resolve();
const URL = KEEPER_URL['mainnet-beta'];
export const HomeView: FC = ({ }) => {
  const { connection } = useConnection();

  const [availableVaults, setAvailableVaults] = useState<{ vaultImpl: VaultImpl, vaultInfo: VaultInfo }[]>([]);

  useEffect(() => {
    const init = async () => {
      const vaultsInfoResponse = await fetch(`${URL}/vault_info`)
      const vaultsInfo = await vaultsInfoResponse.json() as VaultInfo[];

      const vaultsToInit = vaultsInfo
        .map(async (vault) => {
          const tokenInfo = tokenMap.find(token => token.address === vault.token_address);
          if (!tokenInfo) return null;

          return {
            vaultInfo: vault,
            vaultImpl: await VaultImpl.create(
              connection,
              tokenInfo,
              {
                cluster: 'mainnet-beta',
              },
            ),
          }
        });

      Promise.all(vaultsToInit).then((availableVaults) => setAvailableVaults(availableVaults));
    }

    if (tokenMap.length === 0) return;
    init();
  }, [tokenMap])

  return (
    <div className='flex items-center justify-center flex-col my-8'>
      {availableVaults.map(vault => <VaultRow key={vault.vaultInfo.token_address} vaultImpl={vault.vaultImpl} vaultInfo={vault.vaultInfo} />)}
    </div>
  );
};
