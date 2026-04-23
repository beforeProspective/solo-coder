import React from 'react'
import { WeightValue } from '../types'
import { WEIGHT_TYPES, COLORS } from '../constants'

interface WeightTrayProps {
  onWeightSelect: (value: WeightValue) => void
  availableWeights: { value: WeightValue; count: number }[]
}

const WeightTray: React.FC<WeightTrayProps> = ({ onWeightSelect, availableWeights }) => {
  const getWeightColor = (value: WeightValue) => {
    switch (value) {
      case 1:
        return COLORS.weight1
      case 2:
        return COLORS.weight2
      case 5:
        return COLORS.weight5
    }
  }

  const getWeightCount = (value: WeightValue): number => {
    const weightInfo = availableWeights.find((w) => w.value === value)
    return weightInfo ? weightInfo.count : 5
  }

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${COLORS.woodDark} 0%, ${COLORS.background} 50%, ${COLORS.woodDark} 100%)`,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: `3px solid ${COLORS.metalDark}`,
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
        砝码托盘
      </h3>

      <div
        style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {WEIGHT_TYPES.map((weightType) => {
          const count = getWeightCount(weightType.value)
          const isAvailable = count > 0

          return (
            <div
              key={weightType.value}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <button
                onClick={() => isAvailable && onWeightSelect(weightType.value)}
                disabled={!isAvailable}
                style={{
                  width: '80px',
                  height: '60px',
                  borderRadius: '8px',
                  border: `3px solid ${COLORS.metalDark}`,
                  background: isAvailable
                    ? `linear-gradient(135deg, ${getWeightColor(weightType.value)} 0%, ${getWeightColor(weightType.value)} 100%)`
                    : COLORS.metalDark,
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: isAvailable ? 'grab' : 'not-allowed',
                  boxShadow: isAvailable
                    ? `0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                    : 'none',
                  transition: 'all 0.2s ease',
                  opacity: isAvailable ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 6px 12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                  }
                }}
              >
                {weightType.label}
              </button>
              <span
                style={{
                  color: COLORS.text,
                  fontSize: '14px',
                  opacity: 0.8,
                }}
              >
                剩余: {count}
              </span>
            </div>
          )
        })}
      </div>

      <p
        style={{
          color: COLORS.text,
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '15px',
          opacity: 0.7,
        }}
      >
        点击砝码选择，然后点击杠杆上的挂钩放置
      </p>
    </div>
  )
}

export default WeightTray
