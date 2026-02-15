import { deepCopy } from 'c/utilsPrivate'
import constants from './constants'

export default class MigrateObjectToolValidator {
  result = deepCopy(constants.VALIDATE_RESULT)

  constructor(mainComponent) {
    this.mainComponent = mainComponent
  }

  validateAll(fieldMapping, recurrence) {
    this.result = deepCopy(constants.VALIDATE_RESULT)
    this.validateChooseObjects()
    this.validateFieldMapping(fieldMapping)
    this.validateRecurrence(recurrence)

    return this.result
  }

  validateChooseObjects() {
    const { currentBigObjectName, currentSObjectName } = this.mainComponent

    if (!currentSObjectName) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Step 1. Choose sObject.'
      })
    }

    if (!currentBigObjectName) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Step 1. Choose Big Object.'
      })
    }
  }

  validateFieldMapping(fieldMapping) {
    if (!fieldMapping || Object.keys(fieldMapping).length === 0) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Step 2. Fields to migrate data cannot be empty.'
      })
    }

    // TODO: don't work because when building fieldMapping original keys missed
    const soFields = Object.keys(fieldMapping)
    if (soFields.length !== new Set(soFields).size) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Duplicates in From Fields.'
      })
    }

    //TODO: -//- values
    const boFields = Object.values(fieldMapping)
    if (boFields.length !== new Set(boFields).size) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Duplicates in To Fields.'
      })
    }
  }

  validateRecurrence(recurrence) {
    if (!recurrence || Object.keys(recurrence).length === 0) {
      this.result.hasError = true
      this.result.items.push({
        success: false,
        message: 'Step 4. Recurrence data cannot be empty.'
      })
    }
  }
}
