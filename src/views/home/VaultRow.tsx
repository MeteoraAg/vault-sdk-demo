import React, { useEffect, useState } from 'react'
import { StaticTokenListResolutionStrategy, TokenInfo } from '@solana/spl-token-registry';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

import VaultImpl from '@mercurial-finance/vault-sdk';

import { fromLamports, toLamports } from 'utils';
import { notify } from 'utils/notifications';
import { VaultInfo } from 'types';

interface IData {
    virtualPrice: number;
    tvl: number;
    userTVL: number;
    userLPBalance: number;
    userTokenBalance: number;
}

const tokenMap = new StaticTokenListResolutionStrategy().resolve();

const initialData: IData = Object.freeze({
    virtualPrice: 0,
    tvl: 0,
    userTVL: 0,
    userLPBalance: 0,
    userTokenBalance: 0,
})

const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const getUserbalance = async (connection: Connection, mint: PublicKey, owner: PublicKey) => {
    try {
        if (mint.equals(SOL_MINT)) {
            const accountInfo = await connection.getParsedAccountInfo(owner);
            return accountInfo.value.lamports;
        }

        const address = await getAssociatedTokenAddress(mint, owner);
        const accountInfo = await connection.getParsedAccountInfo(address);

        if (!accountInfo || !accountInfo.value) {
            return 0;
        }
        return accountInfo.value.lamports;
    } catch (error) {
        console.log('Error getting user balance', error)
        return 0;
    }
}

