import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolRecurrence extends LightningElement {
  @api loading

  selectedMigrateTime = '00:00:00.000Z'
  selectedPeriod = 'Daily'
  selectedWeekDays = ['1', '2', '3', '4', '5', '6', '7']
  savedSelectedWeekDays = []
  selectedDaysNumber = []
  savedSelectedDaysNumber = []
  selectedMonthDayPairs = []
  _daysNumberOptions = []

  toSaveSelectedWeekDays = false
  disabledWeekDays = true
  disabledMigrateTime = false
  onceMessage = ''

  get periodOptions() {
    return [
      { label: 'Once', value: 'Once' },
      { label: 'Daily', value: 'Daily' },
      { label: 'Weekly', value: 'Weekly' },
      { label: 'Monthly', value: 'Monthly' },
      { label: 'Yearly', value: 'Yearly' }
    ]
  }

  get weekDaysOptions() {
    return [
      { label: 'Sunday', value: '1' },
      { label: 'Monday', value: '2' },
      { label: 'Tuesday', value: '3' },
      { label: 'Wednesday', value: '4' },
      { label: 'Thursday', value: '5' },
      { label: 'Friday', value: '6' },
      { label: 'Saturday', value: '7' }
    ]
  }

  get daysNumberOptions() {
    return this._daysNumberOptions
  }

  get isWeeklyPeriod() {
    return this.selectedPeriod === 'Daily' || this.selectedPeriod === 'Weekly'
  }

  get isMonthlyPeriod() {
    return this.selectedPeriod === 'Monthly'
  }

  get isYearlyPeriod() {
    return this.selectedPeriod === 'Yearly'
  }

  connectedCallback() {
    this._daysNumberOptions = this.getNonSelectedDaysNumberOptions()
  }

  getNonSelectedDaysNumberOptions() {
    const tmpDaysNumberOption = []
    let tmpOption = []

    for (let index = 1; index <= 31; index++) {
      tmpOption.push({ label: index + '', value: index + '' })

      if (index % 7 === 0 || index === 31) {
        tmpDaysNumberOption.push({ options: [...tmpOption], selectedDaysNumber: [] })
        tmpOption = []
      }
    }
    return tmpDaysNumberOption
  }

  handleRadioGroupChange(event) {
    this.selectedPeriod = event.detail.value

    if (this.selectedPeriod === 'Once') {
      this.disabledMigrateTime = true
      this.migrateTime = ''
      this.onceMessage = 'Will be used current time.'
    } else {
      this.disabledMigrateTime = false
      this.migrateTime = this.selectedMigrateTime
      this.onceMessage = ''
    }

    if (this.selectedPeriod === 'Daily') {
      this.savedSelectedWeekDays = [...this.selectedWeekDays]
      this.selectedWeekDays = ['1', '2', '3', '4', '5', '6', '7']
      this.disabledWeekDays = true
      this.toSaveSelectedWeekDays = false
    }

    if (this.selectedPeriod === 'Weekly') {
      this.selectedWeekDays = [...this.savedSelectedWeekDays]
      this.disabledWeekDays = false
      this.toSaveSelectedWeekDays = true
    }

    if (this.selectedPeriod === 'Monthly' || this.selectedPeriod === 'Yearly') {
      if (this.toSaveSelectedWeekDays) {
        this.savedSelectedWeekDays = [...this.selectedWeekDays]
      }
      this.toSaveSelectedWeekDays = false
    }
  }

  handleWeekDaysChange(event) {
    this.selectedWeekDays = event.detail.value
  }

  handleDaysNumberChange(event) {
    const selectedDaysNumber = event.detail.value
    const index = event.currentTarget.dataset.key
    const rangeIndex = Number(index)

    this._daysNumberOptions[rangeIndex].selectedDaysNumber = selectedDaysNumber
  }

  handleMonthDayPairsChange(event) {
    event.stopPropagation()
    event.preventDefault()

    this.selectedMonthDayPairs = [...event.detail.newMonthDayPairsList]
  }

  handleMigrateTimeChange(event) {
    this.selectedMigrateTime = event.detail.value
  }

  @api
  setRecurrenceSetupData(data) {
    this.selectedPeriod = data.period
    this.selectedMigrateTime = data.migrateTime
    const selectedValues = this.handleRecurrenceDetails(data.recurrenceDetails)
    switch (this.selectedPeriod) {
      case 'Once':
        break
      case 'Daily':
        this.selectedWeekDays = selectedValues
        this.disabledWeekDays = true
        break
      case 'Weekly':
        this.selectedWeekDays = selectedValues
        this.disabledWeekDays = false
        break
      case 'Monthly':
        this._daysNumberOptions = selectedValues
        break
      case 'Yearly':
        this.selectedMonthDayPairs = selectedValues
        break
      default:
        console.error(`Error: the period ${this.selectedPeriod} doesn't match with any available`)
        break
    }
  }

  @api
  getRecurrenceSetupData() {
    let recurrenceSetupData = {}
    recurrenceSetupData.period = this.selectedPeriod
    recurrenceSetupData.migrateTime = this.selectedMigrateTime

    switch (this.selectedPeriod) {
      case 'Once':
        recurrenceSetupData.selectedValues = []
        break
      case 'Daily':
      case 'Weekly':
        recurrenceSetupData.selectedValues = this.selectedWeekDays
        break
      case 'Monthly':
        recurrenceSetupData.selectedValues = this.extractSelectedDaysNumber()
        break
      case 'Yearly':
        recurrenceSetupData.selectedValues = this.selectedMonthDayPairs
        break
      default:
        console.error(`Error: the period ${this.selectedPeriod} doesn't match with any available`)
        break
    }

    return recurrenceSetupData
  }

  handleRecurrenceDetails(recurrenceDetails) {
    return recurrenceDetails && recurrenceDetails != null ? JSON.parse(recurrenceDetails) : []
  }

  extractSelectedDaysNumber() {
    let selectedDaysNumber = []
    this._daysNumberOptions.forEach((element) => {
      selectedDaysNumber = selectedDaysNumber.concat(element.selectedDaysNumber)
    })
    return selectedDaysNumber
  }
}
