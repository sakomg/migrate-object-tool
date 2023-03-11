import { LightningElement, track } from 'lwc'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { deepCopy } from 'c/utilsPrivate'
import constants from './constants'
import apex from './apexCalls'
import MigrateObjectToolValidator from './validator'
import Modal from 'c/migrateObjectToolModal'
import Confirm from 'lightning/confirm'
import getFieldsByObjectName from '@salesforce/apex/MigrateCustomObjectController.getFieldsByObjectName'
import processMigrate from '@salesforce/apex/MigrateCustomObjectController.processMigrate'

import DesktopView from './migrateObjectToolDesktop.html'
import MobileView from './migrateObjectToolMobile.html'

export default class MigrateObjectTool extends LightningElement {
  @track dummyFieldPair = { ...constants.DUMMY_FIELD_PAIR }
  @track loadingObj = { ...constants.LOADING_OBJ }
  @track responseUserQuery = { ...constants.RESPONSE_USER_QUERY }
  @track fieldPairs = [{ ...constants.DUMMY_FIELD_PAIR }]
  @track data = []
  @track soFieldOptions = []
  @track boFieldOptions = []
  @track sObjectNameOptions = []
  @track bigObjectNameOptions = []

  openPanelLeft = true
  jobStatusTrackIntervalId = null
  queryTimeoutId
  validator = null
  currentSObjectName = ''
  currentBigObjectName = ''
  userQuery = ''

  get mainComponent() {
    return this.template.querySelector('c-migrate-object-tool-main')
  }

  get dataTrackedToUpdateProperties() {
    return this.data.map(({ batchId, cronId, state }) => ({ batchId, cronId, state }))
  }

  render() {
    return constants.FORM_FACTOR === 'Large' ? DesktopView : MobileView
  }

  connectedCallback() {
    let promises = []
    this.loadingObj.main = true
    window.addEventListener('scroll', () => {
      this.setStickyHeader()
    })

    promises.push(this._getSObjectNames())
    promises.push(this._getBigObjectNames())
    promises.push(this._getData())

    Promise.all(promises).finally(() => {
      this.loadingObj.main = false
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      this.jobStatusTrackIntervalId = setInterval(this.trackJobStatus.bind(this), constants.TRACK_DATA_CHANGE_INTERVAL)
    })
    this.validator = new MigrateObjectToolValidator(this)
  }

  errorCallback(error) {
    console.log(error)
  }

  disconnectedCallback() {
    clearInterval(this.jobStatusTrackIntervalId)
  }

  async trackJobStatus() {
    const actualData = await apex.fetchData('Track changes')
    // console.log('actualData ', actualData)
    const toUpdateData = !this.compareDataByTrackedProperties(actualData)

    if (toUpdateData) {
      this._getData()
    }
  }

  compareDataByTrackedProperties(actualData) {
    if (this.dataTrackedToUpdateProperties.length !== actualData.length) {
      return false
    }

    return this.equalsCheck(actualData, this.dataTrackedToUpdateProperties)
  }

