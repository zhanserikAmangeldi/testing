import React from 'react'

export default function WalletConnect({ account, connect }) {
    return (
        <div className="flex items-center gap-4">
            {account ? (
                <div className="text-sm">Connected: {account.slice(0, 6)}...{account.slice(-4)}</div>
            ) : (
                <button className="px-4 py-2 border rounded" onClick={connect}>Connect MetaMask</button>
            )}
        </div>
    )
}