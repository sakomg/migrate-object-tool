export class Drag {
  constructor(array) {
    this.array = array
  }
  start(e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', null)
    this._el = e.target
  }
  over(e) {
    if (isBefore(this._el, e.target)) {
      e.target.parentNode.insertBefore(this._el, e.target)
    } else {
      e.target.parentNode.insertBefore(this._el, e.target.nextSibling)
    }
  }
  end(e) {
    this.array.splice(
      0,
      this.array.length,
      ...Array.from(e.target.parentNode.children).map((item) => this.array[item.dataset.index])
    )
  }
}

function isBefore(el1, el2) {
  if (el2.parentNode === el1.parentNode) {
    for (let cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling) {
      return cur === el2
    }
  }
  return false
}