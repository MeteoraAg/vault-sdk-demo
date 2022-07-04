export enum StrategyType {
    PortFinanceWithoutLM = 'PortFinanceWithoutLM',
    PortFinanceWithLM = 'PortFinanceWithLM',
    SolendWithoutLM = 'SolendWithoutLM',
    SolendWithLM = 'SolendWithLM',
    ApricotWithoutLM = 'ApricotWithoutLM',
    Francium = 'Francium',
    Mango = 'Mango',
    Vault = 'Vault',
}

export type VaultInfo = {
    total_amount: number;
    total_amount_with_profit: number;
    is_monitoring: boolean;
    token_address: string;
    token_amount: number;
    earned_amount: number;
    virtual_price: string;
    closest_apy: number;
    average_apy: number;
    long_apy: number;
    usd_rate: number;
    strategies: Array<StrategyInfo>;
};

export type StrategyInfo = {
    pubkey: string;
    reserve: string;
    strategy_type: StrategyType;
    strategy_name: string;
    liquidity: number;
    reward: number;
    apy: number;
};

export type VaultStateAPI = {
    enable: boolean;
    token_amount: number;
    total_amount: number;
    lp_supply: number;
    strategies: Array<{
        pubkey: string;
        reserve: string;
        strategy_type: StrategyType;
        strategy_name: string;
        liquidity: number;
        reward: number;
        max_allocation: number;
    }>;
};
