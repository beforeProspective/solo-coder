<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let displayValue = '0'
  let storedValue: number | null = null
  let operator: string | null = null
  let waitingForNewValue = false
  let isDarkMode = true
  let pressedButton: string | null = null
  let touchStartX: number | null = null
  let touchStartY: number | null = null
  let isSwipeAction = false
  let mediaQuery: MediaQueryList | null = null

  const MAX_DIGITS = 16

  function handleThemeChange(e: MediaQueryListEvent) {
    isDarkMode = e.matches
  }

  onMount(() => {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode = mediaQuery.matches
    mediaQuery.addEventListener('change', handleThemeChange)
  })

  onDestroy(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  })

  $: fontSize = getFontSize(displayValue)

  function getFontSize(value: string): string {
    const length = value.replace(/[.,-]/g, '').length
    if (length <= 6) return '80px'
    if (length === 7) return '68px'
    if (length === 8) return '60px'
    if (length === 9) return '52px'
    if (length <= 12) return '42px'
    return '34px'
  }

  function formatDisplay(value: number): string {
    if (value === 0) return '0'
    
    if (!isFinite(value)) {
      return isNaN(value) ? 'Error' : (value > 0 ? '∞' : '-∞')
    }

    const isNegative = value < 0
    const absValue = Math.abs(value)
    
    if (absValue >= 1e16 || (absValue < 1e-10 && absValue > 0)) {
      const formatted = value.toExponential(8)
      return formatted
    }

    const rounded = Math.round(value * 1e16) / 1e16
    const absRounded = Math.abs(rounded)
    
    let str = absRounded.toString()
    
    const decimalIndex = str.indexOf('.')
    let integerPart: string
    let decimalPart: string
    
    if (decimalIndex !== -1) {
      integerPart = str.slice(0, decimalIndex)
      decimalPart = str.slice(decimalIndex + 1)
    } else {
      integerPart = str
      decimalPart = ''
    }

    if (integerPart.length > MAX_DIGITS) {
      const formatted = rounded.toExponential(8)
      return formatted
    }

    if (decimalPart.length > MAX_DIGITS - integerPart.length) {
      decimalPart = decimalPart.slice(0, MAX_DIGITS - integerPart.length)
    }

    while (decimalPart.length > 0 && decimalPart[decimalPart.length - 1] === '0') {
      decimalPart = decimalPart.slice(0, -1)
    }

    let result = integerPart
    if (decimalPart.length > 0) {
      result += '.' + decimalPart
    }

    return isNegative ? '-' + result : result
  }

  function inputDigit(digit: string) {
    if (waitingForNewValue) {
      displayValue = digit === '.' ? '0.' : digit
      waitingForNewValue = false
    } else {
      if (digit === '.') {
        if (displayValue.includes('.')) return
        displayValue += '.'
      } else {
        if (displayValue === '0' || displayValue === '-0') {
          displayValue = displayValue.startsWith('-') ? '-' + digit : digit
        } else {
          const cleanedValue = displayValue.replace(/[.,-]/g, '')
          if (cleanedValue.length >= MAX_DIGITS) return
          displayValue += digit
        }
      }
    }
  }

  function inputOperator(op: string) {
    const currentValue = parseFloat(displayValue)

    if (storedValue === null) {
      storedValue = currentValue
    } else if (operator) {
      const result = performCalculation(storedValue, currentValue, operator)
      storedValue = result
      displayValue = formatDisplay(result)
    }

    operator = op
    waitingForNewValue = true
  }

  function performCalculation(a: number, b: number, op: string): number {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
        return a * b
      case '÷':
        if (b === 0) return NaN
        return a / b
      default:
        return b
    }
  }

  function calculate() {
    if (storedValue === null || operator === null) return

    const currentValue = parseFloat(displayValue)
    const result = performCalculation(storedValue, currentValue, operator)
    
    displayValue = formatDisplay(result)
    storedValue = null
    operator = null
    waitingForNewValue = true
  }

  function clear() {
    displayValue = '0'
    storedValue = null
    operator = null
    waitingForNewValue = false
  }

  function toggleSign() {
    if (displayValue === '0') return
    if (displayValue.startsWith('-')) {
      displayValue = displayValue.slice(1)
    } else {
      displayValue = '-' + displayValue
    }
  }

  function percentage() {
    const value = parseFloat(displayValue)
    const result = value / 100
    displayValue = formatDisplay(result)
  }

  function backspace() {
    if (displayValue === 'Error' || displayValue === '∞' || displayValue === '-∞') {
      displayValue = '0'
      return
    }
    
    if (displayValue.length === 1) {
      displayValue = '0'
    } else if (displayValue.length === 2 && displayValue.startsWith('-')) {
      displayValue = '0'
    } else {
      displayValue = displayValue.slice(0, -1)
    }
  }

  function handleButtonPress(button: string, action: () => void) {
    pressedButton = button
    setTimeout(() => {
      pressedButton = null
    }, 100)
    action()
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    isSwipeAction = false
  }

  function handleTouchMove(e: TouchEvent) {
    if (touchStartX === null || touchStartY === null) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 30) {
      if (!isSwipeAction) {
        isSwipeAction = true
        backspace()
        touchStartX = touch.clientX
      }
    }
  }

  function handleTouchEnd() {
    touchStartX = null
    touchStartY = null
    isSwipeAction = false
  }

  function handleMouseDown(e: MouseEvent) {
    touchStartX = e.clientX
    isSwipeAction = false
  }

  function handleMouseMove(e: MouseEvent) {
    if (touchStartX === null) return
    
    const deltaX = e.clientX - touchStartX
    
    if (deltaX > 50) {
      if (!isSwipeAction) {
        isSwipeAction = true
        backspace()
        touchStartX = e.clientX
      }
    }
  }

  function handleMouseUp() {
    touchStartX = null
    isSwipeAction = false
  }
