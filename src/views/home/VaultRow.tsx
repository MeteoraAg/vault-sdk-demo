import React, { useEffect, useState } from 'react'
import { TokenInfo } from '@solana/spl-token-registry';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from 'bn.js';

import VaultImpl, { KEEPER_URL } from '@mercurial-finance/vault-sdk';

import { fromLamports, toLamports } from 'utils';
import { notify } from 'utils/notifications';
import { VaultInfo, VaultStateAPI } from 'types';
import { useNetworkConfiguration } from 'contexts/NetworkConfigurationProvider';
import { tokenMap } from '../../constants';

interface IData {
    virtualPrice: number;
    tvl: number;
    userTVL: number;
    userLPBalance: number;
    userTokenBalance: number;
    strategyAllocation: {
        name: string;
        liquidity: number;
        allocation: string;
        maxAllocation: number;
    }[]
}

const initialData: IData = Object.freeze({
    virtualPrice: 0,
    tvl: 0,
    userTVL: 0,
    userLPBalance: 0,
    userTokenBalance: 0,
    strategyAllocation: [],
})

const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const getUserbalance = async (connection: Connection, mint: PublicKey, owner: PublicKey) => {
    try {
        if (mint.equals(SOL_MINT)) {
            const accountInfo = await connection.getAccountInfo(owner);
            return accountInfo?.lamports;
        }

        const address = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner);
        const balanceInfo = await connection.getAccountInfo(address);
        if(!balanceInfo || balanceInfo.owner.equals(SystemProgram.programId)) {
            return 0;
        }
        const account = AccountLayout.decode(balanceInfo.data);
        const balance = new BN(account.amount, "le")

        return balance.toNumber();
    } catch (error) {
        console.log('Error getting user balance', error)
        return 0;
    }
}

