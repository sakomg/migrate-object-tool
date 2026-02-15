import { LightningElement, api } from 'lwc'
// import { Drag } from './utils'

export default class MigrateObjectToolChooseFields extends LightningElement {
  @api loading
  _fieldPairs
  _soFieldOptions
  _boFieldOptions

  get soFieldOptions() {
    return this._soFieldOptions
  }

  @api
  set soFieldOptions(value) {
    this._soFieldOptions = [...value]
  }

  get boFieldOptions() {
    return this._boFieldOptions
  }

  @api
  set boFieldOptions(value) {
    this._boFieldOptions = [...value]
  }

  get fieldPairs() {
    return this._fieldPairs
  }

  @api
  set fieldPairs(value) {
    this._fieldPairs = [...value]
  }

  // get drag() {
  //   return new Drag(this._fieldPairs)
  // }

  handleDragStart(event) {
    // event.stopPropagation()
    // event.preventDefault()
    console.log('handleDragStart')
  }

  handleDragOver(event) {
    // event.stopPropagation()
    // event.preventDefault()
    console.log('handleDragOver')
    this.fireEvent('dragfieldpair', { detail: { currentIndex: 0, newIndex: 1 } })
  }

  handleDragEnd(event) {
    event.stopPropagation()
    event.preventDefault()

    console.log('ChooseField :: handleDragEnd')

    console.log('ChooseField :: handleDragEnd : after')
  }

  handleObjectFieldChange(event) {
    this.fireEvent('fieldchange', event)
  }

  handleDeleteIconClick(event) {
    this.fireEvent('deleteicon', event)
  }

  fireEvent(eventName, event) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: event.detail,
        bubbles: true,
        composed: true
      })
    )
  }
}