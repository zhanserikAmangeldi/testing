import React from 'react'
import { Dice1, Users, BarChart3, Zap } from 'lucide-react'

export default function Home({ goTo }) {
    return (
        <div className="space-y-8">
            <div className="text-center py-8">
                <h2 className="text-4xl font-bold mb-3">🎮 Rock Paper Scissors</h2>
                <p className="text-lg text-gray-600 mb-2">
                    Play on-chain with provably fair randomness
                </p>
                <p className="text-sm text-gray-500">
                    Powered by Chainlink VRF for single player • Commit-reveal for multiplayer
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <button
                    className="group p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-all text-left"
                    onClick={() => goTo('single')}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <Dice1 className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Play vs House</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Challenge the house with Chainlink VRF ensuring fair random outcomes
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    🎲 Provably Fair
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    ⚡ Instant Results
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    💰 2x Payout
                                </span>
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    className="group p-6 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-all text-left"
                    onClick={() => goTo('multiplayer')}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Multiplayer</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Challenge other players in peer-to-peer matches with commit-reveal
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                    🤝 P2P Matches
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                    🔒 Commit-Reveal
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                    🏆 Winner Takes All
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <button
                className="w-full group p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left"
                onClick={() => goTo('stats')}
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <BarChart3 className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Your Statistics</h3>
                        <p className="text-sm text-gray-600">
                            Track your wins, losses, and total profits on-chain
                        </p>
                    </div>
                </div>
            </button>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4">
                    <div className="text-2xl mb-2">🔐</div>
                    <div className="font-semibold text-sm mb-1">Fully On-Chain</div>
                    <div className="text-xs text-gray-600">All game logic runs on smart contracts</div>
                </div>
                <div className="text-center p-4">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-sm mb-1">Fast & Fair</div>
                    <div className="text-xs text-gray-600">Chainlink VRF for provable randomness</div>
                </div>
                <div className="text-center p-4">
                    <div className="text-2xl mb-2">💎</div>
                    <div className="font-semibold text-sm mb-1">Non-Custodial</div>
                    <div className="text-xs text-gray-600">Your wallet, your funds, always</div>
                </div>
            </div>
        </div>
    )
}