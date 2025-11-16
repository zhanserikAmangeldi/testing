import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Wifi } from 'lucide-react'

const SUPPORTED_NETWORKS = {
    '56': { name: 'BSC Mainnet', chainId: 56, color: 'yellow' },
    '97': { name: 'BSC Testnet', chainId: 97, color: 'blue' },
    '1': { name: 'Ethereum Mainnet', chainId: 1, color: 'purple' },
    '11155111': { name: 'Sepolia Testnet', chainId: 11155111, color: 'green' }
}

const EXPECTED_CHAIN_ID = '97'

export default function NetworkIndicator({ provider, account }) {
    const [network, setNetwork] = useState(null)
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(true)

    useEffect(() => {
        checkNetwork()

        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                checkNetwork()
                window.location.reload()
            })
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', checkNetwork)
            }
        }
    }, [provider, account])

    async function checkNetwork() {
        if (!provider || !account) {
            setNetwork(null)
            return
        }

        try {
            const net = await provider.getNetwork()
            const chainId = net.chainId.toString()
            setNetwork(SUPPORTED_NETWORKS[chainId] || {
                name: `Unknown Network (${chainId})`,
                chainId,
                color: 'gray'
            })
            setIsCorrectNetwork(chainId === EXPECTED_CHAIN_ID)
        } catch (err) {
            console.error('Failed to get network:', err)
        }
    }

    async function switchNetwork() {
        if (!window.ethereum) return

        const targetChainId = `0x${parseInt(EXPECTED_CHAIN_ID).toString(16)}`

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            })
        } catch (err) {
            if (err.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: targetChainId,
                            chainName: SUPPORTED_NETWORKS[EXPECTED_CHAIN_ID].name,
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18
                            },
                            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                            blockExplorerUrls: ['https://testnet.bscscan.com']
                        }]
                    })
                } catch (addErr) {
                    console.error('Failed to add network:', addErr)
                }
            } else {
                console.error('Failed to switch network:', err)
            }
        }
    }

    if (!account || !network) return null

    const colorClasses = {
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        gray: 'bg-gray-50 border-gray-200 text-gray-800',
        red: 'bg-red-50 border-red-200 text-red-800'
    }

    if (!isCorrectNetwork) {
        return (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="font-semibold text-red-800">Wrong Network</div>
                        <div className="text-sm text-red-700">
                            Connected to: <strong>{network.name}</strong>
                        </div>
                        <div className="text-sm text-red-700">
                            Expected: <strong>{SUPPORTED_NETWORKS[EXPECTED_CHAIN_ID].name}</strong>
                        </div>
                    </div>
                </div>
                <button
                    className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
                    onClick={switchNetwork}
                >
                    Switch to {SUPPORTED_NETWORKS[EXPECTED_CHAIN_ID].name}
                </button>
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${colorClasses[network.color]}`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex items-center gap-2 text-sm">
                <Wifi className="w-3 h-3" />
                <span className="font-medium">{network.name}</span>
            </div>
        </div>
    )
}