import React, { useEffect, useState } from 'react'
import { Loader2, CheckCircle, Clock, Zap } from 'lucide-react'

export default function EnhancedLoading({
                                            pendingTx,
                                            stage = 'sending', // 'sending', 'confirming', 'vrf'
                                            onCancel
                                        }) {
    const [elapsed, setElapsed] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const startTime = Date.now()

        const timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - startTime) / 1000)
            setElapsed(seconds)

            // Calculate progress based on stage and time
            if (stage === 'sending') {
                setProgress(Math.min(20, seconds * 4))
            } else if (stage === 'confirming') {
                setProgress(Math.min(40, 20 + seconds * 2))
            } else if (stage === 'vrf') {
                // VRF takes 30-90 seconds, so progress slowly
                setProgress(Math.min(95, 40 + Math.min(seconds / 90 * 55, 55)))
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [stage])

    const stages = [
        {
            id: 'sending',
            label: 'Sending Transaction',
            description: 'Confirm in your wallet',
            icon: Zap,
            color: 'blue',
            active: stage === 'sending'
        },
        {
            id: 'confirming',
            label: 'Confirming on Blockchain',
            description: 'Waiting for block confirmation',
            icon: Clock,
            color: 'yellow',
            active: stage === 'confirming'
        },
        {
            id: 'vrf',
            label: 'Generating Random Result',
            description: 'Chainlink VRF is working',
            icon: Loader2,
            color: 'purple',
            active: stage === 'vrf'
        }
    ]

    const currentStage = stages.find(s => s.id === stage)
    const StageIcon = currentStage?.icon

    const getEstimatedTime = () => {
        if (stage === 'sending') return '5-15 seconds'
        if (stage === 'confirming') return '10-20 seconds'
        if (stage === 'vrf') return '30-90 seconds'
        return 'Processing...'
    }

    const getColorClasses = (color) => {
        const colors = {
            blue: 'border-blue-500 bg-blue-50',
            yellow: 'border-yellow-500 bg-yellow-50',
            purple: 'border-purple-500 bg-purple-50'
        }
        return colors[color] || 'border-gray-500 bg-gray-50'
    }

    return (
        <div className="space-y-4">
            {/* Main Loading Card */}
            <div className={`border-2 rounded-lg p-6 ${getColorClasses(currentStage?.color)}`}>
                <div className="flex items-center justify-center mb-4">
                    {StageIcon && (
                        <StageIcon className={`w-12 h-12 ${stage === 'vrf' ? 'animate-spin' : ''} ${
                            stage === 'sending' ? 'text-blue-600' :
                                stage === 'confirming' ? 'text-yellow-600' :
                                    'text-purple-600'
                        }`} />
                    )}
                </div>

                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2">{currentStage?.label}</h3>
                    <p className="text-sm text-gray-600 mb-1">{currentStage?.description}</p>
                    <p className="text-xs text-gray-500">Estimated: {getEstimatedTime()}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${
                                stage === 'sending' ? 'bg-blue-600' :
                                    stage === 'confirming' ? 'bg-yellow-600' :
                                        'bg-purple-600'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{elapsed}s elapsed</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {/* Transaction Hash */}
                {pendingTx && (
                    <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
                        <div className="text-xs text-gray-600 mb-1">Transaction Hash:</div>
                        <div className="font-mono text-xs break-all text-gray-800">
                            {pendingTx.slice(0, 20)}...{pendingTx.slice(-20)}
                        </div>
                        <a
                            href={`https://testnet.bscscan.com/tx/${pendingTx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 inline-block"
                        >
                            View on BSCScan →
                        </a>
                    </div>
                )}

                {/* Stage Timeline */}
                <div className="space-y-2 mb-4">
                    {stages.map((s, idx) => {
                        const Icon = s.icon
                        const isComplete = stages.findIndex(st => st.id === stage) > idx
                        const isCurrent = s.id === stage

                        return (
                            <div
                                key={s.id}
                                className={`flex items-center gap-3 p-2 rounded ${
                                    isCurrent ? 'bg-white bg-opacity-70' : ''
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isComplete ? 'bg-green-500' :
                                        isCurrent ? 'bg-blue-500' :
                                            'bg-gray-300'
                                }`}>
                                    {isComplete ? (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                        <Icon className={`w-4 h-4 text-white ${isCurrent && s.id === 'vrf' ? 'animate-spin' : ''}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${
                                        isCurrent ? 'text-gray-900' : 'text-gray-600'
                                    }`}>
                                        {s.label}
                                    </div>
                                    {isCurrent && (
                                        <div className="text-xs text-gray-500">{s.description}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* What's Happening Explainer */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                    <div className="font-semibold text-blue-800 mb-1">💡 What's happening?</div>
                    <div className="text-blue-700 text-xs leading-relaxed">
                        {stage === 'sending' && "Waiting for you to approve the transaction in MetaMask."}
                        {stage === 'confirming' && "Your transaction is being added to the blockchain. This requires network confirmations for security."}
                        {stage === 'vrf' && "Chainlink VRF is generating a provably random number for the house's move. This ensures the game is completely fair and the outcome cannot be predicted or manipulated."}
                    </div>
                </div>
            </div>

            {/* Cancel Option */}
            {onCancel && (
                <div className="text-center">
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Cancel (result will still process)
                    </button>
                </div>
            )}
        </div>
    )
}
