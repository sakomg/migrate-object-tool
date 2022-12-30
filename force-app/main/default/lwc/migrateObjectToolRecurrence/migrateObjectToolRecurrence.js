import { LightningElement } from 'lwc'

export default class MigrateObjectToolRecurrence extends LightningElement {
  selectedPeriod = 'Daily'
  selectedWeekDays = ['1', '2', '3', '4', '5', '6', '7']
  savedSelectedWeekDays = []
  disabledWeekDays = true

  selectedDaysNumber = []
  savedSelectedDaysNumber = []
  daysNumberOptions = []
  toSaveSelectedWeekDays = false

  monthDayPairsList = []

  get periodOptions() {
    return [
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
    this.daysNumberOptions = this.getNonSelectedDaysNumberOptions()
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

    if (this.selectedPeriod === 'Monthly') {
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

    this.daysNumberOptions[rangeIndex].selectedDaysNumber = selectedDaysNumber
  }

  handleMonthDayPairsChange(event) {
    event.stopPropagation()
    event.preventDefault()
    let tmpMonthDayPairsList = []
    tmpMonthDayPairsList = event.detail.newList

    console.log(JSON.stringify(event.detail))

    console.log('handleMonthDayPairsChange tmpMonthDayPairsList', JSON.stringify(tmpMonthDayPairsList))
    this.monthDayPairsList = tmpMonthDayPairsList
    console.log('handleMonthDayPairsChange monthDayPairsList', JSON.stringify(this.monthDayPairsList))
  }
}
