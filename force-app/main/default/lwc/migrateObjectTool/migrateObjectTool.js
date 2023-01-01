import { LightningElement, track } from 'lwc'
import Modal from 'c/migrateObjectToolModal'
import Confirm from 'lightning/confirm'
import { Drag } from './utils'
import getObjectNames from '@salesforce/apex/MigrateCustomObjectController.getObjectNames'
import getFieldsByObjectName from '@salesforce/apex/MigrateCustomObjectController.getFieldsByObjectName'
import checkQuery from '@salesforce/apex/MigrateCustomObjectController.checkQuery'
import processMigrate from '@salesforce/apex/MigrateCustomObjectController.processMigrate'

const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

const TIME_PERIOD_TO_CLASS = {
  Daily: 'Models.RecurrenceDataDaily',
  Weekly: 'Models.RecurrenceDataWeekly',
  Monthly: 'Models.RecurrenceDataMonthly',
  Yearly: 'Models.RecurrenceDataYearly'
}

export default class MigrateObjectTool extends LightningElement {
  @track sObjectNameOptions = []
  @track bigObjectNameOptions = []
  @track fieldPairs = []
  @track dummyFieldPair = {
    index: 0,
    soField: '',
    boField: '',
    soFieldType: '',
    boFieldType: '',
    toShowDeleteButton: false,
    toShowDropButton: false,
    toShowValidIndicator: false
  }
  @track loadingObj = {
    main: false,
    step1: false,
    step2: false,
    step3: false,
    step4: false
  }

  activeSections = ['step-1', 'step-2', 'step-3', 'step-4']

  openPanelLeft = true
  soFieldOptions = []
  boFieldOptions = []

  queryTimeoutId = null
  currentSObjectName = null
  currentBigObjectName = null

  responseUserQuery = {
    message: '',
    dataLength: [],
    success: null
  }

  _conditionQueryValue = ''

  get recurrenceComponent() {
    return this.template.querySelector('c-migrate-object-tool-recurrence')
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
    if (this._conditionQueryValue) {
      return this._conditionQueryValue
    }

    return `SELECT COUNT() FROM ${this.currentSObjectName}`
  }

  get drag() {
    return new Drag([...this.fieldPairs])
  }

  connectedCallback() {
    window.addEventListener('scroll', () => {
      this.setStickyHeader()
    })
    this.fieldPairs.push({ ...this.dummyFieldPair })

    let promises = []

    promises.push(this._getSObjectNames())
    promises.push(this._getBigObjectNames())

    Promise.all(promises).finally(() => {
      this.loadingObj.main = false
    })
  }

  setStickyHeader() {
    const top = window.pageYOffset || document.documentElement.Top
    const header = this.template.querySelector('.header-container')

    if (top > 12) {
      header.classList.add('sticky')
    } else {
      header.classList.remove('sticky')
    }
  }

  async _getSObjectNames() {
    try {
      this.loadingObj.main = true
      const sObjectNames = await getObjectNames({ objectType: CUSTOM_OBJECT })
      this.sObjectNameOptions = JSON.parse(sObjectNames)
    } catch (error) {
      console.error('error in fetching sObject names', error)
    }
  }

  async _getBigObjectNames() {
    try {
      this.loadingObj.main = true
      const bigObjectNames = await getObjectNames({ objectType: BIG_OBJECT })
      this.bigObjectNameOptions = JSON.parse(bigObjectNames)
      console.log(s(this.bigObjectNameOptions))
    } catch (error) {
      console.error('error in fetching bigObject names', error)
    }
  }

  async handleSObjectChange(event) {
    this.loadingObj.step2 = true
    this.loadingObj.step3 = true
    const newValue = event.detail.value
    this.currentSObjectName = newValue
    this.checkQuery(this.conditionQueryValue)
    const soFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.soFieldOptions = JSON.parse(soFieldOptions)
    this.soFieldOptions = this.formatPickListOption(this.soFieldOptions)
    this.loadingObj.step2 = false
  }

  async handleBigObjectChange(event) {
    this.loadingObj.step2 = true
    const newValue = event.detail.value
    this.currentBigObjectName = newValue
    const boFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.boFieldOptions = JSON.parse(boFieldOptions)
    this.boFieldOptions = this.formatPickListOption(this.boFieldOptions)
    this.loadingObj.step2 = false
  }

  handleObjectFieldChange(event) {
    const { newValue, pairIndex, property } = event.detail

    this.fieldPairs[pairIndex][property] = newValue
    const pair = this.fieldPairs[pairIndex]

    if (pair.soField.length && pair.boField.length) {
      pair.soFieldType = this.soFieldOptions.find((option) => option.value === pair.soField)?.type
      pair.boFieldType = this.boFieldOptions.find((option) => option.value === pair.boField)?.type
    }

    this.addDummyPair()
  }

