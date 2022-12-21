import { LightningElement } from 'lwc'
import getObjectNames from '@salesforce/apex/MigrateCustomObjectController.getObjectNames'

const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

export default class MigrateObjectTool extends LightningElement {
  sObjectNameOptions = []
  bigObjectNameOptions = []
  loading = false

  async connectedCallback() {
    let promises = []

    promises.push(this._getSObjectNames())
    promises.push(this._getBigObjectNames())

    Promise.all(promises).finally(() => (this.loading = false))
  }

  async _getSObjectNames() {
    try {
      this.loading = true
      const sObjectNames = await getObjectNames({ objectType: CUSTOM_OBJECT })
      this.sObjectNameOptions = JSON.parse(sObjectNames)
      console.log(s(this.sObjectNameOptions))
    } catch (error) {
      console.error('error in fetching sObject names', error)
    }
  }

  async _getBigObjectNames() {
    try {
      this.loading = true
      const bigObjectNames = await getObjectNames({ objectType: BIG_OBJECT })
      this.bigObjectNameOptions = JSON.parse(bigObjectNames)
      console.log(s(this.bigObjectNameOptions))
    } catch (error) {
      console.error('error in fetching bigObject names', error)
    }
  }

  handleSObjectChange(event) {
    const newValue = event.detail.value
    console.log('co', newValue)
  }

  handleBigObjectChange(event) {
    const newValue = event.detail.value
    console.log('bo', newValue)
  }
}

function s(o) {
  return JSON.parse(JSON.stringify(o))
}
