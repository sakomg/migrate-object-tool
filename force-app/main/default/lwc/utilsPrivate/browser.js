export const isIE11 = isIE11Test(navigator)
export const isChrome = isChromeTest(navigator)
export const isSafari = isSafariTest(navigator)

export function isIE11Test(navigator) {
  return /Trident.*rv[ :]*11\./.test(navigator.userAgent)
}

export function isChromeTest(navigator) {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
}

export function isSafariTest(navigator) {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}