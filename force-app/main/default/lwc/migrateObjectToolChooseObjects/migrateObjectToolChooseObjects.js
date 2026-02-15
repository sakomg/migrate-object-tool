import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolChooseObjects extends LightningElement {
  @api loading
  @api currentSObjectName
  @api currentBigObjectName

  _sObjectNameOptions
  _bigObjectNameOptions

  get sObjectNameOptions() {
    return this._sObjectNameOptions
  }

  @api
  set sObjectNameOptions(value) {
    this._sObjectNameOptions = [...value]
  }

  get bigObjectNameOptions() {
    return this._bigObjectNameOptions
  }

  @api
  set bigObjectNameOptions(value) {
    this._bigObjectNameOptions = [...value]
  }

  handleSObjectChange(event) {
    this.fireEvent('sobjectchange', event)
  }

  handleBigObjectChange(event) {
    this.fireEvent('bigobjectchange', event)
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