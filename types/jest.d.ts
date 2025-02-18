import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveBeenCalledWith(...args: any[]): R
      toHaveClass(...classNames: string[]): R
      toHaveBeenCalledTimes(times: number): R
      toHaveFocus(): R
    }
  }
}
