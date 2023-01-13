export default class MigrateObjectToolValidator {
  constructor(mainComponent) {
    this.mainComponent = mainComponent
  }

  validateAll(fieldMapping, recurrence) {
    const validMapping = this.validateFieldMapping(fieldMapping)
    const validRecurrence = this.validateRecurrence(recurrence)
    const { currentBigObjectName, currentSObjectName } = this.mainComponent

    console.log(currentBigObjectName)
    console.log(currentSObjectName)

    return validMapping && validRecurrence && currentBigObjectName && currentSObjectName
  }

  validateFieldMapping(fieldMapping) {
    if (!fieldMapping) {
      return false
    }
    if (fieldMapping && Object.keys(fieldMapping).length === 0) {
      return false
    }
    return true
  }

  validateRecurrence(recurrence) {
    if (!recurrence) {
      return false
    }
    if (recurrence && Object.keys(recurrence).length === 0) {
      return false
    }

    return true
  }
}
