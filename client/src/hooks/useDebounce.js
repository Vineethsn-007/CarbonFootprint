import { useState, useCallback, useRef } from 'react'

/**
 * Debounce a callback function
 * @param {Function} fn - function to debounce
 * @param {number} delay - delay in ms
 */
export function useDebounce(fn, delay = 300) {
  const timer = useRef(null)

  const debounced = useCallback(
    (...args) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => fn(...args), delay)
    },
    [fn, delay]
  )

  return debounced
}

/**
 * Debounced value hook
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timer = useRef(null)

  const update = useCallback(
    (val) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setDebouncedValue(val), delay)
    },
    [delay]
  )

  update(value)
  return debouncedValue
}
