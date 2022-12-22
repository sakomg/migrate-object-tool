import { LightningElement } from 'lwc'
import getObjectNames from '@salesforce/apex/MigrateCustomObjectController.getObjectNames'
import getFieldsByObjectName from '@salesforce/apex/MigrateCustomObjectController.getFieldsByObjectName'

const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

export default class MigrateObjectTool extends LightningElement {
  sObjectNameOptions = []
  bigObjectNameOptions = []
  loading = false
  fieldPairs = [{ index: 0, soField: '', boField: '' }]
  dummyFieldPair = { index: 0, soField: '', boField: '' }

  soFieldOptions = [
    { value: 'field1', label: 'field1' },
    { value: 'field2', label: 'field2' },
    { value: 'field3', label: 'field3' },
    { value: 'field4', label: 'field4' }
  ]

  boFieldOptions = [
    { value: 'field1', label: 'field1' },
    { value: 'field2', label: 'field2' },
    { value: 'field3', label: 'field3' },
    { value: 'field4', label: 'field4' }
  ]

  connectedCallback() {
    let promises = []

    promises.push(this._getSObjectNames())
    promises.push(this._getBigObjectNames())

    Promise.all(promises).finally(() => (this.loading = false))
  }

  async _getSObjectNames() {
    try {
      this.loading = true
      const sObjectNames = await getObjectNames({ objectType: CUSTOM_OBJECT })
      this.sObjectNameOptions = JSON.parse(sObjectNames)
      console.log(s(this.sObjectNameOptions))
    } catch (error) {
      console.error('error in fetching sObject names', error)
    }
  }

  async _getBigObjectNames() {
    try {
      this.loading = true
      const bigObjectNames = await getObjectNames({ objectType: BIG_OBJECT })
      this.bigObjectNameOptions = JSON.parse(bigObjectNames)
      console.log(s(this.bigObjectNameOptions))
    } catch (error) {
      console.error('error in fetching bigObject names', error)
    }
  }

  async handleSObjectChange(event) {
    const newValue = event.detail.value
    const soFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.soFieldOptions = JSON.parse(soFieldOptions)
  }

  async handleBigObjectChange(event) {
    const newValue = event.detail.value
    const boFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.boFieldOptions = JSON.parse(boFieldOptions)
  }

  handleObjectFieldChange(event) {
    const newValue = event.detail.value
    const pairIndex = event.currentTarget.dataset.pairIndex
    const property = event.currentTarget.dataset.property
    console.log('soFieldValue', newValue)
    console.log('pairIndex', pairIndex)
    console.log('property', property)

    this.fieldPairs[pairIndex][property] = newValue

    this.addDummyPair(pairIndex)
  }

  addDummyPair() {
    const fieldPairs = [...this.fieldPairs]
    const lastIndex = fieldPairs.length - 1
    const pair = fieldPairs[lastIndex]
    console.log('pair ', pair)

    if (pair.soField.length && pair.boField.length) {
      const dummyPair = { ...this.dummyFieldPair }
      dummyPair.index = lastIndex + 1
      fieldPairs.push(dummyPair)
      this.fieldPairs = [...fieldPairs]
      console.log(this.fieldPairs)
    }
  }
}

function s(o) {
  return JSON.parse(JSON.stringify(o))
}
