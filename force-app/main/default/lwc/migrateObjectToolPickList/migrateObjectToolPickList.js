import { api, LightningElement } from 'lwc'

export default class MigrateObjectToolPickList extends LightningElement {
  @api
  options = []
  @api
  value
  @api
  label
  @api
  placeholder
  @api
  variant

  get selectedOptionLabel() {
    let label = this.placeholder

    this.options.every((option) => {
      if (option.value === this.value) {
        label = option.label
        return false
      }
      return true
    })

    return label
  }

  get labelClassList() {
    let classList = ['slds-form-element__label']

    if (this.variant === 'label-hidden') {
      classList.push('slds-hide')
    }

    return classList.toString(' ')
  }

  handlePickListClick(event) {
    event.stopPropagation()
    let classList = event.currentTarget.classList

    if (classList.contains('slds-is-open')) {
      classList.remove('slds-is-open')
    } else {
      classList.add('slds-is-open')
      this.scrollToSelectedValue()
    }
  }

  handleOptionClick(event) {
    const node = event.currentTarget

    const svgNodes = this.template.querySelectorAll('[data-key="check"]')

    svgNodes.forEach((element) => {
      element.classList.add('slds-hide')
    })

    const nodeChilde = node.querySelector('.slds-hide')
    nodeChilde.classList.remove('slds-hide')

    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.value = event.currentTarget.dataset.value

    this.dispatchEvent(new CustomEvent('change'))

    const buttonNode = this.template.querySelector('button')
    buttonNode.classList.add('slds-combobox__input-value')
  }

  handleKeyDown(event) {
    console.log('handleKeyDown')
    console.log(event.key)
  }

  scrollToSelectedValue() {
    let tmpValue = this.value

    const selectedValueNode = this.template.querySelector(`[data-value="${tmpValue}"]`)

    if (selectedValueNode != null) {
      selectedValueNode.scrollIntoView()
    }
  }

  closePickListOptions(event) {
    event.stopPropagation()

    const node = this.template.querySelector('.slds-combobox')

    node?.classList.remove('slds-is-open')
  }
}
