import React from 'react'
import { FulcrumPosition, Weight, Preset } from '../types'
import { calculateTorque, calculateHooks, generateId } from '../utils'
import { FULCRUM_POSITIONS, COLORS } from '../constants'

interface ControlPanelProps {
  weights: Weight[]
  fulcrumPosition: FulcrumPosition
  onFulcrumChange: (position: FulcrumPosition) => void
  presets: Preset[]
  onSavePreset: (name: string) => void
  onLoadPreset: (presetId: string) => void
  onDeletePreset: (presetId: string) => void
  onReset: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  weights,
  fulcrumPosition,
  onFulcrumChange,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onReset,
}) => {
  const hooks = calculateHooks(fulcrumPosition)
  const torque = calculateTorque(weights, hooks)
  const [newPresetName, setNewPresetName] = React.useState('')

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${COLORS.woodDark} 0%, ${COLORS.background} 50%, ${COLORS.woodDark} 100%)`,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: `3px solid ${COLORS.metalDark}`,
        minWidth: '280px',
      }}
    >
      <h3
        style={{
          color: COLORS.text,
          margin: '0 0 15px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        控制面板
      </h3>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: `rgba(0, 0, 0, 0.2)`,
          borderRadius: '8px',
          border: `1px solid ${COLORS.metalDark}`,
        }}
      >
        <h4
          style={{
            color: COLORS.text,
            margin: '0 0 10px 0',
            fontSize: '14px',
          }}
        >
          力矩计算
        </h4>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: `rgba(74, 144, 217, 0.2)`,
              borderRadius: '4px',
            }}
          >
            <span style={{ color: COLORS.text, fontSize: '14px' }}>左侧力矩:</span>
            <span
              style={{
                color: COLORS.weight1,
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {torque.leftTorque.toFixed(1)} N·cm
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: `rgba(231, 76, 60, 0.2)`,
              borderRadius: '4px',
            }}
          >
            <span style={{ color: COLORS.text, fontSize: '14px' }}>右侧力矩:</span>
            <span
              style={{
                color: COLORS.weight2,
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {torque.rightTorque.toFixed(1)} N·cm
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            borderRadius: '6px',
            textAlign: 'center',
            background: torque.isBalanced
              ? `rgba(76, 175, 80, 0.2)`
              : `rgba(255, 107, 107, 0.2)`,
            border: `2px solid ${
              torque.isBalanced ? COLORS.balance : COLORS.unbalance
            }`,
          }}
        >
          <span
            style={{
              color: torque.isBalanced ? COLORS.balance : COLORS.unbalance,
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {torque.isBalanced ? '✓ 平衡状态' : '✗ 不平衡状态'}
          </span>
        </div>

        {!torque.isBalanced && (
          <p
            style={{
              color: COLORS.text,
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '10px',
              opacity: 0.8,
            }}
          >
            力矩差: {Math.abs(torque.leftTorque - torque.rightTorque).toFixed(1)} N·cm
          </p>
        )}
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: `rgba(0, 0, 0, 0.2)`,
          borderRadius: '8px',
          border: `1px solid ${COLORS.metalDark}`,
        }}
      >
        <h4
          style={{
            color: COLORS.text,
            margin: '0 0 10px 0',
            fontSize: '14px',
          }}
        >
          支点位置
        </h4>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {Object.values(FULCRUM_POSITIONS).map((option) => (
            <button
              key={option.value}
              onClick={() => onFulcrumChange(option.value as FulcrumPosition)}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: `2px solid ${
                  fulcrumPosition === option.value ? COLORS.gold : COLORS.metalDark
                }`,
                background:
                  fulcrumPosition === option.value
                    ? `rgba(255, 215, 0, 0.2)`
                    : `rgba(0, 0, 0, 0.2)`,
                color:
                  fulcrumPosition === option.value ? COLORS.gold : COLORS.text,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (fulcrumPosition !== option.value) {
                  e.currentTarget.style.background = `rgba(0, 0, 0, 0.4)`
                }
              }}
              onMouseLeave={(e) => {
                if (fulcrumPosition !== option.value) {
                  e.currentTarget.style.background = `rgba(0, 0, 0, 0.2)`
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          background: `rgba(0, 0, 0, 0.2)`,
          borderRadius: '8px',
          border: `1px solid ${COLORS.metalDark}`,
        }}
      >
        <h4
          style={{
            color: COLORS.text,
            margin: '0 0 10px 0',
            fontSize: '14px',
          }}
        >
          预设管理
        </h4>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <input
            type="text"
            placeholder="预设名称"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.metalDark}`,
              background: `rgba(0, 0, 0, 0.3)`,
              color: COLORS.text,
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => {
              if (newPresetName.trim()) {
                onSavePreset(newPresetName.trim())
                setNewPresetName('')
              }
            }}
            disabled={!newPresetName.trim()}
            style={{
              padding: '8px 15px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.metalDark}`,
              background: newPresetName.trim() ? COLORS.balance : COLORS.metalDark,
              color: 'white',
              fontSize: '14px',
              cursor: newPresetName.trim() ? 'pointer' : 'not-allowed',
              opacity: newPresetName.trim() ? 1 : 0.5,
            }}
          >
            保存
          </button>
        </div>

        {presets.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            {presets.map((preset) => (
              <div
                key={preset.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: '8px',
                  background: `rgba(0, 0, 0, 0.2)`,
                  borderRadius: '4px',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    color: COLORS.text,
                    fontSize: '13px',
                  }}
                >
                  {preset.name}
                </span>
                <button
                  onClick={() => onLoadPreset(preset.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: COLORS.metalLight,
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  加载
                </button>
                <button
                  onClick={() => onDeletePreset(preset.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: COLORS.unbalance,
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: `2px solid ${COLORS.unbalance}`,
          background: `rgba(255, 107, 107, 0.2)`,
          color: COLORS.unbalance,
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(255, 107, 107, 0.4)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `rgba(255, 107, 107, 0.2)`
        }}
      >
        重置杠杆
      </button>
    </div>
  )
}

export default ControlPanel
