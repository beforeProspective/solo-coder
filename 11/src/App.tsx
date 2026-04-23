import React, { useState, useEffect } from 'react'
import LeverCanvas from './components/LeverCanvas'
import WeightTray from './components/WeightTray'
import ControlPanel from './components/ControlPanel'
import ChallengeMode from './components/ChallengeMode'
import { FulcrumPosition, Weight, Preset, WeightValue } from './types'
import { calculateTorque, calculateHooks, generateId } from './utils'
import { COLORS, WEIGHT_TYPES } from './constants'

const App: React.FC = () => {
  const [weights, setWeights] = useState<Weight[]>([])
  const [fulcrumPosition, setFulcrumPosition] = useState<FulcrumPosition>('center')
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedWeight, setSelectedWeight] = useState<WeightValue | null>(null)

  const [challengeActive, setChallengeActive] = useState(false)
  const [challengeInitial, setChallengeInitial] = useState<{
    weights: Weight[]
    fulcrum: FulcrumPosition
  } | null>(null)

  useEffect(() => {
    const savedPresets = localStorage.getItem('lever-lab-presets')
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets))
      } catch {
        console.error('Failed to load presets')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lever-lab-presets', JSON.stringify(presets))
  }, [presets])

  const availableWeights = WEIGHT_TYPES.map((wt) => {
    const usedCount = weights.filter((w) => w.value === wt.value).length
    const maxCount = 5
    return {
      value: wt.value,
      count: maxCount - usedCount,
    }
  })

  const handleWeightSelect = (value: WeightValue) => {
    setSelectedWeight(value)
  }

  const handleClearSelectedWeight = () => {
    setSelectedWeight(null)
  }

  const handleFulcrumChange = (position: FulcrumPosition) => {
    setFulcrumPosition(position)
  }

  const handleSavePreset = (name: string) => {
    const newPreset: Preset = {
      id: generateId(),
      name,
      weights: JSON.parse(JSON.stringify(weights)),
      fulcrumPosition,
    }
    setPresets((prev) => [...prev, newPreset])
  }

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      setWeights(JSON.parse(JSON.stringify(preset.weights)))
      setFulcrumPosition(preset.fulcrumPosition)
      setChallengeActive(false)
      setChallengeInitial(null)
    }
  }

  const handleDeletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId))
  }

  const handleReset = () => {
    setWeights([])
    setFulcrumPosition('center')
    setSelectedWeight(null)
    setChallengeActive(false)
    setChallengeInitial(null)
  }

  const handleStartChallenge = (
    challengeWeights: Weight[],
    challengeFulcrum: FulcrumPosition
  ) => {
    setChallengeActive(true)
    setChallengeInitial({
      weights: JSON.parse(JSON.stringify(challengeWeights)),
      fulcrum: challengeFulcrum,
    })
    setWeights(JSON.parse(JSON.stringify(challengeWeights)))
    setFulcrumPosition(challengeFulcrum)
    setSelectedWeight(null)
  }

  const handleResetToChallenge = () => {
    if (challengeInitial) {
      setWeights(JSON.parse(JSON.stringify(challengeInitial.weights)))
      setFulcrumPosition(challengeInitial.fulcrum)
      setSelectedWeight(null)
    }
  }

  const hooks = calculateHooks(fulcrumPosition)
  const torque = calculateTorque(weights, hooks)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #1a0f0a 0%, #2c1810 50%, #1a0f0a 100%)`,
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            color: COLORS.gold,
            margin: '0 0 10px 0',
            fontSize: '32px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '2px',
          }}
        >
          ⚖️ 杠杆原理探究实验室
        </h1>
        <p
          style={{
            color: COLORS.text,
            margin: 0,
            fontSize: '16px',
            opacity: 0.8,
          }}
        >
          探索力矩平衡条件: 动力 × 动力臂 = 阻力 × 阻力臂
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            minWidth: '600px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              position: 'relative',
              cursor: selectedWeight ? 'crosshair' : 'default',
            }}
          >
            {selectedWeight && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '8px 20px',
                  background: `rgba(255, 215, 0, 0.9)`,
                  color: COLORS.woodDark,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  zIndex: 10,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                已选择 {selectedWeight}N 砝码 - 点击挂钩放置
              </div>
            )}
            <LeverCanvas
              weights={weights}
              fulcrumPosition={fulcrumPosition}
              selectedWeight={selectedWeight}
              onWeightsChange={setWeights}
              onClearSelectedWeight={handleClearSelectedWeight}
            />
          </div>

          <WeightTray
            onWeightSelect={handleWeightSelect}
            availableWeights={availableWeights}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <ControlPanel
            weights={weights}
            fulcrumPosition={fulcrumPosition}
            onFulcrumChange={handleFulcrumChange}
            presets={presets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onReset={handleReset}
          />

          <ChallengeMode
            isActive={challengeActive}
            currentWeights={weights}
            currentFulcrum={fulcrumPosition}
            onStartChallenge={handleStartChallenge}
            onResetToChallenge={handleResetToChallenge}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          background: `rgba(0, 0, 0, 0.3)`,
          borderRadius: '12px',
          maxWidth: '900px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <h3
          style={{
            color: COLORS.gold,
            margin: '0 0 15px 0',
            fontSize: '18px',
            textAlign: 'center',
          }}
        >
          📚 使用说明
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: `rgba(0, 0, 0, 0.2)`,
              borderRadius: '8px',
            }}
          >
            <h4 style={{ color: COLORS.text, margin: '0 0 8px 0', fontSize: '14px' }}>
              1. 放置砝码
            </h4>
            <p style={{ color: COLORS.text, margin: 0, fontSize: '12px', opacity: 0.8 }}>
              点击砝码托盘选择砝码，然后点击杠杆上的挂钩放置。也可以直接拖动已放置的砝码。
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              background: `rgba(0, 0, 0, 0.2)`,
              borderRadius: '8px',
            }}
          >
            <h4 style={{ color: COLORS.text, margin: '0 0 8px 0', fontSize: '14px' }}>
              2. 观察力矩
            </h4>
            <p style={{ color: COLORS.text, margin: 0, fontSize: '12px', opacity: 0.8 }}>
              右侧面板实时显示左右力矩。杠杆会根据力矩差自动倾斜。
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              background: `rgba(0, 0, 0, 0.2)`,
              borderRadius: '8px',
            }}
          >
            <h4 style={{ color: COLORS.text, margin: '0 0 8px 0', fontSize: '14px' }}>
              3. 切换支点
            </h4>
            <p style={{ color: COLORS.text, margin: 0, fontSize: '12px', opacity: 0.8 }}>
              尝试不同的支点位置，体验省力杠杆、费力杠杆和等臂杠杆。
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              background: `rgba(0, 0, 0, 0.2)`,
              borderRadius: '8px',
            }}
          >
            <h4 style={{ color: COLORS.text, margin: '0 0 8px 0', fontSize: '14px' }}>
              4. 挑战模式
            </h4>
            <p style={{ color: COLORS.text, margin: 0, fontSize: '12px', opacity: 0.8 }}>
              接受挑战，用最少的砝码让杠杆恢复平衡，测试你的物理直觉！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
