import { LightningElement, api } from 'lwc'
import { deepCopy } from 'c/utilsPrivate'
import getBatchJobsData from '@salesforce/apex/MigrateCustomObjectController.getBatchJobsData'

const PROGRESS_STATES = ['QUEUED', 'ACQUIRED', 'EXECUTING']

export default class MigrateObjectToolPanel extends LightningElement {
  @api sObjectName
  @api bigObjectName
  _mainData = []
  _jobIntervalId
  _jobs = []

  get mainData() {
    return this._mainData
  }

  @api
  set mainData(value) {
    this._mainData = deepCopy(value)
  }

  get draftItems() {
    const labelDraft = this.sObjectName || this.bigObjectName ? `${this.sObjectName} -> ${this.bigObjectName}` : ''
    return [
      {
        label: labelDraft || 'None',
        name: 'new_create',
        icon: 'standard:bundle_config'
      }
    ]
  }

  get progressItems() {
    const result = []
    const jobs = [...this._jobs]
    const items = this.buildItems(this._mainData, (item) => item.batchId !== null || PROGRESS_STATES.includes(item.state))
    console.log(items)
    console.log(jobs)
    jobs.forEach((job) => {
      items.forEach((item) => {
        if (item.batchId === job.batchId) {
          result.push({ ...job, ...item })
        }
      })
    })
    console.log('RESULT: ', result)
    return result
  }

  get progressBatchIds() {
    return this._mainData.filter((item) => item.batchId !== null).map(({ batchId }) => batchId)
  }

  get scheduledItems() {
    return this.buildItems(this._mainData, (item) => item.state === 'WAITING')
  }

  get finishedItems() {
    return this.buildItems(this._mainData, (item) => item.state === 'DELETED' && item.batchId === null)
  }

  connectedCallback() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._jobIntervalId = setInterval(this._getBatchJobsData.bind(this), 2000)
  }

  disconnectedCallback() {
    clearInterval(this._jobIntervalId)
  }

  buildItems(data, filterCallback) {
    return data.filter(filterCallback).map((item) => {
      return {
        ...item,
        label: `${item.sObjectName} -> ${item.bigObjectName}`,
        name: item.cronId
      }
    })
  }

  async _getBatchJobsData() {
    if (this.progressBatchIds && this.progressBatchIds.length) {
      const result = await getBatchJobsData({ batchIds: this.progressBatchIds })
      if (result && result.length) {
        this._jobs = JSON.parse(result)
      }
    }
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
