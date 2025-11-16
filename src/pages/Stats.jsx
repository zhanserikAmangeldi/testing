import React, { useEffect, useState } from 'react'
import { Trophy, XCircle, TrendingUp, Target, AlertCircle } from 'lucide-react'

export default function Stats({ contract, readOnlyContract, account }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)

    async function load() {
        if (!readOnlyContract || !account) return
        try {
            setLoading(true)
            const s = await readOnlyContract.getPlayerStats(account)
            const wins = Number(s._wins.toString())
            const losses = Number(s._losses.toString())
            const total = wins + losses
            const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'

            setStats({
                wins: wins.toString(),
                losses: losses.toString(),
                profits: s._totalProfits.toString(),
                total: total.toString(),
                winRate
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [readOnlyContract, account])

    if (!account) {
        return (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>Connect your wallet to see your stats</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500">
                Loading your stats...
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-gray-500">
                Failed to load stats
            </div>
        )
    }

    const profitValue = Number(stats.profits) / 1e18
    const isProfitable = profitValue > 0

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Your Statistics</h2>
                <p className="text-sm text-gray-600">Track your performance on-chain</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <div className="text-sm text-blue-600 font-medium">Total Games</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-green-600" />
                        <div className="text-sm text-green-600 font-medium">Wins</div>
                    </div>
                    <div className="text-3xl font-bold text-green-700">{stats.wins}</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div className="text-sm text-red-600 font-medium">Losses</div>
                    </div>
                    <div className="text-3xl font-bold text-red-700">{stats.losses}</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div className="text-sm text-purple-600 font-medium">Win Rate</div>
                    </div>
                    <div className="text-3xl font-bold text-purple-700">{stats.winRate}%</div>
                </div>
            </div>

            <div className={`p-6 rounded-lg border-2 ${
                isProfitable
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : profitValue < 0
                        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                        : 'bg-gray-50 border-gray-300'
            }`}>
                <div className="text-center">
                    <div className={`text-sm font-medium mb-2 ${
                        isProfitable ? 'text-green-700' : profitValue < 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                        Total Profit/Loss
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${
                        isProfitable ? 'text-green-700' : profitValue < 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                        {profitValue > 0 ? '+' : ''}{profitValue.toFixed(6)} ETH
                    </div>
                    <div className="text-sm text-gray-600">
                        {isProfitable
                            ? '🎉 You\'re in profit!'
                            : profitValue < 0
                                ? '📉 Keep playing to recover'
                                : 'Break even'}
                    </div>
                </div>
            </div>

            {Number(stats.total) > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-3">Performance Analysis</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Win/Loss Ratio</span>
                            <span className="font-medium">
                                {stats.wins}:{stats.losses}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Average per Game</span>
                            <span className="font-medium">
                                {(profitValue / Number(stats.total)).toFixed(6)} ETH
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Performance</span>
                            <span className="font-medium">
                                {Number(stats.winRate) >= 60
                                    ? '🔥 Excellent'
                                    : Number(stats.winRate) >= 50
                                        ? '👍 Good'
                                        : Number(stats.winRate) >= 40
                                            ? '📊 Average'
                                            : '💪 Keep trying'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {Number(stats.total) === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-lg mb-2">No games played yet</div>
                    <div className="text-sm">Start playing to build your statistics!</div>
                </div>
            )}

            <button
                className="w-full py-2 border rounded hover:bg-gray-50 text-sm"
                onClick={load}
            >
                Refresh Stats
            </button>
        </div>
    )
}