</script>

<div class="calculator" class:dark={isDarkMode} class:light={!isDarkMode}>
  <div 
    class="display"
    role="button"
    tabindex="0"
    aria-label="显示区域，向右滑动可删除最后一位数字"
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
  >
    <div class="display-value" style="font-size: {fontSize}">
      {displayValue}
    </div>
  </div>

  <div class="buttons">
    <button 
      class="btn btn-function"
      class:pressed={pressedButton === 'AC'}
      on:click={() => handleButtonPress('AC', clear)}
    >
      {storedValue !== null || operator !== null || displayValue !== '0' ? 'AC' : 'AC'}
    </button>
    <button 
      class="btn btn-function"
      class:pressed={pressedButton === '+/-'}
      on:click={() => handleButtonPress('+/-', toggleSign)}
    >
      +/-
    </button>
    <button 
      class="btn btn-function"
      class:pressed={pressedButton === '%'}
      on:click={() => handleButtonPress('%', percentage)}
    >
      %
    </button>
    <button 
      class="btn btn-operator"
      class:pressed={pressedButton === '÷'}
      class:active={operator === '÷' && waitingForNewValue}
      on:click={() => handleButtonPress('÷', () => inputOperator('÷'))}
    >
      ÷
    </button>

    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '7'}
      on:click={() => handleButtonPress('7', () => inputDigit('7'))}
    >
      7
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '8'}
      on:click={() => handleButtonPress('8', () => inputDigit('8'))}
    >
      8
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '9'}
      on:click={() => handleButtonPress('9', () => inputDigit('9'))}
    >
      9
    </button>
    <button 
      class="btn btn-operator"
      class:pressed={pressedButton === '×'}
      class:active={operator === '×' && waitingForNewValue}
      on:click={() => handleButtonPress('×', () => inputOperator('×'))}
    >
      ×
    </button>

    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '4'}
      on:click={() => handleButtonPress('4', () => inputDigit('4'))}
    >
      4
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '5'}
      on:click={() => handleButtonPress('5', () => inputDigit('5'))}
    >
      5
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '6'}
      on:click={() => handleButtonPress('6', () => inputDigit('6'))}
    >
      6
    </button>
    <button 
      class="btn btn-operator"
      class:pressed={pressedButton === '-'}
      class:active={operator === '-' && waitingForNewValue}
      on:click={() => handleButtonPress('-', () => inputOperator('-'))}
    >
      −
    </button>

    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '1'}
      on:click={() => handleButtonPress('1', () => inputDigit('1'))}
    >
      1
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '2'}
      on:click={() => handleButtonPress('2', () => inputDigit('2'))}
    >
      2
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '3'}
      on:click={() => handleButtonPress('3', () => inputDigit('3'))}
    >
      3
    </button>
    <button 
      class="btn btn-operator"
      class:pressed={pressedButton === '+'}
      class:active={operator === '+' && waitingForNewValue}
      on:click={() => handleButtonPress('+', () => inputOperator('+'))}
    >
      +
    </button>

    <button 
      class="btn btn-number btn-zero"
      class:pressed={pressedButton === '0'}
      on:click={() => handleButtonPress('0', () => inputDigit('0'))}
    >
      0
    </button>
    <button 
      class="btn btn-number"
      class:pressed={pressedButton === '.'}
      on:click={() => handleButtonPress('.', () => inputDigit('.'))}
    >
      .
    </button>
    <button 
      class="btn btn-operator"
      class:pressed={pressedButton === '='}
      on:click={() => handleButtonPress('=', calculate)}
    >
      =
    </button>
  </div>