const VaultRow: React.FC<{ vaultImpl: VaultImpl, vaultInfo: VaultInfo }> = ({ vaultImpl, vaultInfo }) => {
    const token = vaultImpl.vaultState.tokenMint.toString();
    const tokenInfo: TokenInfo = tokenMap.find(item => item.address === token);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // Vault State
    const [vaultUnlockedAmount, setVaultUnlockedAmount] = useState('')

    // Vault State to display
    const [uiState, setUiState] = useState<IData>(initialData);

    // User balances
    const [userLPBalanceInLamports, setUserLPBalanceInLamports] = useState('');
    const [userTokenBalanceInLamports, setUserTokenBalanceInLamports] = useState(0);

    // User interaction
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Process vault information
    useEffect(() => {
        vaultImpl.getWithdrawableAmount()
            .then(unlockedAmount => setVaultUnlockedAmount(unlockedAmount))
            .catch(console.error);
    }, [vaultImpl])

    useEffect(() => {
        const virtualPrice = (Number(vaultUnlockedAmount) / Number(vaultImpl.lpSupply)) || 0;

        setUiState({
            virtualPrice,
            tvl: vaultInfo.usd_rate * fromLamports(Number(vaultInfo.token_amount), tokenInfo.decimals),
            userTVL: Number(fromLamports(Number(userLPBalanceInLamports), tokenInfo.decimals)) * virtualPrice,
            userLPBalance: fromLamports(Number(userLPBalanceInLamports), tokenInfo.decimals),
            userTokenBalance: fromLamports(Number(userTokenBalanceInLamports), tokenInfo.decimals),
        })
    }, [vaultInfo, vaultUnlockedAmount, userLPBalanceInLamports, userTokenBalanceInLamports])

    const fetchUserBalance = async () => {
        if (!tokenInfo || !publicKey) return;

        try {
            const userLpBalance = await vaultImpl.getUserBalance(publicKey)
            setUserLPBalanceInLamports(userLpBalance)

            const userTokenBalance = await getUserbalance(connection, new PublicKey(tokenInfo.address), publicKey);
            setUserTokenBalanceInLamports(userTokenBalance)
        } catch (error) {
            console.log('Error getting user lp or token balance', error)
        }
    };
    // Fetch LP balance
    useEffect(() => { fetchUserBalance() }, [tokenInfo, publicKey])

    const deposit = async () => {
        setLoading(true);

        try {
            if (Number(depositAmount) <= 0 || loading) return;

            const tx = await vaultImpl.deposit(publicKey, toLamports(Number(depositAmount), tokenInfo.decimals));
            const txid = await sendTransaction(tx, connection);

            notify({
                message: `Submitting transaction...`,
                txid,
            })

            await connection.confirmTransaction({ signature: txid, ...await connection.getLatestBlockhash() });
            notify({
                message: `Succesfully deposited`,
                txid,
            })
        } catch (error) {
            notify({
                type: 'error',
                message: `Failed to deposit`,
                description: error,
            })
        } finally {
            setLoading(false);
            setDepositAmount('')
            fetchUserBalance();
        }
    }

    const withdraw = async () => {
        setLoading(true);

        try {
            if (Number(withdrawAmount) <= 0 || loading) return;

            const tx = await vaultImpl.withdraw(publicKey, toLamports(Number(withdrawAmount), tokenInfo.decimals));
            const txid = await sendTransaction(tx, connection);

            notify({
                message: `Submitting transaction...`,
                txid,
            })

            await connection.confirmTransaction({ signature: txid, ...await connection.getLatestBlockhash() });
            notify({
                message: `Succesfully withdrawn`,
                txid,
            })
        } catch (error) {
            console.log(error)
            notify({
                type: 'error',
                message: `Failed to withdraw`,
                description: error.message,
            })
        } finally {
            setLoading(false);
            setWithdrawAmount('')
            fetchUserBalance();
        }
    }

    const onClickMaxDeposit = () => {
        // If it's SOL, we need to reserve some gas
        if (tokenInfo.address === SOL_MINT.toString()) {
            const maxSOLDeposit = uiState.userTokenBalance - 0.005
            setDepositAmount(maxSOLDeposit.toString())
            return;
        }

        setDepositAmount(uiState.userTokenBalance.toString())
    }
    const onClickMaxWithdraw = () => setWithdrawAmount(uiState.userLPBalance.toString())

    return (
        <div key={tokenInfo.address} className={`w-[80%] mt-2 bg-white p-4 rounded-lg text-black ${loading ? 'animate-pulse cursor-not-allowed' : ''}`}>
            <div className='flex-col lg:flex text-sm justify-between'>
                <div className='flex w-[25%] space-x-4 items-center'>
                    <img alt={tokenInfo.symbol} src={tokenInfo.logoURI} height={28} width={28} className='object-contain' />
                    <span>{tokenInfo.symbol}</span>
                </div>

                <div className='flex-col w-full mt-4'>
                    {/* Pool information */}
                    <div className='flex flex-wrap justify-between'>
                        <div className='w-1/2 lg:w-1/4'>
                            <p className='text-black/50'>TVL</p>
                            <p>{uiState.tvl.toLocaleString()}</p>
                        </div>

                        <div className='w-1/2 lg:w-1/4'>
                            <p className='text-black/50'>Virtual Price</p>
                            <p>{uiState.virtualPrice.toFixed(6)}</p>
                        </div>

                        <div className='w-1/2 lg:w-1/4'>
                            <p className='text-black/50'>APY</p>
                            <p>{vaultInfo.closest_apy.toFixed(2)}%</p>
                        </div>

                        <div className='w-1/2 lg:w-1/4'>
                            <p className='text-black/50'>Your deposit</p>
                            <p>{`${uiState.userTVL.toFixed(tokenInfo.decimals)} ${tokenInfo.symbol}`}</p>
                        </div>
                    </div>

                    <button type='button' className='mt-4 flex w-full justify-center' onClick={() => setExpanded(!expanded)}>
                        <p className='px-4 py-1 font-bold border rounded-lg'>{expanded ? 'Hide' : 'Show more'}</p>
                    </button>

                    {/* Balance, deposit, withdraw */}
                    {expanded && (
                        <div className='flex-col lg:mt-2 lg:flex lg:flex-row text-sm space-y-2 lg:space-y-0 justify-between'>
                            <div className='space-y-2'>
                                <div className='space-y-2'>
                                    <p className='text-black/50'>{tokenInfo.symbol} Balance:</p>
                                    <p className=''>{uiState.userTokenBalance}</p>
                                </div>

                                <div className='flex justify-between'>
                                    <p className='text-black/50'>Deposit</p>
                                    <button type='button' disabled={loading} className='text-blue-400 font-semibold' onClick={onClickMaxDeposit}>
                                        {'Max'}
                                    </button>
                                </div>

                                <div className='flex border rounded-lg w-full lg:w-48'>
                                    <input className='text-md p-2 rounded-lg w-full' type='number' onChange={({ target: { value } }) => setDepositAmount(value)} value={depositAmount} />
                                    <button type='button' disabled={loading} className='border-l p-2 w-20 text-center' onClick={deposit}>
                                        {'Deposit'}
                                    </button>
                                </div>

                                {tokenInfo.address === SOL_MINT.toString()
                                    ? <p className='text-black/50'>We recommend keeping some SOL left for transaction.</p>
                                    : null
                                }
                            </div>


                            <div className='space-y-2'>
                                <div className='space-y-2'>
                                    <p className='text-black/50'>Balance:</p>
                                    <p className=''>{uiState.userLPBalance} LP</p>
                                </div>

                                <div className='flex justify-between'>
                                    <p className='text-black/50'>Withdraw</p>

                                    <button type='button' disabled={loading} className='text-blue-400 font-semibold' onClick={onClickMaxWithdraw}>
                                        {'Max'}
                                    </button>
                                </div>
                                <div className='flex border rounded-lg w-full lg:w-48'>
                                    <input className='text-md p-2 rounded-lg w-full' type='number' onChange={({ target: { value } }) => setWithdrawAmount(value)} value={withdrawAmount} />
                                    <button type='button' disabled={loading} className='border-l p-2 w-20 text-center' onClick={withdraw}>
                                        {'Withdraw'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VaultRow