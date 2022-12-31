import { LightningElement, api } from 'lwc'

const ACCEPTABLE_TYPES = {
  ID: ['STRING', 'REFERENCE'],
  BOOLEAN: ['STRING'],
  DATE: ['STRING'],
  DATETIME: ['STRING'],
  DOUBLE: ['STRING'],
  PHONE: ['STRING'],
  CURRENCY: ['STRING'],
  PICKLIST: ['STRING']
}

export default class MigrateObjectToolFieldPair extends LightningElement {
  @api pair = {}
  @api soFieldOptions
  @api boFieldOptions

  get isDisabledSoFields() {
    return this.soFieldOptions.length === 0
  }

  get isDisabledBoFields() {
    return this.boFieldOptions.length === 0
  }

  get indicator() {
    const result = {
      content: null,
      icon: null,
      variant: null
    }

    if (Object.keys(this.pair).length === 0) {
      return result
    }

    // TODO: add message for contents
    if (this.pair.soFieldType === this.pair.boFieldType) {
      result.content = 'Success'
      result.icon = 'utility:success'
      result.variant = ''
    } else if (this.hasAcceptableType(this.pair.soFieldType, this.pair.boFieldType)) {
      result.content = 'Warning'
      result.icon = 'utility:warning'
      result.variant = 'warning'
    } else {
      result.content = 'Error'
      result.icon = 'utility:error'
      result.variant = 'error'
    }

    return result
  }

  hasAcceptableType(soFieldType, boFieldType) {
    return ACCEPTABLE_TYPES[soFieldType] && ACCEPTABLE_TYPES[soFieldType].includes(boFieldType)
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
