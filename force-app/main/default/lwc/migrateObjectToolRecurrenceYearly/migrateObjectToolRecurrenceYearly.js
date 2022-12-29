import { LightningElement, track } from 'lwc'

export default class MigrateObjectToolRecurrenceYearly extends LightningElement {
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

  //   @track bigObjectNameOptions = []
  @track monthDayPairs = []
  @track dummyMonthDayPair = {
    index: 0,
    month: '',
    day: '',
    dayOptions: [],
    isDisabled: true,
    toShowDeleteButton: false
    // toShowDropButton: false
  }

  connectedCallback() {
    this.monthDayPairs.push({ ...this.dummyMonthDayPair })
  }

  handleYearlyPairChange(event) {
    const newValue = Number(event.detail.value)
    const pairIndex = event.currentTarget.dataset.pairIndex
    const property = event.currentTarget.dataset.property
    console.log('newValue', newValue)
    console.log('pairIndex', pairIndex)
    console.log('property', property)

    this.monthDayPairs[pairIndex][property] = newValue

    if (property === 'month') {
      this.monthDayPairs[pairIndex].dayOptions = this.getDayOptions(newValue)
      this.monthDayPairs[pairIndex].isDisabled = false
    }

    this.addDummyPair(pairIndex)
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
    console.log('pair ', pair)

    if (pair.month && pair.day) {
      const dummyPair = { ...this.dummyFieldPair }

      console.log('dummyPair ', dummyPair)

      monthDayPairs[lastIndex].toShowDeleteButton = true
      //   monthDayPairs[lastIndex].toShowDropButton = true
      dummyPair.index = lastIndex + 1
      monthDayPairs.push(dummyPair)
      this.monthDayPairs = [...monthDayPairs]
      console.log(this.monthDayPairs)
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
}
