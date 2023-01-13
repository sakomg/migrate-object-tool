import { LightningElement, api } from 'lwc'
import { Drag } from './utils'

export default class MigrateObjectToolMain extends LightningElement {
  @api sObjectNameOptions
  @api bigObjectNameOptions
  @api loadingObj
  @api soFieldOptions
  @api boFieldOptions
  @api messageAfterQuery
  @api styleAfterQuery
  @api conditionQueryValue
  activeSections = ['step-1', 'step-2', 'step-3', 'step-4']
  _fieldPairs

  get fieldPairs() {
    return this._fieldPairs
  }

  @api
  set fieldPairs(value) {
    this._fieldPairs = [...value]
  }

  get drag() {
    return new Drag([...this.fieldPairs])
  }

  get recurrenceComponent() {
    return this.template.querySelector('c-migrate-object-tool-recurrence')
  }

  @api
  getRecurrenceSetupData() {
    return this.recurrenceComponent.getRecurrenceSetupData()
  }

  @api
  setActiveSection(sectionName) {
    const accordion = this.template.querySelector('.container-accordion')
    accordion.activeSectionName = sectionName
  }

  handleDragEnd(event) {
    this.drag.end(event)
  }

  handleSObjectChange(event) {
    this.fireEvent('sobjectchange', event)
  }

  handleBigObjectChange(event) {
    this.fireEvent('bigobjectchange', event)
  }

  handleObjectFieldChange(event) {
    this.fireEvent('fieldchange', event)
  }

  handleDeleteIconClick(event) {
    this.fireEvent('deleteicon', event)
  }

  handleInputUserQuery(event) {
    this.fireEvent('inputquery', event)
  }

  fireEvent(eventName, event) {
    this.dispatchEvent(new CustomEvent(eventName, event))
  }
}
