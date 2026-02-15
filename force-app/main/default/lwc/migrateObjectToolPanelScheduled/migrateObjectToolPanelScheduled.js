import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolPanelScheduled extends LightningElement {
  _item
  _loading

  get loading() {
    return this._loading
  }

  get item() {
    return this._item
  }

  @api
  set item(value) {
    this._item = { ...value }
  }

  connectedCallback() {
    console.log(this._item)
  }

  handleAbortScheduledJob() {
    this._loading = true
    this.dispatchEvent(
      new CustomEvent('abortjob', {
        detail: {
          cronId: this._item.cronId
        },
        bubbles: true,
        composed: true
      })
    )
  }
}