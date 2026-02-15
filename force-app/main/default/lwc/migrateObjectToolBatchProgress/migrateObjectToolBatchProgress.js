import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolBatchProgress extends LightningElement {
  _item = {}

  get item() {
    return this._item
  }

  get itemsProcessed() {
    return this._item?.itemsProcessed
  }

  get totalJobItems() {
    return this._item?.totalJobItems
  }

  @api
  set item(value) {
    this._item = { ...value }
  }

  get processedPercent() {
    if (this._item.totalJobItems === 0) {
      return 0
    }
    return (this._item.itemsProcessed / this._item.totalJobItems) * 100
  }

  get statusStyle() {
    if (this._item.itemsProcessed === 0) {
      return 'slds-badge'
    }
    if (this._item.itemsProcessed === this._item.totalJobItems) {
      return 'slds-badge slds-theme_success'
    }
    return ''
  }

  get statusValue() {
    if (this._item.itemsProcessed === 0) {
      return 'In Active'
    }
    if (this._item.itemsProcessed === this._item.totalJobItems) {
      return 'Done'
    }
    return ''
  }
}