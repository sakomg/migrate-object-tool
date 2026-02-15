import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolConditions extends LightningElement {
  @api loading

  _requestUserQuery
  _responseUserQuery

  get requestUserQuery() {
    return this._requestUserQuery
  }

  @api
  set requestUserQuery(value) {
    this._requestUserQuery = value
  }

  get responseUserQuery() {
    return this._responseUserQuery
  }

  @api
  set responseUserQuery(value) {
    this._responseUserQuery = { ...value }
  }

  get messageAfterQuery() {
    if (this._responseUserQuery.success === null) {
      return ''
    }
    if (this._responseUserQuery.success) {
      return `Success! Total records: ${this._responseUserQuery.dataLength}`
    }
    return `Error. ${this._responseUserQuery.message}`
  }

  get styleAfterQuery() {
    if (this._responseUserQuery.success === null) {
      return ''
    }
    if (this._responseUserQuery.success) {
      return 'slds-text-color_success'
    }
    return 'slds-text-color_error'
  }

  handleInputUserQuery(event) {
    this.fireEvent('query', event)
  }

  fireEvent = (eventName, event) => {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: event.detail,
        bubbles: true,
        composed: true
      })
    )
  }
}