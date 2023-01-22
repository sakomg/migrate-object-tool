import { LightningElement, api } from 'lwc'
import { Drag } from './utils'

export default class MigrateObjectToolChooseFields extends LightningElement {
  @api loading
  @api soFieldOptions
  @api boFieldOptions
  _fieldPairs

  get fieldPairs() {
    return this._fieldPairs
  }

  @api
  set fieldPairs(value) {
    this._fieldPairs = [...value]
  }

  get drag() {
    return new Drag(this._fieldPairs)
  }

  handleDragEnd(event) {
    this.drag.end(event)
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
