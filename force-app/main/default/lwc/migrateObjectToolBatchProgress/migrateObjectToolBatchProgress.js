import { LightningElement, track } from 'lwc'
import { subscribe, unsubscribe } from 'lightning/empApi'

export default class MigrateObjectToolBatchProgress extends LightningElement {
  channelName = '/event/Batch_Process__e'
  @track recordsProcessed = 0
  totalRecords = 100
  subscription = {}

  get processedPercent() {
    return (this.recordsProcessed / this.totalRecords) * 100
  }

  get statusStyle() {
    return this.recordsProcessed === 0 ? 'slds-badge' : 'slds-badge slds-theme_success'
  }

  get statusValue() {
    return this.recordsProcessed === 0 ? 'InActive' : 'Active'
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
      this.updateRecordValue(response.data.payload.Count__c)
    }

    subscribe(this.channelName, replyId, messageCallback).then((response) => {
      console.log('Subscription request sent to: ', JSON.stringify(response.channel))
      this.subscription = response
    })
  }

  updateRecordValue(count) {
    this.recordsProcessed = count
  }

  handleUnsubscribe() {
    unsubscribe(this.subscription, (response) => {
      console.log('unsubscribe() response: ', JSON.stringify(response))
    })
  }
}