  equalsCheck = (a, b) => {
    if (a === b) return true
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b
    if (a.prototype !== b.prototype) return false
    if (Object.keys(a).length !== Object.keys(b).length) return false
    return Object.keys(a).every((k) => this.equalsCheck(a[k], b[k]))
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

  handleSObjectChange(event) {
    const newValue = event.detail.value
    if (newValue === constants.CUSTOM_OBJECT) {
      window.open(constants.CREATE_NEW_SO_LINK, '_self')
    } else {
      this.currentSObjectName = newValue
      this.processSObjectChange(newValue)
      this.processQueryChange()
    }
  }

  async handleBigObjectChange(event) {
    const newValue = event.detail.value
    if (newValue === constants.BIG_OBJECT) {
      window.open(constants.CREATE_NEW_BO_LINK, '_self')
    } else {
      await this.processBigObjectChange(newValue)
    }
  }

  async processSObjectChange(newValue) {
    this.loadingObj.step2 = true
    this.currentSObjectName = newValue
    const soFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.soFieldOptions = this.formatPickListOption(JSON.parse(soFieldOptions))
    this.loadingObj.step2 = false
  }

  async processBigObjectChange(newValue) {
    this.loadingObj.step2 = true
    this.currentBigObjectName = newValue
    const boFieldOptions = await getFieldsByObjectName({ objectName: newValue })
    this.boFieldOptions = this.formatPickListOption(JSON.parse(boFieldOptions))
    this.loadingObj.step2 = false
  }

  handleObjectFieldChange(event) {
    event.stopPropagation()
    event.preventDefault()
    const { newValue, pairIndex, property } = event.detail

    console.log(JSON.parse(JSON.stringify(this.fieldPairs)))
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

  formSummaryPayload(recurrenceData) {
    return {
      objectName: this.currentSObjectName || 'None',
      bigObjectName: this.currentBigObjectName || 'None',
      fields: this.excludeDummyPair(this.fieldPairs),
      query: this.userQuery || 'None',
      totalRecords: this.responseUserQuery.success ? this.responseUserQuery.dataLength : 0,
      recurrenceSetup: recurrenceData
    }
  }

  async handleExecute() {
    const recurrenceData = this.mainComponent.getRecurrenceSetupData()
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

  async handleSelectProcess(event) {
    event.stopPropagation()
    const sectionName = event.detail.name
    if (sectionName === 'new_create') {
      this.setBlankValues()
      return
    }
    this.loadingObj.step1 = true
    this.loadingObj.step4 = true
    const copy = deepCopy(this.data)
    this.data = copy.map((item) => (item.cronId === sectionName ? { ...item, show: true } : { ...item, show: false }))
    const selectedProcess = copy.find((item) => item.cronId === sectionName)
    await this.processSObjectChange(selectedProcess.sObjectName)
    await this.processBigObjectChange(selectedProcess.bigObjectName)
    this.processFieldsChange(selectedProcess.fieldMapping)
    await this.processQueryChange(selectedProcess.query)
    this.mainComponent.setRecurrenceSetupData({ ...selectedProcess })
    this.loadingObj.step1 = false
    this.loadingObj.step4 = false
  }

  formFieldPairs(fieldMapping) {
    if (!fieldMapping || !fieldMapping.length) {
      return []
    }
    const result = []
    const objectArray = Object.entries(JSON.parse(fieldMapping))
    objectArray.forEach(([key, value], index) => {
      result.push({
        index: index,
        soField: key,
        boField: value,
        toShowDeleteButton: true,
        toShowDropButton: true,
        toShowValidIndicator: true,
        soFieldType: this.soFieldOptions.find((option) => option.value === key)?.type,
        boFieldType: this.boFieldOptions.find((option) => option.value === value)?.type
      })
    })
    const _dummyFieldPair = { ...this.dummyFieldPair }
    _dummyFieldPair.index = result.length
    result.push(_dummyFieldPair)
    return result
  }

  processFieldsChange(fieldMapping) {
    console.log('fieldMapping: ', fieldMapping)
    this.fieldPairs = this.formFieldPairs(fieldMapping)
    console.log(this.formFieldPairs(fieldMapping))
  }

  setBlankValues() {
    const copy = deepCopy(this.data)
    this.data = copy.map((item) => ({ ...item, show: false }))
    this.currentSObjectName = ''
    this.currentBigObjectName = ''
    this.fieldPairs = [{ ...constants.DUMMY_FIELD_PAIR }]
    this.soFieldOptions = []
    this.boFieldOptions = []
    this.userQuery = ''
    this.responseUserQuery = { ...constants.RESPONSE_USER_QUERY }
    if (this.mainComponent) {
      this.mainComponent.setRecurrenceSetupData({
        period: 'Weekly',
        migrateTime: '00:00:00.000Z',
        recurrenceDetails: null
      })
    }
  }

  async handleAbortScheduledJob(event) {
    event.stopPropagation()
    const cronId = event.detail.cronId
    await this._abortJob(cronId)
    await this._getData()
  }

  async handleSummary() {
    const recurrenceData = this.mainComponent.getRecurrenceSetupData()
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
  }

  excludeDummyPair(fieldPairs) {
    return fieldPairs.filter((pair) => pair.soField !== '' && pair.boField !== '')
  }

  async processMigrate(recurrenceData) {
    const fieldMapping = this.fieldPairs
      .filter((pair) => pair.soField !== '' || pair.boField !== '')
      .reduce((pair, cur) => ({ ...pair, [cur.soField]: cur.boField }), {})

    const recurrence = {
      className: constants.TIME_PERIOD_TO_CLASS[recurrenceData.period],
      payload: JSON.stringify(recurrenceData)
    }

    const validateResult = this.validator.validateAll(fieldMapping, recurrence)

    if (validateResult.hasError) {
      validateResult.items.forEach((item) => {
        if (!item.success) {
          this.displayMessage('', item.message, 'warning')
        }
      })
      return
    }

    try {
      this.loadingObj.panel = true
      await processMigrate({
        sObjectName: this.currentSObjectName,
        bigObjectName: this.currentBigObjectName,
        query: this.userQuery,
        fieldMapping: fieldMapping,
        recurrence: JSON.stringify(recurrence)
      })
      await this._getData()
      this.displayMessage(
        '',
        `The migration from "${this.currentSObjectName}" to "${this.currentBigObjectName}" has started.`,
        'info'
      )
    } catch (error) {
      this.displayMessage('', `${error.body.message || 'Unknown error.'}`, 'error')
      console.log(error)
    } finally {
      this.loadingObj.panel = false
    }
  }

  handleInputUserQuery(event) {
    event.stopPropagation()
    clearTimeout(this.queryTimeoutId)
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.queryTimeoutId = setTimeout(() => this.checkQuery(event.detail.value), 1500)
  }

  async processQueryChange(query = `SELECT COUNT() FROM ${this.currentSObjectName}`) {
    await this.checkQuery(query)
  }

  checkQuery = async (value) => {
    this.loadingObj.step3 = true
    this.userQuery = value
    this.responseUserQuery = await apex.checkQuery(value)
    this.loadingObj.step3 = false
  }

  setActiveSection(sectionName) {
    this.mainComponent.setActiveSection(sectionName)
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

  async _getSObjectNames() {
    this.sObjectNameOptions = await apex.fetchSObjectNames()
  }

  async _getBigObjectNames() {
    this.bigObjectNameOptions = await apex.fetchBigObjectNames()
  }

  async _getData() {
    this.data = await apex.fetchData('Initial')
  }

  async _abortJob(jobId) {
    await apex.abortJob(jobId)
  }

  displayMessage = (title, message, variant, mode = 'dismissible') => {
    const evt = new ShowToastEvent({ title, message, variant, mode })
    this.dispatchEvent(evt)
  }
}
