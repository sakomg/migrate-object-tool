import { LightningElement, api } from 'lwc'
import { deepCopy } from 'c/utilsPrivate'

const PANEL_SECTIONS = [
  {
    label: 'New',
    new: true,
    progress: false,
    scheduled: false,
    items: [
      {
        label: 'None',
        name: 'new_create',
        icon: 'standard:bundle_config'
      }
    ]
  },
  {
    label: 'In Progress',
    new: false,
    progress: true,
    scheduled: false,
    items: [
      {
        label: 'Account',
        name: 'progress_account',
        icon: 'standard:account'
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
  },
  {
    label: 'Scheduled',
    new: false,
    progress: false,
    scheduled: true,
    items: [
      {
        label: 'Case',
        name: 'scheduled_case',
        icon: 'standard:case'
      },
      {
        label: 'Product',
        name: 'scheduled_product',
        icon: 'standard:product'
      }
    ]
  }
]

export default class MigrateObjectToolPanel extends LightningElement {
  _mainData
  initiallySelected = 'create_new'
  navigationData = PANEL_SECTIONS

  get mainData() {
    return this._mainData
  }

  @api
  set mainData(value) {
    this._mainData = deepCopy(value)
  }

  connectedCallback() {
    console.log(JSON.parse(JSON.stringify(this._mainData)))
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
