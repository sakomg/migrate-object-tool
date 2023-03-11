export class Drag {
  constructor(array) {
    this.array = array
  }
  start(e) {
    console.log('start')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', null)
    this._el = e.target
  }
  over(e) {
    console.log('over')

    if (isBefore(this._el, e.target)) {
      console.log('over :: isBefore: true')

      e.target.parentNode.insertBefore(this._el, e.target)
    } else {
      console.log('over :: isBefore: false')
      console.log('e.target.nextSibling: ', JSON.stringify(e.target.nextSibling))
      console.log('e.target: ', e.currentTarget.dataset.index)
      console.log('this._el: ', JSON.stringify(this._el))
      // console.log(' e.target.parentNode: ', e.target.parentNode)

      e.target.parentNode.insertBefore(this._el, e.target.nextSibling)
    }
  }
  end(e) {
    console.log('end')

    this.array.splice(
      0,
      this.array.length,
      ...Array.from(e.target.parentNode.children).map((item) => this.array[item.dataset.index])
    )
  }
}

function isBefore(el1, el2) {
  console.log('isBefore')
  if (el2.parentNode === el1.parentNode) {
    for (let cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling) {
      return cur === el2
    }
  }
  return false
}
