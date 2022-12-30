import { api } from 'lwc'
import LightningModal from 'lightning/modal'
import { deepCopy } from 'c/utilsPrivate'

export default class MigrateObjectToolModal extends LightningModal {
  @api targetData

  data = {}

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
    console.log(step)
  }

  closeModal(message) {
    this.disableClose = false
    this.close(message)
  }
}
