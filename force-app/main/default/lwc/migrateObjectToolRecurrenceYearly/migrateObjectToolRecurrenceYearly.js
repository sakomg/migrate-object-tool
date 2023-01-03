import { LightningElement, api, track } from 'lwc'

export default class MigrateObjectToolRecurrenceYearly extends LightningElement {
  @api
  monthDayPairsList = []
  @track
  monthDayPairs = []

  dummyMonthDayPair = {
    index: 0,
    month: '',
    day: '',
    dayOptions: [],
    isDisabled: true,
    toShowDeleteButton: false
    // toShowDropButton: false
  }

  monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ]

  connectedCallback() {
    this.monthDayPairs = this.prepareMonthDayPairs()
    this.addDummyPair()
  }

  prepareMonthDayPairs() {
    const tmpMonthDayPairs = []
    if (!this.monthDayPairsList.length) {
      tmpMonthDayPairs.push({ ...this.dummyMonthDayPair })
      return tmpMonthDayPairs
    }

    for (let i = 0; i < this.monthDayPairsList.length; i++) {
      const tmpPair = { ...this.dummyMonthDayPair }

      tmpPair.index = i
      tmpPair.month = this.monthDayPairsList[i].month
      tmpPair.day = this.monthDayPairsList[i].day

      if (tmpPair.day) {
        tmpPair.toShowDeleteButton = true
      }

      tmpPair.dayOptions = this.getDayOptions(tmpPair.month)
      tmpPair.isDisabled = false

      tmpMonthDayPairs.push(tmpPair)
    }

    return tmpMonthDayPairs
  }

  handleYearlyPairChange(event) {
    event.stopPropagation()
    event.preventDefault()

    const newValue = Number(event.detail.value)
    const pairIndex = Number(event.currentTarget.dataset.pairIndex)
    const property = event.currentTarget.dataset.property

    this.monthDayPairs[pairIndex][property] = newValue

    if (property === 'month') {
      this.monthDayPairs[pairIndex].dayOptions = this.getDayOptions(newValue)
      this.monthDayPairs[pairIndex].isDisabled = false
    }

    this.addDummyPair()
    this.dispatchNewMonthDayPairsList()
  }

  getDayOptions(month) {
    const daysInMonth = new Date(2022, month, 0).getDate()
    const dayOptions = []

    for (let index = 1; index <= daysInMonth; index++) {
      dayOptions.push({ label: index + '', value: index })
    }

    return dayOptions
  }

  addDummyPair() {
    const monthDayPairs = [...this.monthDayPairs]
    const lastIndex = monthDayPairs.length - 1
    const pair = monthDayPairs[lastIndex]
    console.log('pair ', JSON.stringify(pair))

    if (pair.month && pair.day) {
      const dummyPair = { ...this.dummyFieldPair }

      console.log('dummyPair ', dummyPair)

      monthDayPairs[lastIndex].toShowDeleteButton = true
      //   monthDayPairs[lastIndex].toShowDropButton = true
      dummyPair.index = lastIndex + 1
      monthDayPairs.push(dummyPair)
      this.monthDayPairs = [...monthDayPairs]
    }
  }

  handleDeleteIconClick(event) {
    event.stopPropagation()
    const pairIndex = Number(event.currentTarget.dataset.pairIndex)

    const result = this.monthDayPairs.filter((pair) => pair.index !== pairIndex)

    for (let i = 0; i < result.length; i++) {
      result[i].index = i
    }

    this.monthDayPairs = [...result]
    this.dispatchNewMonthDayPairsList()
  }

  dispatchNewMonthDayPairsList() {
    const newMonthDayPairsList = []

    this.monthDayPairs.forEach((pair) => {
      if (pair.month) {
        newMonthDayPairsList.push({ month: pair.month, day: pair.day })
      }
    })

    console.log('dispatchNewMonthDayPairsList ', JSON.stringify(newMonthDayPairsList))

    this.dispatchEvent(new CustomEvent('change', { detail: { newMonthDayPairsList } }))
  }
}