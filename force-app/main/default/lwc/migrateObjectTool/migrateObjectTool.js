import { LightningElement, track } from 'lwc'
import Modal from 'c/migrateObjectToolModal'
import { Drag } from './utils'
import getObjectNames from '@salesforce/apex/MigrateCustomObjectController.getObjectNames'
import getFieldsByObjectName from '@salesforce/apex/MigrateCustomObjectController.getFieldsByObjectName'
import checkQuery from '@salesforce/apex/MigrateCustomObjectController.checkQuery'

const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

export default class MigrateObjectTool extends LightningElement {
  @track sObjectNameOptions = []
  @track bigObjectNameOptions = []
  @track fieldPairs = []
  @track dummyFieldPair = {
    index: 0,
    soField: '',
    boField: '',
    toShowDeleteButton: false,
    toShowDropButton: false
  }

  loading = false
  soFieldOptions = []
  boFieldOptions = []

  queryTimeoutId = null
  currentSObjectName = null

  responseUserQuery = {
    message: '',
    dataLength: [],
    success: null
  }

  get messageAfterQuery() {
    if (this.responseUserQuery.success === null) {
      return ''
    }
    if (this.responseUserQuery.success) {
      return `Success! Total records: ${this.responseUserQuery.dataLength}`
    }
    return `Error. ${this.responseUserQuery.message}`
  }

  get styleAfterQuery() {
    if (this.responseUserQuery.success === null) {
      return ''
    }
    if (this.responseUserQuery.success) {
      return 'slds-text-color_success'
    }
    return 'slds-text-color_error'
  }

  get conditionQueryValue() {
    if (this.currentSObjectName === null) {
      return ''
    }
    return `SELECT COUNT() FROM ${this.currentSObjectName}`
  }

  get drag() {
    return new Drag([...this.fieldPairs])
  }

  connectedCallback() {
    this.fieldPairs.push({ ...this.dummyFieldPair })

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
    this.currentSObjectName = newValue
    this.checkQuery(this.conditionQueryValue)
    console.log('value ', newValue)

    const soFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.soFieldOptions = JSON.parse(soFieldOptions)
    console.log('this.soFieldOptions ', this.soFieldOptions)
  }

  async handleBigObjectChange(event) {
    const newValue = event.detail.value
    const boFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.boFieldOptions = JSON.parse(boFieldOptions)
  }

  handleObjectFieldChange(event) {
    console.log(s(event.detail))
    const newValue = event.detail.newValue
    const pairIndex = event.detail.pairIndex
    const property = event.detail.property
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

      console.log('dummyPair ', dummyPair)

      fieldPairs[lastIndex].toShowDeleteButton = true
      fieldPairs[lastIndex].toShowDropButton = true
      dummyPair.index = lastIndex + 1
      fieldPairs.push(dummyPair)
      this.fieldPairs = [...fieldPairs]
      console.log(this.fieldPairs)
    }
  }

  handleDeleteIconClick(event) {
    event.stopPropagation()
    const pairIndex = Number(event.detail.pairIndex)
    console.log('pairIndex ', pairIndex)
    const fieldPairs = [...this.fieldPairs]
    console.log('fieldPairs ', fieldPairs)

    const result = fieldPairs.filter((pair) => pair.index !== pairIndex)
    console.log('result ', result)

    for (let i = 0; i < result.length; i++) {
      result[i].index = i
    }
    console.log('result ', result)

    this.fieldPairs = [...result]
    console.log('this.fieldPairs ', this.fieldPairs)
  }

  handleDragEnd(e) {
    this.drag.end(e)
  }

  handleOnchange(event) {
    console.log('handleOnchange')
    console.log(event.currentTarget.value)
  }

  async handleSchedule(event) {
    console.log(event.detail)
    const result = await Modal.open({
      size: 'small',
      description: "Accessible description of modal's purpose",
      targetData: 'Passed into content api',
      onselect: (e) => {
        // stop further propagation of the event
        e.stopPropagation()
        // hand off to separate function to process
        // result of the event (see above in this example)
        this.handleSelectEvent(e.detail)
        // or proxy to be handled above by dispatching
        // another custom event to pass on the event
        // this.dispatchEvent(e);
      }
    })
    // if modal closed with X button, promise returns result = 'undefined'
    // if modal closed with OK button, promise returns result = 'okay'
    console.log('result modal', result)
  }

  // Process the select event from within the modal
  handleSelectEvent(detail) {
    const { id, value } = detail
    console.log(`select event fired elem with id ${id} and value: ${value}`)
  }

  handleInputUserQuery(event) {
    const value = event.detail.value
    clearTimeout(this.queryTimeoutId)
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.queryTimeoutId = setTimeout(() => this.checkQuery(value), 1500)
  }

  checkQuery = async (value) => {
    const rawResponse = await checkQuery({ query: value })
    this.responseUserQuery = JSON.parse(rawResponse)
  }
}

function s(o) {
  return JSON.parse(JSON.stringify(o))
}
