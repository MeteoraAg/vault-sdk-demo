export const fromLamports = (amount: number, decimals: number) => {
    const result = amount / Math.pow(10, decimals);
    return Number(result)
}

export const toLamports = (amount: number, decimals: number) => {
    const result = (amount * Math.pow(10, decimals)).toFixed(0);
    return Number(result)
}