const VaultRow: React.FC<{ vaultImpl: VaultImpl, vaultInfo: VaultInfo }> = ({ vaultImpl, vaultInfo, children }) => {
    const token = vaultImpl.vaultState.tokenMint.toString();
    const tokenInfo: TokenInfo = tokenMap.find(item => item.address === token);

    const { connection } = useConnection();
    const { networkConfiguration } = useNetworkConfiguration();
    const URL = KEEPER_URL[networkConfiguration];
    const { publicKey, signTransaction } = useWallet();

    // Vault State
    const [vaultUnlockedAmount, setVaultUnlockedAmount] = useState<number>(0)
    const [vaultStateAPI, setVaultStateAPI] = useState<VaultStateAPI>({
        enable: false,
        token_amount: 0,
        total_amount: 0,
        lp_supply: 0,
        strategies: []
    });

    // Vault State to display
    const [uiState, setUiState] = useState<IData>(initialData);

    // User balances
    const [userLPBalanceInLamports, setUserLPBalanceInLamports] = useState(0);
    const [userTokenBalanceInLamports, setUserTokenBalanceInLamports] = useState(0);

    // User interaction
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Process vault information
    const fetchVaultInformation = async () => {
        const unlockedAmount = await vaultImpl.getWithdrawableAmount()
        setVaultUnlockedAmount(unlockedAmount.toNumber())

        const vaultsStateResponse = await fetch(`${URL}/vault_state/${tokenInfo.address}`)
        const vaultsState = await vaultsStateResponse.json() as VaultStateAPI;
        setVaultStateAPI(vaultsState)
    }
    useEffect(() => {
        fetchVaultInformation()
    }, [vaultImpl])

    useEffect(() => {
        const virtualPrice = (vaultUnlockedAmount / vaultImpl.lpSupply.toNumber()) || 0;
        // Vault reserves + all strategy allocations
        const totalAllocation = vaultStateAPI.strategies.reduce((acc, item) => acc + item.liquidity, vaultStateAPI.token_amount)

        setUiState({
            virtualPrice,
            tvl: vaultInfo.usd_rate * fromLamports(Number(vaultInfo.token_amount), tokenInfo.decimals),
            userTVL: Number(fromLamports(Number(userLPBalanceInLamports), tokenInfo.decimals)) * virtualPrice,
            userLPBalance: fromLamports(Number(userLPBalanceInLamports), tokenInfo.decimals),
            userTokenBalance: fromLamports(Number(userTokenBalanceInLamports), tokenInfo.decimals),
            strategyAllocation: vaultStateAPI.strategies
                .map(item => ({
                    name: item.strategy_name,
                    liquidity: item.liquidity,
                    allocation: ((item.liquidity / totalAllocation) * 100).toFixed(0),
                    maxAllocation: item.max_allocation,
                }))
                .concat({
                    name: 'Vault Reserves',
                    liquidity: vaultStateAPI.token_amount,
                    allocation: ((vaultStateAPI.token_amount / totalAllocation) * 100).toFixed(0),
                    maxAllocation: 0,
                })
                .sort((a, b) => b.liquidity - a.liquidity),
        })

        if (!publicKey) {
            setUiState(prev => ({
                ...prev,
                userLPBalance: 0,
                userTVL: 0,
                userTokenBalance: 0,
            }))
        }
    }, [publicKey, vaultImpl, vaultInfo, vaultUnlockedAmount, userLPBalanceInLamports, userTokenBalanceInLamports, vaultStateAPI])

    const fetchUserBalance = async () => {
        if (!tokenInfo || !publicKey) return setUserLPBalanceInLamports(0);

        try {
            const userLpBalance = await vaultImpl.getUserBalance(publicKey)
            setUserLPBalanceInLamports(userLpBalance.toNumber())

            const userTokenBalance = await getUserbalance(connection, new PublicKey(tokenInfo.address), publicKey);
            setUserTokenBalanceInLamports(userTokenBalance)
        } catch (error) {
            console.log('Error getting user lp or token balance', error)
        }
    };
    // Fetch LP balance
    useEffect(() => { fetchUserBalance() }, [tokenInfo, vaultImpl, publicKey])

    const deposit = async () => {
        if (!publicKey) return alert('Please connect your wallet')
        setLoading(true);

        try {
            if (Number(depositAmount) <= 0 || loading) return;

            const amountInLamports = toLamports(Number(depositAmount), tokenInfo.decimals);
            const tx = await vaultImpl.deposit(publicKey, new BN(amountInLamports));
            const signedTx = await signTransaction(tx);
            const txid = await connection.sendRawTransaction(signedTx.serialize());

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
            console.log(error)
            notify({
                type: 'error',
                message: `Failed to deposit`,
                description: error.message,
            })
        } finally {
            setLoading(false);
            setDepositAmount('')
            fetchUserBalance();
        }
    }

    const withdraw = async () => {
        if (!publicKey) return alert('Please connect your wallet')
        setLoading(true);

        try {
            if (Number(withdrawAmount) <= 0 || loading) return;

            const amountInLamports = toLamports(Number(withdrawAmount), tokenInfo.decimals);
            const tx = await vaultImpl.withdraw(publicKey, new BN(amountInLamports));
            const signedTx = await signTransaction(tx);
            const txid = await connection.sendRawTransaction(signedTx.serialize());

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

                    <div className='mt-2'>
                        {children}
                    </div>

                    <button type='button' className='mt-4 flex w-full justify-center' onClick={() => setExpanded(!expanded)}>
                        <p className='px-4 py-1 font-bold border rounded-lg'>{expanded ? 'Hide' : 'Show more'}</p>
                    </button>

                    {/* Balance, deposit, withdraw */}
                    {expanded && (
                        <div>
                            <p className='font-semibold border-b'>Strategy Allocation</p>
                            <div className='space-y-1 p-2'>
                                {uiState.strategyAllocation.map(item => (
                                    <div key={item.name} className='flex justify-between border-b'>
                                        <p className='text-black'>{item.name}</p>
                                        <p className='text-black space-x-2'>
                                            <span>{fromLamports(item.liquidity, tokenInfo.decimals).toLocaleString()}</span>
                                            <span>({item.allocation}%)</span>
                                        </p>
                                    </div>
                                ))}
                            </div>

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
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VaultRow