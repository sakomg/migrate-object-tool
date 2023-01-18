import constants from './constants'
import getData from '@salesforce/apex/MigrateCustomObjectController.getData'
// import getDataTrackedProperties from '@salesforce/apex/MigrateCustomObjectController.getDataTrackedProperties'
// import abortJob from '@salesforce/apex/MigrateCustomObjectController.abortJobById'
import getObjectNames from '@salesforce/apex/MigrateCustomObjectController.getObjectNames'
// import getFieldsByObjectName from '@salesforce/apex/MigrateCustomObjectController.getFieldsByObjectName'
import checkQueryCall from '@salesforce/apex/MigrateCustomObjectController.checkQuery'
// import processMigrate from '@salesforce/apex/MigrateCustomObjectController.processMigrate'

async function fetchSObjectNames() {
  let sObjectNameOptions = []
  try {
    const sObjectNames = await getObjectNames({ objectType: constants.CUSTOM_OBJECT })
    sObjectNameOptions = [...JSON.parse(sObjectNames), ...constants.SOBJECT_NAME_OPTIONS]
  } catch (error) {
    console.error('error in fetching sObject names', error)
  }
  return sObjectNameOptions
}

async function fetchBigObjectNames() {
  let bigObjectNameOptions = []
  try {
    const bigObjectNames = await getObjectNames({ objectType: constants.BIG_OBJECT })
    bigObjectNameOptions = [...JSON.parse(bigObjectNames), ...constants.BIG_OBJECT_NAME_OPTIONS]
  } catch (error) {
    console.error('error in fetching bigObject names', error)
  }
  return bigObjectNameOptions
}

async function fetchData(type) {
  let result = []
  try {
    const data = await getData({ requestType: type })
    result = data && data.length ? JSON.parse(data) : []
  } catch (error) {
    console.error('error in fetching scheduled jobs', error)
  }
  return result
}

async function checkQuery(value) {
  let responseUserQuery = {}
  try {
    const rawResponse = await checkQueryCall({ query: value })
    responseUserQuery = JSON.parse(rawResponse)
  } catch (error) {
    console.error('error in query check', error)
  }
  return responseUserQuery
}

export default { fetchBigObjectNames, fetchSObjectNames, fetchData, checkQuery }
