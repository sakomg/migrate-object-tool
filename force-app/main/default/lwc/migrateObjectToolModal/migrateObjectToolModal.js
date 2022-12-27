import { api } from 'lwc'
import LightningModal from 'lightning/modal'

export default class MigrateObjectToolModal extends LightningModal {
  @api targetData

  handleModalCancel() {
    this.close('canceled')
  }

  async handleModalSave() {
    console.log(this.targetData)
    if (this.isValid()) {
      // begin saving data
      this.disableClose = true
      await this.saveData()
    } else {
      // function that display form errors based on data
      this.showFormErrors()
    }
  }

  handleModalSelect() {
    // for test
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: {
          id: 42
        }
      })
    )
  }

  isValid() {
    return true
  }

  showFormErrors() {}

  closeModal() {
    this.disableClose = false
    this.close('success')
  }

  async saveData() {
    return this.closeModal()
  }
}
