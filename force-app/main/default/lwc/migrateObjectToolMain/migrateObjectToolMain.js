import { LightningElement, api } from 'lwc'

export default class MigrateObjectToolMain extends LightningElement {
  @api sObjectNameOptions
  @api bigObjectNameOptions
  @api loadingObj
  @api soFieldOptions
  @api boFieldOptions
  @api responseUserQuery
  @api requestUserQuery
  @api currentSObjectName
  @api currentBigObjectName
  @api fieldPairs
  activeSections = ['step-1', 'step-2', 'step-3', 'step-4']

  get recurrenceComponent() {
    return this.template.querySelector('c-migrate-object-tool-recurrence')
  }

  @api
  getRecurrenceSetupData() {
    return this.recurrenceComponent.getRecurrenceSetupData()
  }

  @api
  setRecurrenceSetupData(data) {
    return this.recurrenceComponent.setRecurrenceSetupData(data)
  }

  @api
  setActiveSection(sectionName) {
    const accordion = this.template.querySelector('.container-accordion')
    accordion.activeSectionName = sectionName
  }

  handleInputUserQuery(event) {
    this.fireEvent('inputquery', event)
  }

  fireEvent(eventName, event) {
    this.dispatchEvent(new CustomEvent(eventName, event))
  }
}
