import { useEffect, useState, useCallback, useRef } from 'react'

// Optimized event listener hook
export function useEvents(readOnlyContract) {
    const [events, setEvents] = useState([])
    const lastBlockChecked = useRef(0)
    const pollingInterval = useRef(null)
    const isPolling = useRef(false)

    const pushEvent = useCallback((e) => {
        console.log('New event received:', e)
        setEvents((s) => {
            const isDuplicate = s.some(existing =>
                existing.type === e.type &&
                existing.timestamp === e.timestamp &&
                existing.player === e.player
            )
            if (isDuplicate) {
                console.log('Duplicate event, skipping')
                return s
            }
            return [e, ...s].slice(0, 100)
        })
    }, [])

    const pollForEvents = useCallback(async () => {
        if (!readOnlyContract) {
            console.log('⏭️ Skipping poll: no readOnlyContract')
            return
        }

        if (isPolling.current) {
            console.log('⏭️ Previous poll still running, skipping...')
            return
        }

        isPolling.current = true

        try {
            const provider = readOnlyContract.runner.provider

            // Проверяем, что это JsonRpcProvider, а не BrowserProvider
            if (provider.constructor.name === 'BrowserProvider' || provider.constructor.name === '_BrowserProvider') {
                console.error('❌ ERROR: useEvents using BrowserProvider instead of JsonRpcProvider!')
                isPolling.current = false
                return
            }

            const currentBlock = await provider.getBlockNumber()

            if (lastBlockChecked.current === 0) {
                lastBlockChecked.current = currentBlock
                isPolling.current = false
                return
            }

            if (currentBlock <= lastBlockChecked.current) {
                isPolling.current = false
                return
            }

            const fromBlock = lastBlockChecked.current + 1
            const blockRange = Math.min(currentBlock - fromBlock + 1, 5)
            const toBlock = fromBlock + blockRange - 1

            console.log(`📡 Polling events [${fromBlock} → ${toBlock}]`)

            try {
                // SingleGameResult events
                const singleResultFilter = readOnlyContract.filters.SingleGameResult()
                const singleResults = await readOnlyContract.queryFilter(singleResultFilter, fromBlock, toBlock)

                singleResults.forEach(event => {
                    pushEvent({
                        type: 'SingleGameResult',
                        player: event.args.player,
                        playerChoice: event.args.playerChoice.toString(),
                        houseChoice: event.args.houseChoice.toString(),
                        result: event.args.result.toString(),
                        payout: event.args.payout.toString(),
                        isTokenGame: event.args.isTokenGame,
                        token: event.args.token,
                        timestamp: Date.now(),
                        blockNumber: event.blockNumber
                    })
                })

                await new Promise(resolve => setTimeout(resolve, 100))

                // MultiplayerGameResult events
                const multiResultFilter = readOnlyContract.filters.MultiplayerGameResult()
                const multiResults = await readOnlyContract.queryFilter(multiResultFilter, fromBlock, toBlock)

                multiResults.forEach(event => {
                    pushEvent({
                        type: 'MultiplayerGameResult',
                        gameId: event.args.gameId.toString(),
                        winner: event.args.winner,
                        payout: event.args.payout.toString(),
                        isTokenGame: event.args.isTokenGame,
                        token: event.args.token,
                        timestamp: Date.now(),
                        blockNumber: event.blockNumber
                    })
                })

                lastBlockChecked.current = toBlock

            } catch (err) {
                console.error('Error polling events:', err)
                if (err.message?.includes('limit exceeded') || err.code === -32005) {
                    console.warn('⚠️ Rate limit hit, backing off...')
                }
            }

        } catch (err) {
            console.error('Error in pollForEvents:', err)
        } finally {
            isPolling.current = false
        }
    }, [readOnlyContract, pushEvent])

    useEffect(() => {
        if (!readOnlyContract) {
            console.log('⏭️ No readOnlyContract, skipping event setup')
            return
        }

        console.log('✅ Setting up event polling with provider:', readOnlyContract.runner.provider.constructor.name)

        // Poll every 20 seconds
        pollingInterval.current = setInterval(pollForEvents, 20000)

        // Initial poll after 2 seconds
        setTimeout(pollForEvents, 2000)

        return () => {
            console.log('🧹 Cleaning up event polling')
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current)
            }
        }
    }, [readOnlyContract, pollForEvents])

    return { events }
}