</div>

<style lang="scss">
  .calculator {
    width: 100%;
    max-width: 400px;
    height: 100%;
    max-height: 812px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    position: relative;
    box-sizing: border-box;
    border-width: 2px;
    border-style: solid;
  }

  .calculator.dark {
    background-color: #000000;
    border-color: #444444;
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.15) inset,
      0 0 0 2px rgba(255, 255, 255, 0.08) inset,
      0 25px 50px rgba(0, 0, 0, 0.6),
      0 10px 20px rgba(0, 0, 0, 0.4);
  }

  .calculator.light {
    background-color: #f2f2f7;
    border-color: #c7c7cc;
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.05) inset,
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.08);
  }

  @media (min-width: 480px) {
    .calculator {
      border-radius: 40px;
      padding: 30px;
      height: auto;
      max-height: none;
      margin: 20px;
    }
  }

  @media (max-width: 479px) {
    .calculator {
      border-radius: 0;
      padding: 20px;
      padding-bottom: env(safe-area-inset-bottom, 20px);
    }
  }

  .display {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 0 10px 20px;
    min-height: 140px;
    cursor: pointer;
  }

  .calculator.light .display {
    color: #000000;
  }

  .calculator.dark .display {
    color: #ffffff;
  }

  .display-value {
    font-weight: 200;
    line-height: 1.1;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    transition: font-size 0.15s ease;
    word-break: break-all;
  }

  .buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 80px);
    gap: 12px;
  }

  @media (max-width: 480px) {
    .buttons {
      grid-template-rows: repeat(5, 72px);
      gap: 10px;
    }
  }

  .btn {
    border: none;
    border-radius: 50%;
    font-size: 32px;
    font-weight: 300;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.1s ease, background-color 0.1s ease, filter 0.1s ease;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    overflow: hidden;
  }

  .btn-zero {
    grid-column: span 2;
    border-radius: 40px;
    justify-content: flex-start;
    padding-left: 32px;
  }

  .btn.pressed {
    transform: scale(0.92);
  }

  .btn:active {
    transform: scale(0.92);
  }

  .btn:focus {
    outline: none;
  }

  .btn:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  .btn-number {
    background-color: #333333;
    color: #ffffff;
  }

  .calculator.light .btn-number {
    background-color: #e3e3e8;
    color: #000000;
  }

  .btn-number.pressed {
    background-color: #5a5a5a;
  }

  .calculator.light .btn-number.pressed {
    background-color: #d1d1d6;
  }

  .btn-operator {
    background-color: #ff9f0a;
    color: #ffffff;
    font-size: 36px;
  }

  .calculator.light .btn-operator {
    background-color: #ff9f0a;
    color: #ffffff;
  }

  .btn-operator.pressed,
  .btn-operator.active {
    background-color: #ffcc80;
  }

  .calculator.light .btn-operator.pressed,
  .calculator.light .btn-operator.active {
    background-color: #ffcc80;
  }

  .btn-function {
    background-color: #a5a5a5;
    color: #000000;
    font-size: 28px;
    font-weight: 400;
  }

  .calculator.light .btn-function {
    background-color: #d1d1d6;
    color: #000000;
  }

  .btn-function.pressed {
    background-color: #d4d4d4;
  }

  .calculator.light .btn-function.pressed {
    background-color: #e3e3e8;
  }
</style>
