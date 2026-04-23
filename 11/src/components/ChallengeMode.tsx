import React, { useState, useEffect } from 'react'
import { FulcrumPosition, Weight } from '../types'
import { generateChallenge, checkChallengeComplete, calculateTorque, calculateHooks } from '../utils'
import { COLORS } from '../constants'

interface ChallengeModeProps {
  isActive: boolean
  currentWeights: Weight[]
  currentFulcrum: FulcrumPosition
  onStartChallenge: (weights: Weight[], fulcrum: FulcrumPosition) => void
  onResetToChallenge: () => void
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({
  isActive,
  currentWeights,
  currentFulcrum,
  onStartChallenge,
  onResetToChallenge,
}) => {
  const [challenge, setChallenge] = useState<{
    weights: Weight[]
    fulcrumPosition: FulcrumPosition
    targetWeightCount: number
    hint: string
  } | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [addedWeightCount, setAddedWeightCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const startNewChallenge = () => {
    const newChallenge = generateChallenge()
    setChallenge(newChallenge)
    setIsComplete(false)
    setShowSuccess(false)
    setAddedWeightCount(0)
    onStartChallenge(newChallenge.weights, newChallenge.fulcrumPosition)
  }

  useEffect(() => {
    if (!isActive || !challenge) return

    const currentCount = currentWeights.length - challenge.weights.length
    setAddedWeightCount(currentCount)

    const complete = checkChallengeComplete(
      challenge.weights,
      currentWeights,
      currentFulcrum,
      challenge.targetWeightCount
    )

    if (complete && !isComplete) {
      setIsComplete(true)
      setShowSuccess(true)
    }
  }, [isActive, challenge, currentWeights, currentFulcrum, isComplete])

  const getChallengeStats = () => {
    if (!challenge) return null

    const hooks = calculateHooks(currentFulcrum)
    const torque = calculateTorque(currentWeights, hooks)
    const initialTorque = calculateTorque(challenge.weights, hooks)

    return {
      currentLeftTorque: torque.leftTorque,
      currentRightTorque: torque.rightTorque,
      initialLeftTorque: initialTorque.leftTorque,
      initialRightTorque: initialTorque.rightTorque,
    }
  }

  const stats = getChallengeStats()

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${COLORS.woodDark} 0%, ${COLORS.background} 50%, ${COLORS.woodDark} 100%)`,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: `3px solid ${isActive ? COLORS.gold : COLORS.metalDark}`,
        minWidth: '280px',
      }}
    >
      <h3
        style={{
          color: isActive ? COLORS.gold : COLORS.text,
          margin: '0 0 15px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        🔬 任务挑战
      </h3>

      {!isActive ? (
        <div>
          <p
            style={{
              color: COLORS.text,
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '15px',
              opacity: 0.8,
            }}
          >
            接受挑战，用最少的砝码让杠杆恢复平衡！
          </p>
          <button
            onClick={startNewChallenge}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: `2px solid ${COLORS.gold}`,
              background: `rgba(255, 215, 0, 0.2)`,
              color: COLORS.gold,
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(255, 215, 0, 0.4)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(255, 215, 0, 0.2)`
            }}
          >
            开始挑战
          </button>
        </div>
      ) : (
        <div>
          {showSuccess && (
            <div
              style={{
                padding: '15px',
                borderRadius: '8px',
                background: `rgba(76, 175, 80, 0.2)`,
                border: `2px solid ${COLORS.balance}`,
                marginBottom: '15px',
                textAlign: 'center',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  marginBottom: '8px',
                }}
              >
                🎉
              </div>
              <span
                style={{
                  color: COLORS.balance,
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                挑战成功！
              </span>
              <p
                style={{
                  color: COLORS.text,
                  fontSize: '12px',
                  marginTop: '5px',
                  opacity: 0.8,
                }}
              >
                用了 {addedWeightCount} 个砝码完成挑战
              </p>
            </div>
          )}

          {challenge && (
            <div
              style={{
                padding: '15px',
                background: `rgba(0, 0, 0, 0.2)`,
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              <h4
                style={{
                  color: COLORS.text,
                  margin: '0 0 10px 0',
                  fontSize: '14px',
                }}
              >
                挑战目标
              </h4>
              <p
                style={{
                  color: COLORS.text,
                  fontSize: '13px',
                  margin: '0 0 10px 0',
                  opacity: 0.9,
                }}
              >
                {challenge.hint}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: `rgba(255, 215, 0, 0.1)`,
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.gold}`,
                }}
              >
                <span style={{ color: COLORS.text, fontSize: '13px' }}>
                  最多使用砝码:
                </span>
                <span
                  style={{
                    color: COLORS.gold,
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {challenge.targetWeightCount} 个
                </span>
              </div>

              {stats && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px',
                    background: `rgba(0, 0, 0, 0.2)`,
                    borderRadius: '4px',
                  }}
                >
                  <p
                    style={{
                      color: COLORS.text,
                      fontSize: '12px',
                      margin: '0 0 5px 0',
                      opacity: 0.7,
                    }}
                  >
                    初始力矩:
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: COLORS.weight1, fontSize: '12px' }}>
                      左: {stats.initialLeftTorque.toFixed(1)}
                    </span>
                    <span style={{ color: COLORS.weight2, fontSize: '12px' }}>
                      右: {stats.initialRightTorque.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <button
              onClick={startNewChallenge}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${COLORS.metalDark}`,
                background: `rgba(0, 0, 0, 0.2)`,
                color: COLORS.text,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(0, 0, 0, 0.4)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(0, 0, 0, 0.2)`
              }}
            >
              新挑战
            </button>
            <button
              onClick={onResetToChallenge}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${COLORS.metalDark}`,
                background: `rgba(0, 0, 0, 0.2)`,
                color: COLORS.text,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(0, 0, 0, 0.4)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(0, 0, 0, 0.2)`
              }}
            >
              重置
            </button>
          </div>

          <div
            style={{
              padding: '10px',
              borderRadius: '6px',
              background: addedWeightCount <= (challenge?.targetWeightCount || 0)
                ? `rgba(76, 175, 80, 0.2)`
                : `rgba(255, 107, 107, 0.2)`,
              border: `1px solid ${
                addedWeightCount <= (challenge?.targetWeightCount || 0)
                  ? COLORS.balance
                  : COLORS.unbalance
              }`,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color:
                  addedWeightCount <= (challenge?.targetWeightCount || 0)
                    ? COLORS.balance
                    : COLORS.unbalance,
                fontSize: '13px',
              }}
            >
              已使用: {addedWeightCount} 个砝码
              {addedWeightCount > (challenge?.targetWeightCount || 0) && ' (超出限制!)'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChallengeMode
