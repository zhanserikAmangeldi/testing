import React, { useEffect, useState } from 'react'
import { Coins, ChevronDown, Wallet, AlertCircle, RefreshCw } from 'lucide-react'

export default function TokenSelector({ contract, account, onTokenSelect, selectedToken }) {
    const [tokens, setTokens] = useState([])
    const [balances, setBalances] = useState({})
    const [betAmounts, setBetAmounts] = useState({})
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [useNative, setUseNative] = useState(true)
    const [nativeBetAmount, setNativeBetAmount] = useState('0')

    useEffect(() => {
        loadTokens()
        loadNativeBetAmount()
    }, [contract])

    useEffect(() => {
        if (account) {
            loadBalances()
        }
    }, [contract, account, tokens])

    async function loadNativeBetAmount() {
        if (!contract) return
        try {
            const amount = await contract.betAmount()
            setNativeBetAmount(amount.toString())
        } catch (err) {
            console.error('Failed to load native bet amount:', err)
        }
    }

    async function loadTokens() {
        if (!contract) return

        try {
            setLoading(true)
            const tokenAddresses = await contract.getSupportedTokens()

            const tokenData = await Promise.all(
                tokenAddresses.map(async (address) => {
                    try {
                        const betAmount = await contract.getTokenBetAmount(address)

                        // Try to get token symbol and decimals (requires ERC20 ABI)
                        // For demo, we'll use generic names
                        return {
                            address,
                            symbol: `TOKEN-${address.slice(0, 6)}`,
                            betAmount: betAmount.toString(),
                            decimals: 18 // Assuming 18 decimals
                        }
                    } catch (err) {
                        console.error(`Failed to load token ${address}:`, err)
                        return null
                    }
                })
            )

            setTokens(tokenData.filter(t => t !== null))

            // Create bet amounts mapping
            const amounts = {}
            tokenData.forEach(token => {
                if (token) {
                    amounts[token.address] = token.betAmount
                }
            })
            setBetAmounts(amounts)

        } catch (err) {
            console.error('Failed to load tokens:', err)
        } finally {
            setLoading(false)
        }
    }

    async function loadBalances() {
        if (!contract || !account || tokens.length === 0) return

        try {
            // Load native balance
            const provider = contract.runner.provider
            const nativeBalance = await provider.getBalance(account)

            const newBalances = {
                native: nativeBalance.toString()
            }

            // For tokens, you'd need to call balanceOf on each token contract
            // For now, we'll show placeholders
            tokens.forEach(token => {
                newBalances[token.address] = '0' // Would need to query token contract
            })

            setBalances(newBalances)
        } catch (err) {
            console.error('Failed to load balances:', err)
        }
    }

    function formatBalance(balance, decimals = 18) {
        if (!balance || balance === '0') return '0.0000'
        const num = Number(balance) / Math.pow(10, decimals)
        return num.toFixed(4)
    }

    function handleSelect(token) {
        if (token === 'native') {
            setUseNative(true)
            onTokenSelect && onTokenSelect(null)
        } else {
            setUseNative(false)
            onTokenSelect && onTokenSelect(token)
        }
        setIsOpen(false)
    }

    const currentSelection = useNative
        ? { symbol: 'BNB', address: 'native', betAmount: nativeBetAmount }
        : selectedToken || tokens[0]

    if (!account) {
        return (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700">Connect wallet to see payment options</span>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Token Selector Dropdown */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                </label>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Coins className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-gray-900">{currentSelection?.symbol}</div>
                            <div className="text-xs text-gray-500">
                                Bet: {formatBalance(currentSelection?.betAmount, 18)} {currentSelection?.symbol}
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {/* Native Currency Option */}
                        <button
                            onClick={() => handleSelect('native')}
                            className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                                useNative ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">BNB</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">BNB (Native)</div>
                                    <div className="text-xs text-gray-500">
                                        Balance: {formatBalance(balances.native, 18)} BNB
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatBalance(nativeBetAmount, 18)}
                                </div>
                                <div className="text-xs text-gray-500">Bet Amount</div>
                            </div>
                        </button>

                        {/* Token Options */}
                        {tokens.map((token, idx) => (
                            <button
                                key={token.address}
                                onClick={() => handleSelect(token)}
                                className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${
                                    !useNative && selectedToken?.address === token.address ? 'bg-blue-50' : ''
                                } ${idx > 0 || tokens.length > 0 ? 'border-t border-gray-100' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{token.symbol.slice(0, 3)}</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900">{token.symbol}</div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {token.address}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatBalance(token.betAmount, token.decimals)}
                                    </div>
                                    <div className="text-xs text-gray-500">Bet Amount</div>
                                </div>
                            </button>
                        ))}

                        {tokens.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No tokens configured yet
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Current Selection Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Your Balance</span>
                    </div>
                    <button
                        onClick={loadBalances}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Refresh balance"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Available</div>
                        <div className="text-lg font-bold text-gray-900">
                            {useNative
                                ? formatBalance(balances.native, 18)
                                : formatBalance(balances[currentSelection?.address], currentSelection?.decimals)
                            }
                        </div>
                        <div className="text-xs text-gray-500">{currentSelection?.symbol}</div>
                    </div>

                    <div>
                        <div className="text-xs text-gray-600 mb-1">Required Bet</div>
                        <div className="text-lg font-bold text-blue-600">
                            {formatBalance(currentSelection?.betAmount, currentSelection?.decimals || 18)}
                        </div>
                        <div className="text-xs text-gray-500">{currentSelection?.symbol}</div>
                    </div>
                </div>

                {/* Insufficient Balance Warning */}
                {((useNative && Number(balances.native || 0) < Number(nativeBetAmount)) ||
                    (!useNative && Number(balances[currentSelection?.address] || 0) < Number(currentSelection?.betAmount))) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Insufficient balance to play</span>
                    </div>
                )}

                {/* Win Potential */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Win Potential (2x):</span>
                        <span className="font-bold text-green-600">
              {formatBalance(
                  (Number(currentSelection?.betAmount || 0) * 2).toString(),
                  currentSelection?.decimals || 18
              )} {currentSelection?.symbol}
            </span>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
                <div className="font-medium mb-1">💡 About Payment Methods</div>
                <div className="space-y-1">
                    <div>• <strong>BNB (Native):</strong> Uses blockchain's native currency</div>
                    <div>• <strong>Tokens:</strong> Uses supported ERC-20 tokens</div>
                    <div>• Bet amounts are fixed by contract owner</div>
                </div>
            </div>
        </div>
    )
}