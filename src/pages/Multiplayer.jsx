import React, { useEffect, useState } from 'react'
import { AlertCircle, Users, Plus, RefreshCw } from 'lucide-react'

export default function Multiplayer({ contract, readOnlyContract, account, onJoinGame }) {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [betAmount, setBetAmount] = useState('0')
    const [myActiveGames, setMyActiveGames] = useState([])

    async function loadBetAmount() {
        if (!readOnlyContract) return
        try {
            const b = await readOnlyContract.betAmount()
            setBetAmount(b.toString())
        } catch (err) {
            console.error(err)
        }
    }

    async function loadLobby() {
        if (!readOnlyContract) return
        try {
            setLoading(true)
            const total = await readOnlyContract.totalMultiplayerGames()
            const count = Number(total.toString())
            const arr = []
            const myGames = []

            for (let i = 0; i < count; i++) {
                const g = await readOnlyContract.multiplayerGames(i)
                const gameData = {
                    id: i,
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
                }

                // Check if current user is in this game
                if (account && (
                    gameData.player1.toLowerCase() === account.toLowerCase() ||
                    gameData.player2.toLowerCase() === account.toLowerCase()
                )) {
                    myGames.push(gameData)
                }

                arr.push(gameData)
            }

            setGames(arr.reverse())
            setMyActiveGames(myGames.filter(g => !g.finished))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function createGame() {
        if (!contract) return alert('Connect wallet first')
        if (!account) return alert('No account connected')

        try {
            setCreating(true)
            const tx = await contract.createMultiplayerGame({ value: betAmount })
            await tx.wait()
            await loadLobby()
        } catch (err) {
            console.error(err)
            alert('Failed to create game: ' + (err.message || err))
        } finally {
            setCreating(false)
        }
    }

    async function joinGame(gameId) {
        if (!contract) return alert('Connect wallet first')
        if (!account) return alert('No account connected')

        try {
            const tx = await contract.joinMultiplayerGame(gameId, { value: betAmount })
            await tx.wait()
            await loadLobby()
            // Navigate to the game room
            if (onJoinGame) onJoinGame(gameId)
        } catch (err) {
            console.error(err)
            alert('Failed to join game: ' + (err.message || err))
        }
    }

    useEffect(() => {
        loadBetAmount()
        loadLobby()
    }, [readOnlyContract, account])

    const formatAddress = (addr) => {
        if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'Waiting...'
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const getGameStatus = (game) => {
        if (game.finished) return 'Finished'
        if (!game.player2 || game.player2 === '0x0000000000000000000000000000000000000000') {
            return 'Waiting for Player 2'
        }
        if (!game.player1Committed) return 'Player 1 choosing...'
        if (!game.player2Committed) return 'Player 2 choosing...'
        return 'Both committed'
    }

    const canJoin = (game) => {
        if (!account) return false
        if (game.finished) return false
        if (game.player2 && game.player2 !== '0x0000000000000000000000000000000000000000') return false
        if (game.player1.toLowerCase() === account.toLowerCase()) return false
        return true
    }

    const canPlay = (game) => {
        if (!account) return false
        if (game.finished) return false
        const isPlayer1 = game.player1.toLowerCase() === account.toLowerCase()
        const isPlayer2 = game.player2.toLowerCase() === account.toLowerCase()
        if (!isPlayer1 && !isPlayer2) return false
        if (isPlayer1 && game.player1Committed) return false
        if (isPlayer2 && game.player2Committed) return false
        return true
    }

    if (!account) {
        return (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>Connect your wallet to access multiplayer</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Multiplayer Lobby
                </h2>
                <button
                    className="px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    onClick={loadLobby}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Bet Amount</div>
                        <div className="text-sm text-gray-600">
                            {(Number(betAmount) / 1e18).toFixed(4)} ETH per game
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        onClick={createGame}
                        disabled={creating || loading}
                    >
                        <Plus className="w-4 h-4" />
                        {creating ? 'Creating...' : 'Create New Game'}
                    </button>
                </div>
            </div>

            {myActiveGames.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Your Active Games</h3>
                    <div className="space-y-2">
                        {myActiveGames.map(game => (
                            <div
                                key={game.id}
                                className="p-4 border-2 border-green-500 bg-green-50 rounded flex justify-between items-center"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">Game #{game.id}</div>
                                    <div className="text-sm text-gray-600">
                                        {formatAddress(game.player1)} vs {formatAddress(game.player2)}
                                    </div>
                                    <div className="text-sm font-medium text-green-700">
                                        {getGameStatus(game)}
                                    </div>
                                </div>
                                {canPlay(game) && (
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        onClick={() => onJoinGame && onJoinGame(game.id)}
                                    >
                                        Make Your Move
                                    </button>
                                )}
                                {!canPlay(game) && !game.finished && (
                                    <button
                                        className="px-4 py-2 border rounded hover:bg-gray-50"
                                        onClick={() => onJoinGame && onJoinGame(game.id)}
                                    >
                                        View Game
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold mb-3">All Games</h3>
                {loading && games.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading games...</div>
                ) : games.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No games yet. Create the first one!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {games.map(game => {
                            const isMyGame = account && (
                                game.player1.toLowerCase() === account.toLowerCase() ||
                                game.player2.toLowerCase() === account.toLowerCase()
                            )

                            return (
                                <div
                                    key={game.id}
                                    className={`p-4 border rounded flex justify-between items-center ${
                                        isMyGame ? 'bg-green-50 border-green-200' : 'bg-white'
                                    } ${game.finished ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">Game #{game.id}</div>
                                        <div className="text-sm text-gray-600">
                                            {formatAddress(game.player1)} vs {formatAddress(game.player2)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getGameStatus(game)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {canJoin(game) && (
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => joinGame(game.id)}
                                            >
                                                Join Game
                                            </button>
                                        )}
                                        {isMyGame && !game.finished && (
                                            <button
                                                className="px-4 py-2 border rounded hover:bg-gray-50"
                                                onClick={() => onJoinGame && onJoinGame(game.id)}
                                            >
                                                Open
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}