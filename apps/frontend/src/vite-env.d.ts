/// <reference types="vite/client" />

declare module 'react' {
  export type ReactNode = unknown
  export type FormEvent<T = Element> = {
    preventDefault: () => void
    currentTarget: T
  }
  export function StrictMode(props: { children?: ReactNode }): JSX.Element
  export function createContext<T>(defaultValue: T): {
    Provider: (props: { value: T; children?: ReactNode }) => JSX.Element
  }
  export function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: unknown[]): T
  export function useContext<T>(context: { Provider: (props: { value: T; children?: ReactNode }) => JSX.Element }): T
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void
  export function useMemo<T>(factory: () => T, deps: unknown[]): T
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void]
}

declare module 'react-dom/client' {
  export function createRoot(container: Element): {
    render: (children: unknown) => void
  }
}

declare namespace JSX {
  type Element = unknown
  interface IntrinsicElements {
    [elementName: string]: Record<string, unknown>
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: unknown
  export const jsxs: unknown
  export const Fragment: unknown
}