  addDummyPair() {
    const fieldPairs = [...this.fieldPairs]
    const lastIndex = fieldPairs.length - 1
    const pair = fieldPairs[lastIndex]

    if (pair.soField.length && pair.boField.length) {
      const dummyPair = { ...this.dummyFieldPair }
      fieldPairs[lastIndex].toShowDeleteButton = true
      fieldPairs[lastIndex].toShowDropButton = true
      fieldPairs[lastIndex].toShowValidIndicator = true

      dummyPair.index = lastIndex + 1
      fieldPairs.push(dummyPair)
      this.fieldPairs = [...fieldPairs]
      console.log(this.fieldPairs)
    }
  }

  handleDeleteIconClick(event) {
    event.stopPropagation()
    const pairIndex = Number(event.detail.pairIndex)
    const fieldPairs = [...this.fieldPairs]
    const result = fieldPairs.filter((pair) => pair.index !== pairIndex)

    for (let i = 0; i < result.length; i++) {
      result[i].index = i
    }

    this.fieldPairs = [...result]
  }

  handleDragEnd(e) {
    this.drag.end(e)
  }

  formSummaryPayload(recurrenceData) {
    return {
      objectName: this.currentSObjectName || 'None',
      bigObjectName: this.currentBigObjectName || 'None',
      fields: this.excludeDummyPair(this.fieldPairs),
      query: this.conditionQueryValue || 'None',
      totalRecords: this.responseUserQuery.success ? this.responseUserQuery.dataLength : 0,
      recurrenceSetup: recurrenceData
    }
  }

  async handleExecute() {
    const recurrenceData = this.recurrenceComponent.getRecurrenceSetupData()
    const result = await Confirm.open({
      message: 'Are you sure you want to execute migrate process?',
      variant: 'default',
      theme: 'info',
      label: 'Execute a process'
    })

    if (result) {
      this.processMigrate(recurrenceData)
    } else {
      // cancel
    }
  }

  async handleSummary() {
    const recurrenceData = this.recurrenceComponent.getRecurrenceSetupData()
    const result = await Modal.open({
      size: 'small',
      description: 'Info',
      targetData: this.formSummaryPayload(recurrenceData)
    })

    if (result === 'execute') {
      this.processMigrate(recurrenceData)
    } else if (result) {
      this.setActiveSection(result)
    } else {
      console.log('nothing', result)
    }

    // if modal closed with X button, promise returns result = 'undefined'
    // if modal closed with OK button, promise returns result = 'okay'
    console.log('result modal', result)
  }

  excludeDummyPair(fieldPairs) {
    return fieldPairs.filter((pair) => pair.soField !== '' && pair.boField !== '')
  }

  async processMigrate(recurrenceData) {
    const fieldMapping = this.fieldPairs
      .filter((pair) => pair.soField !== '' || pair.boField !== '')
      .reduce((pair, cur) => ({ ...pair, [cur.soField]: cur.boField }), {})

    console.log('recur', s(recurrenceData))

    const className = TIME_PERIOD_TO_CLASS[recurrenceData.period]

    const recurrence = {
      className: className,
      payload: JSON.stringify(recurrenceData)
    }

    console.log(recurrence)

    try {
      await processMigrate({
        sObjectName: this.currentSObjectName,
        bigObjectName: this.currentBigObjectName,
        query: this.conditionQueryValue,
        fieldMapping: fieldMapping,
        recurrence: JSON.stringify(recurrence)
      })
    } catch (error) {
      console.log(error)
    }
  }

  handleInputUserQuery(event) {
    const value = event.detail.value
    this._conditionQueryValue = value
    clearTimeout(this.queryTimeoutId)
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.queryTimeoutId = setTimeout(() => this.checkQuery(value), 1500)
  }

  checkQuery = async (value) => {
    const rawResponse = await checkQuery({ query: value })
    this.responseUserQuery = JSON.parse(rawResponse)
    this.loadingObj.step3 = false
  }

  setActiveSection(sectionName) {
    const accordion = this.template.querySelector('.container-accordion')
    accordion.activeSectionName = sectionName
  }

  handleTogglePanelLeft() {
    this.openPanelLeft = !this.openPanelLeft
  }

  formatPickListOption(pickListOptions) {
    const formattedPickListOptions = pickListOptions.map(({ label, value, type }) => ({
      label: `${label} (${type})`,
      value: value,
      type: type
    }))

    return [...formattedPickListOptions]
  }
}

function s(o) {
  return JSON.parse(JSON.stringify(o))
}
