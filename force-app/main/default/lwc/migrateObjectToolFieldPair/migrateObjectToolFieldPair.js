import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolFieldPair extends LightningElement {
  @api pair
  @api soFieldOptions
  @api boFieldOptions

  get isDisabledSoFields() {
    return this.soFieldOptions.length === 0
  }

  get isDisabledBoFields() {
    return this.boFieldOptions.length === 0
  }

  handleObjectFieldChange(event) {
    const newValue = event.detail.value
    const pairIndex = event.currentTarget.dataset.pairIndex
    const property = event.currentTarget.dataset.property

    this.dispatchEvent(
      new CustomEvent('fieldchange', {
        detail: {
          newValue,
          pairIndex,
          property
        }
      })
    )
  }

  handleDeleteIconClick(event) {
    const pairIndex = Number(event.currentTarget.dataset.pairIndex)

    this.dispatchEvent(
      new CustomEvent('deletepair', {
        detail: {
          pairIndex
        }
      })
    )
  }
}
