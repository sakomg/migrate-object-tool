const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

const CREATE_NEW_BO_LINK = '/lightning/setup/BigObjects/home'
const CREATE_NEW_SO_LINK = '/lightning/setup/ObjectManager/home'

const TIME_PERIOD_TO_CLASS = {
  Once: 'Recurrence.RecurrenceDataOnce',
  Daily: 'Recurrence.RecurrenceDataDaily',
  Weekly: 'Recurrence.RecurrenceDataWeekly',
  Monthly: 'Recurrence.RecurrenceDataMonthly',
  Yearly: 'Recurrence.RecurrenceDataYearly'
}

const SOBJECT_NAME_OPTIONS = [
  {
    label: 'Create New',
    value: CUSTOM_OBJECT,
    iconName: 'utility:add'
  }
]

const BIG_OBJECT_NAME_OPTIONS = [
  {
    label: 'Create New',
    value: BIG_OBJECT,
    iconName: 'utility:add'
  }
]

const DUMMY_FIELD_PAIR = {
  index: 0,
  soField: '',
  boField: '',
  soFieldType: '',
  boFieldType: '',
  toShowDeleteButton: false,
  toShowDropButton: false,
  toShowValidIndicator: false
}

const LOADING_OBJ = {
  main: false,
  panel: false,
  step1: false,
  step2: false,
  step3: false,
  step4: false
}

const RESPONSE_USER_QUERY = {
  message: '',
  dataLength: [],
  success: null
}

const TRACK_DATA_CHANGE_INTERVAL = 1000 * 4

const VALIDATE_RESULT = { hasError: false, items: [{ success: true, message: null }] }

export default Object.assign({
  CUSTOM_OBJECT,
  BIG_OBJECT,
  CREATE_NEW_BO_LINK,
  CREATE_NEW_SO_LINK,
  TIME_PERIOD_TO_CLASS,
  BIG_OBJECT_NAME_OPTIONS,
  SOBJECT_NAME_OPTIONS,
  DUMMY_FIELD_PAIR,
  LOADING_OBJ,
  RESPONSE_USER_QUERY,
  TRACK_DATA_CHANGE_INTERVAL,
  VALIDATE_RESULT
})
