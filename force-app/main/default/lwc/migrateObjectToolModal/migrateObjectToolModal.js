import { api } from 'lwc'
import LightningModal from 'lightning/modal'
import { deepCopy } from 'c/utilsPrivate'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export default class MigrateObjectToolModal extends LightningModal {
  @api targetData

  data = {}

  get selectedTimes() {
    let result = ''
    if (Object.keys(this.data).length === 0) {
      return result
    }

    const { selectedValues: values, period } = this.data.recurrenceSetup

    if (period === 'Yearly') {
      values.forEach((value) => {
        result += `${value.day} ${MONTHS[value.month - 1]}, `
      })
      result = result.slice(0, -2)
    }
    if (period === 'Monthly') {
      result = values.join(', ')
    }
    if (period === 'Weekly' || period === 'Daily') {
      const days = values.map((value) => DAYS[value - 1])
      result = days.join(', ')
    }

    return result || 'None'
  }

  connectedCallback() {
    this.data = deepCopy(this.targetData)
    console.log(this.data)
  }

  handleModalClose() {
    this.closeModal(undefined)
  }

  async handleModalExecute() {
    this.disableClose = true
    this.closeModal('execute')
  }

  handleOpenStep(event) {
    const step = event.currentTarget.dataset.step
    this.closeModal(step)
  }

  handleExpandStep(event) {
    const step = event.currentTarget.dataset.step
    const stepContainer = this.template.querySelector(`.${step}`)
    const classList = stepContainer.classList
    if (classList.value.includes('slds-is-open')) {
      classList.remove('slds-is-open')
    } else {
      classList.add('slds-is-open')
    }
  }

  closeModal(message) {
    this.disableClose = false
    this.close(message)
  }
}
