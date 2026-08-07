class ResizeObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
