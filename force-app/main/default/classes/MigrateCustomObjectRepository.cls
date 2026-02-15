public with sharing class MigrateCustomObjectRepository {
  public List<msol__Migrate_Custom_Object_Store__c> getStoreData(String userId, String requestType) {
    List<String> fields = Constants.MIGRATE_OBJECT_FIELDS_BY_REQUEST_TYPE.get(requestType);
    String query =
      'SELECT ' +
      String.join(fields, ',') +
      ' FROM msol__Migrate_Custom_Object_Store__c ' +
      ' WHERE msol__User_Id__c = :userId';

    return (List<msol__Migrate_Custom_Object_Store__c>) Database.query(query);
  }

  public List<CronTrigger> getScheduledJobsData(Set<Id> jobIds, String requestType) {
    List<String> fields = Constants.CRON_TRIGGER_FIELDS_BY_REQUEST_TYPE.get(requestType);
    String query = 'SELECT ' + String.join(fields, ',') + ' FROM CronTrigger ' + 'WHERE Id IN :jobIds';

    return (List<CronTrigger>) Database.query(query);
  }

  public List<AsyncApexJob> getBatchJobsData(List<String> jobIds) {
    return [
      SELECT
        Id,
        ApexClassId,
        ApexClass.Name,
        JobItemsProcessed,
        JobType,
        NumberOfErrors,
        MethodName,
        Status,
        TotalJobItems,
        CronTriggerId
      FROM AsyncApexJob
      WHERE Id IN :jobIds
    ];
  }
}