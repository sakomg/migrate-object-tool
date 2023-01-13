const CUSTOM_OBJECT = 'custom_object'
const BIG_OBJECT = 'big_object'

const CREATE_NEW_BO_LINK = '/lightning/setup/BigObjects/home'
const CREATE_NEW_SO_LINK = '/lightning/setup/ObjectManager/home'

const TIME_PERIOD_TO_CLASS = {
  Daily: 'Models.RecurrenceDataDaily',
  Weekly: 'Models.RecurrenceDataWeekly',
  Monthly: 'Models.RecurrenceDataMonthly',
  Yearly: 'Models.RecurrenceDataYearly'
}

export default Object.assign({
  CUSTOM_OBJECT,
  BIG_OBJECT,
  CREATE_NEW_BO_LINK,
  CREATE_NEW_SO_LINK,
  TIME_PERIOD_TO_CLASS
})
