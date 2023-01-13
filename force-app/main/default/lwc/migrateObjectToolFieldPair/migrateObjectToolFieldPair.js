import { LightningElement, api } from 'lwc'

const ACCEPTABLE_TYPES = {
  ID: ['STRING', 'REFERENCE'],
  BOOLEAN: ['STRING'],
  DATE: ['STRING'],
  DATETIME: ['STRING'],
  DOUBLE: ['STRING'],
  PHONE: ['STRING'],
  CURRENCY: ['STRING'],
  PICKLIST: ['STRING'],
  REFERENCE: ['STRING']
}

export default class MigrateObjectToolFieldPair extends LightningElement {
  @api pair = {}

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

  get isDisabledSoFields() {
    return this._soFieldOptions.length === 0
  }

  get isDisabledBoFields() {
    return this._boFieldOptions.length === 0
  }

  get indicator() {
    const result = {
      content: null,
      icon: null,
      variant: null,
      class: null
    }

    if (Object.keys(this.pair).length === 0) {
      return result
    }

    if (this.pair.soFieldType === this.pair.boFieldType) {
      result.content = 'Success'
      result.icon = 'utility:success'
      result.variant = ''
      result.class = 'slds-icon-text-success'
    } else if (this.hasAcceptableType(this.pair.soFieldType, this.pair.boFieldType)) {
      result.content = `You can move a field with type ${this.pair.soFieldType} to a field with type ${this.pair.boFieldType}, however, in case of incompatibility, data will be lost.`
      result.icon = 'utility:warning'
      result.variant = 'warning'
      result.class = ''
    } else {
      result.content = `Incompatible types. You cannot move field with type ${this.pair.soFieldType} to field with type ${this.pair.boFieldType}. Select a different field.`
      result.icon = 'utility:error'
      result.variant = 'error'
      result.class = ''
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
