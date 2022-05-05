// import { useCallback, useEffect, useReducer, useRef } from 'react'

// type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>

// type Curried<A extends any[], R> =
//     <P extends Partial<A>>(...args: P) => P extends A ? R :
//         A extends [...SameLength<P>, ...infer S] ? S extends any[] ? Curried<S, R>
//         : never : never

// function curry<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
//     return (...args: any[]): any =>
//     args.length >= fn.length ? fn(...args as any) : curry((fn as any).bind(undefined, ...args))
// }

// const _ascend = <T>(f: (sortable: T) => number, a: T, b: T): number => {
//   const aa = f(a)
//   const bb = f(b)
//   if (aa < bb) return -1
//   if (aa > bb) return 1
//   return 0
// }
// type ascend<T> = Curried<[(x: T) => number, T, T], number>
// export const ascend = curry(_ascend)

export const descend = <T>(f: (sortable: T) => number) => (a: T, b: T): 1 | 0 | -1 => {
  const aa = f(a)
  const bb = f(b)
  if (aa > bb) return -1
  if (aa < bb) return 1
  return 0
}

export function isNotNullish<T>(x: T | null | undefined): x is T {
  return x != null
}

// const _reduceBy = <T, R>(
//   valueFn: (a: R | null, b: T) => R,
//   keyFn: (x: T) => string,
//   a: T[]
// ) => a.reduce((acc: { [k: string]: R }, elt: T) => {
//     const key = keyFn(elt)
//     if (_has(key, acc)) acc[key] = valueFn(acc[key], elt)
//     acc[key] = valueFn(null, elt)
//     return acc
// }, {})

// export const reduceBy = curry(_reduceBy)
// export const groupBy = reduceBy((a, b) => (a == null ? [] : a).concat(b))
// export const countBy = reduceBy((a, b) => (a == null ? 1 : a) + 1)

// const _on = <T, U, R>(
//     f: Curried<[U, U], R>,
//     g: (x: T) => U,
//     a: T,
//     b: T
// ): R => f(g(a))(g(b))
// export const on = curry(_on)

// interface Named { name: string }
// const list: Named[] = [{ name: 'FOO' }, { name: 'bar' }]

// const _localeCompare = (a: string, b: string) => a.localeCompare(b)
// const localeCompare = curry(_localeCompare)
// const getLowerTitle = <T,>(x: T extends Named ? T : never) => x.name.toLowerCase()
// const orderByTitle = on(localeCompare)(getLowerTitle)

// getLowerTitle({ name: '', x: 1 })
// list.sort(orderByTitle)
