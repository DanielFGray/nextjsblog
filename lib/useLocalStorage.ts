import { useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key)
        const x = item ? (JSON.parse(item) as T) : initialValue
        return x
      } catch (error) {
        console.log(error)
        return initialValue
      }
    }
    return initialValue
  })

  function setValue(value: T | ((val: T) => T)) {
    try {
      setStoredValue(oldValue => {
        const newValue = value instanceof Function ? value(oldValue) : value
        window.localStorage.setItem(key, JSON.stringify(newValue))
        return newValue
      })
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
