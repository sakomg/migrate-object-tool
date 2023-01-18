import { LightningElement, api } from 'lwc'
import { deepCopy } from 'c/utilsPrivate'

export default class MigrateObjectToolPanel extends LightningElement {
  _mainData
  inProgressCronTriggerIds = []

  get draftItems() {
    return [
      {
        label: 'None',
        name: 'new_create',
        icon: 'standard:bundle_config'
      }
    ]
  }

  get progressItems() {
    return [
      {
        label: 'Account',
        name: 'progress_account',
        icon: 'standard:account',
        processedChunks: 0,
        totalChunks: 10
      },
      {
        label: 'Contact',
        name: 'progress_contact',
        icon: 'standard:contact'
      },
      {
        label: 'Opportunity',
        name: 'progress_opportunity',
        icon: 'standard:opportunity'
      }
    ]
  }

  get scheduledItems() {
    return this._mainData.map((item) => {
      return {
        ...item,
        label: `${item.sObjectName} -> ${item.bigObjectName}`,
        name: item.jobId
      }
    })
  }

  get cronTriggerIds() {
    return this._mainData.map(({ jobId }) => jobId)
  }

  get mainData() {
    return this._mainData
  }

  @api
  set mainData(value) {
    this._mainData = deepCopy(value)
  }

  handleTogglePanelLeft() {
    this.fireEvent('togglepanel', {})
  }

  handleSelectProcess(event) {
    this.fireEvent('select', event)
  }

  fireEvent(eventName, event) {
    this.dispatchEvent(new CustomEvent(eventName, event))
  }
}
