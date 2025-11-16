import React, { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CHOICES = ['Rock', 'Paper', 'Scissors']
const CHOICE_EMOJI = ['✊', '✋', '✌️']

export default function Room({ contract, readOnlyContract, gameId, account, onBack }) {
    const [game, setGame] = useState(null)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [error, setError] = useState(null)

    async function load() {
        if (!readOnlyContract) return
        try {
            setLoading(true)
            setError(null)
            const g = await readOnlyContract.multiplayerGames(gameId)
            setGame({
                player1: g.player1,
                player2: g.player2,
                player1Choice: g.player1Choice,
                player2Choice: g.player2Choice,
                player1Committed: g.player1Committed,
                player2Committed: g.player2Committed,
                betAmount: g.betAmount.toString(),
                finished: g.finished,
                isTokenGame: g.isTokenGame,
                token: g.token
            })
        } catch (err) {
            console.error(err)
            setError('Failed to load game')
        } finally {
            setLoading(false)
        }
    }

    async function makeMove(choice) {
        if (!contract || !account) return
        try {
            setSubmitting(true)
            setError(null)
            const tx = await contract.makeMove(gameId, choice)
            console.log('Making move, tx:', tx.hash)
            await tx.wait()
            console.log('Move submitted successfully')
            setSelectedChoice(null)
            // Wait a bit then reload
            setTimeout(() => load(), 1000)
        } catch (err) {
            console.error(err)
            setError('Failed to make move: ' + (err.shortMessage || err.message || 'Unknown error'))
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        load()
        // Poll for updates every 5 seconds
        const interval = setInterval(load, 5000)
        return () => clearInterval(interval)
    }, [readOnlyContract, gameId])

    const formatAddress = (addr) => {
        if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'Waiting...'
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const isPlayer1 = account && game && game.player1.toLowerCase() === account.toLowerCase()
    const isPlayer2 = account && game && game.player2.toLowerCase() === account.toLowerCase()
    const canMove = game && !game.finished && (
        (isPlayer1 && !game.player1Committed) ||
        (isPlayer2 && !game.player2Committed)
    )
    const waitingForOpponent = game && !game.finished && (
        (isPlayer1 && game.player1Committed && !game.player2Committed) ||
        (isPlayer2 && game.player2Committed && !game.player1Committed)
    )

    const getWinner = () => {
        if (!game || !game.finished) return null
        const p1 = Number(game.player1Choice)
        const p2 = Number(game.player2Choice)

        if (p1 === p2) return 'draw'
        if ((p1 === 0 && p2 === 2) || (p1 === 1 && p2 === 0) || (p1 === 2 && p2 === 1)) {
            return 'player1'
        }
        return 'player2'
    }

    const getResultMessage = () => {
        const winner = getWinner()
        if (winner === 'draw') return 'It\'s a Draw! 🤝'
        if (winner === 'player1') {
            return isPlayer1 ? 'You Won! 🎉' : 'You Lost 😢'
        }
        if (winner === 'player2') {
            return isPlayer2 ? 'You Won! 🎉' : 'You Lost 😢'
        }
        return ''
    }

    if (loading && !game) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!game) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500">Game not found</div>
                <button
                    className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
                    onClick={onBack}
                >
                    Back to Lobby
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    className="p-2 border rounded hover:bg-gray-50"
                    onClick={onBack}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">Game #{gameId}</h2>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 border-2 rounded ${isPlayer1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="text-sm text-gray-500 mb-1">Player 1</div>
                    <div className="font-medium mb-2">{formatAddress(game.player1)}</div>
                    {game.player1Committed ? (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">Committed</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-700">Choosing...</span>
                        </div>
                    )}
                    {game.finished && (
                        <div className="mt-2 text-3xl">{CHOICE_EMOJI[game.player1Choice]}</div>
                    )}
                </div>

                <div className={`p-4 border-2 rounded ${isPlayer2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="text-sm text-gray-500 mb-1">Player 2</div>
                    <div className="font-medium mb-2">{formatAddress(game.player2)}</div>
                    {game.player2 && game.player2 !== '0x0000000000000000000000000000000000000000' ? (
                        game.player2Committed ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-700">Committed</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-yellow-700">Choosing...</span>
                            </div>
                        )
                    ) : (
                        <div className="text-sm text-gray-500">Waiting to join...</div>
                    )}
                    {game.finished && game.player2 && game.player2 !== '0x0000000000000000000000000000000000000000' && (
                        <div className="mt-2 text-3xl">{CHOICE_EMOJI[game.player2Choice]}</div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-gray-50 border rounded">
                <div className="text-sm text-gray-600">Bet Amount</div>
                <div className="text-lg font-bold">{(Number(game.betAmount) / 1e18).toFixed(4)} ETH</div>
                <div className="text-sm text-gray-600 mt-1">
                    Winner takes: {(Number(game.betAmount) * 2 / 1e18).toFixed(4)} ETH
                </div>
            </div>

            {game.finished && (
                <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-2">{getResultMessage()}</div>
                    <div className="text-lg mb-4">
                        {CHOICE_EMOJI[game.player1Choice]} {CHOICES[game.player1Choice]} vs {CHOICES[game.player2Choice]} {CHOICE_EMOJI[game.player2Choice]}
                    </div>
                    <button
                        className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        onClick={onBack}
                    >
                        Back to Lobby
                    </button>
                </div>
            )}

            {!game.finished && game.player2 && game.player2 === '0x0000000000000000000000000000000000000000' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <div className="text-yellow-800">Waiting for Player 2 to join...</div>
                </div>
            )}

            {canMove && (
                <div className="space-y-4">
                    <div className="text-center font-medium">Make Your Move</div>
                    <div className="grid grid-cols-3 gap-4">
                        {CHOICES.map((choice, idx) => (
                            <button
                                key={idx}
                                className={`p-6 border-2 rounded-lg hover:bg-gray-50 transition-all ${
                                    selectedChoice === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                                onClick={() => setSelectedChoice(idx)}
                                disabled={submitting}
                            >
                                <div className="text-4xl mb-2">{CHOICE_EMOJI[idx]}</div>
                                <div className="font-medium">{choice}</div>
                            </button>
                        ))}
                    </div>
                    {selectedChoice !== null && (
                        <button
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            onClick={() => makeMove(selectedChoice + 1)}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : `Commit ${CHOICES[selectedChoice]}`}
                        </button>
                    )}
                </div>
            )}

            {waitingForOpponent && (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <div className="text-blue-800 font-medium">Waiting for opponent's move...</div>
                    <div className="text-sm text-blue-600 mt-1">The game will automatically update</div>
                </div>
            )}
        </div>
    )
}