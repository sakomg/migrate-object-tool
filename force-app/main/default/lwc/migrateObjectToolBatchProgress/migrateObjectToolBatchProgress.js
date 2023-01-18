import { LightningElement, api } from 'lwc'
import { subscribe, unsubscribe } from 'lightning/empApi'

export default class MigrateObjectToolBatchProgress extends LightningElement {
  channelName = '/event/Batch_Process__e'
  totalChunks = 0
  processedChunks = 0
  subscription = {}
  _item

  get item() {
    return this._item
  }

  @api
  set item(value) {
    this._item = { ...value }
  }

  get processedPercent() {
    if (this.totalChunks === 0) {
      return 0
    }
    return (this.processedChunks / this.totalChunks) * 100
  }

  get statusStyle() {
    if (this.processedChunks === 0) {
      return 'slds-badge'
    }
    if (this.processedChunks === this.totalChunks) {
      return 'slds-badge slds-theme_success'
    }
    if (this.processedChunks > 0) {
      return 'slds-badge_lightest'
    }
    return ''
  }

  get statusValue() {
    if (this.processedChunks === 0) {
      return 'In Active'
    }
    if (this.processedChunks === this.totalChunks) {
      return 'Done'
    }
    if (this.processedChunks > 0) {
      return 'In Progress'
    }
    return ''
  }

  connectedCallback() {
    this.handleSubscribe()
  }

  disconnectedCallback() {
    this.handleUnsubscribe()
  }

  handleSubscribe() {
    const replyId = -1
    const messageCallback = (response) => {
      console.log(JSON.stringify(response.data))
      const { msol__Chunks_Total__c, msol__Chunks_Processed__c, msol__Batch_Id__c } = response.data.payload
      this.updateRecordValue(msol__Batch_Id__c, msol__Chunks_Total__c, msol__Chunks_Processed__c)
    }

    subscribe(this.channelName, replyId, messageCallback).then((response) => {
      console.log('Subscription request sent to: ', JSON.stringify(response.channel))
      this.subscription = response
    })
  }

  updateRecordValue(jobId, total, processed) {
    this.totalChunks = total
    this.processedChunks = processed + 1
  }

  handleUnsubscribe() {
    unsubscribe(this.subscription, (response) => {
      console.log('unsubscribe() response: ', JSON.stringify(response))
    })
  }
}
