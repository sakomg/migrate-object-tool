import { LightningElement, api } from 'lwc'

const PANEL_SECTIONS = [
  {
    label: 'New',
    items: [
      {
        label: 'None',
        name: 'new_create',
        icon: 'standard:bundle_config',
        new: true,
        inProgress: false,
        scheduled: false
      }
    ]
  },
  {
    label: 'In Progress',
    items: [
      {
        label: 'Account',
        name: 'progress_account',
        icon: 'standard:account',
        new: false,
        inProgress: true,
        scheduled: false
      },
      {
        label: 'Contact',
        name: 'progress_contact',
        icon: 'standard:contact',
        new: false,
        inProgress: true,
        scheduled: false
      },
      {
        label: 'Opportunity',
        name: 'progress_opportunity',
        icon: 'standard:opportunity',
        new: false,
        inProgress: true,
        scheduled: false
      }
    ]
  },
  {
    label: 'Scheduled',
    items: [
      {
        label: 'Case',
        name: 'scheduled_case',
        icon: 'standard:case',
        new: false,
        inProgress: false,
        scheduled: true
      },
      {
        label: 'Product',
        icon: 'standard:product',
        new: false,
        inProgress: false,
        scheduled: true
      }
    ]
  }
]

export default class MigrateObjectToolPanel extends LightningElement {
  @api scheduledJobs
  initiallySelected = 'create_new'
  navigationData = PANEL_SECTIONS

  get scheduledData() {
    return []
  }

  connectedCallback() {
    console.log(this.scheduledJobs)
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
