import VaultImpl from '@mercurial-finance/vault-sdk'
import { AffiliateInfo } from '@mercurial-finance/vault-sdk/src/vault/types';
import React, { useEffect, useState } from 'react'
import { VaultInfo } from 'types'

const AffiliateDetails: React.FC<{ vaultImpl: VaultImpl, vaultInfo: VaultInfo }> = ({ vaultImpl, vaultInfo }) => {
    const [info, setInfo] = useState<AffiliateInfo | undefined>();

    useEffect(() => {
        vaultImpl.getAffiliateInfo()
            .then(res => {
                setInfo(res);
            });
    }, []);

    return (
        <div className='break-words'>
            <p>Partner Token: {info ? info.partnerToken.toString() : ''}</p>
            <p>Vault: {info ? info.vault.toString() : ''}</p>
            <p>Total Fee: {info ? info.totalFee.toString() : ''}</p>
            <p>Fee Ratio: {info ? info.feeRatio.toString() : ''}</p>
            <p>Cumulative Fee: {info ? info.cummulativeFee.toString() : ''}</p>
        </div>
    )
}

export default AffiliateDetails