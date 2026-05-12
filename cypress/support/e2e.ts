import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Hydration') ||
    err.message.includes('hydration') ||
    err.message.includes('ResizeObserver') ||
    err.message.includes('NEXT_NOT_FOUND') ||
    err.message.includes('NEXT_REDIRECT')
  ) {
    return false
  }
})
