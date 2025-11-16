import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { RPS_CONTRACT_ADDRESS, RPS_CONTRACT_ABI } from '../constants'

// ВАЖНО: Используем отдельный RPC для чтения, чтобы избежать rate limits MetaMask
const BSC_TESTNET_RPC = 'https://rpc.ankr.com/bsc_testnet_chapel/fef883e77f33bd5ce1d35aa66a9e701ca5603e9f2ec6c249ba070892d7aa9623'

export function useWallet() {
    const [account, setAccount] = useState(null)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [readOnlyProvider, setReadOnlyProvider] = useState(null)
    const [readOnlyContract, setReadOnlyContract] = useState(null)

    useEffect(() => {
        // Создаем отдельный провайдер для ЧТЕНИЯ (queries/events)
        // Это НЕ использует MetaMask и не имеет rate limits!
        const rpcProvider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC)
        setReadOnlyProvider(rpcProvider)

        // Контракт для ЧТЕНИЯ (через публичный RPC)
        const readContract = new ethers.Contract(
            RPS_CONTRACT_ADDRESS,
            RPS_CONTRACT_ABI,
            rpcProvider
        )
        setReadOnlyContract(readContract)

        console.log('✅ Read-only provider created:', BSC_TESTNET_RPC)

        if (window.ethereum) {
            const metaMaskProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(metaMaskProvider)
        }
    }, [])

    async function connect() {
        if (!window.ethereum) throw new Error('No MetaMask')

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        })
        setAccount(accounts[0])

        const p = new ethers.BrowserProvider(window.ethereum)
        const s = await p.getSigner()
        setProvider(p)
        setSigner(s)

        // Контракт для ЗАПИСИ (transactions через MetaMask)
        const c = new ethers.Contract(RPS_CONTRACT_ADDRESS, RPS_CONTRACT_ABI, s)
        setContract(c)

        console.log('✅ Wallet connected:', accounts[0])

        // Listen for account change
        window.ethereum.on('accountsChanged', (accs) => {
            setAccount(accs[0] || null)
            if (accs[0]) {
                console.log('Account changed:', accs[0])
            }
        })
    }

    return {
        account,              // Адрес пользователя
        provider,             // MetaMask provider (только для сети)
        signer,               // MetaMask signer (для транзакций)
        contract,             // Контракт для ЗАПИСИ (используй для транзакций)
        readOnlyProvider,     // Публичный RPC provider (для чтения)
        readOnlyContract,     // Контракт для ЧТЕНИЯ (используй для queries/events)
        connect
    }
}