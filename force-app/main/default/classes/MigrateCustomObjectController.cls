public without sharing class MigrateCustomObjectController {
  private final static MigrateCustomObjectValidator VALIDATOR;
  private final static Integer CHUNK_SIZE = 2000;

  static {
    VALIDATOR = new MigrateCustomObjectValidator();
  }

  @AuraEnabled
  public static String getData() {
    Set<Id> jobIds = new Set<Id>();
    String userId = UserInfo.getUserId();
    List<msol__Migrate_Custom_Object_Store__c> storeData = getStoreData(userId);
    for (msol__Migrate_Custom_Object_Store__c item : storeData) {
      String jobId = item.msol__Job_Id__c;
      if (String.isNotBlank(jobId)) {
        jobIds.add(jobId);
      }
    }
    List<CronTrigger> cronTriggers = getScheduledJobsData(jobIds);

    return JSON.serialize(new Models.GeneralInformation(storeData, cronTriggers));
  }

  private static List<msol__Migrate_Custom_Object_Store__c> getStoreData(String userId) {
    return [
      SELECT
        Id,
        msol__Job_Id__c,
        msol__Job_Name__c,
        msol__SObject_Name__c,
        msol__Big_Object_Name__c,
        msol__SOQL__c,
        msol__Cron_Expression__c,
        msol__Field_Mapping__c,
        msol__User_Id__c
      FROM msol__Migrate_Custom_Object_Store__c
      WHERE msol__User_Id__c = :userId
    ];
  }

  private static List<CronTrigger> getScheduledJobsData(Set<Id> jobIds) {
    return [
      SELECT
        Id,
        CronExpression,
        CronJobDetail.Name,
        CronJobDetailId,
        EndTime,
        NextFireTime,
        PreviousFireTime,
        StartTime,
        State,
        TimesTriggered,
        CronJobDetail.JobType
      FROM CronTrigger
      WHERE Id IN :jobIds
    ];
  }

  @AuraEnabled
  public static void processMigrate(
    String sObjectName,
    String bigObjectName,
    String query,
    Map<String, String> fieldMapping,
    String recurrence
  ) {
    try {
      if (VALIDATOR.validateMigrateParams(sObjectName, bigObjectName, query, fieldMapping, recurrence)) {
        List<msol__Migrate_Custom_Object_Store__c> storeItems = new List<msol__Migrate_Custom_Object_Store__c>();
        Models.RecurrenceWrapper recurrenceWrapper = (Models.RecurrenceWrapper) JSON.deserialize(
          recurrence,
          Models.RecurrenceWrapper.class
        );
        String className = recurrenceWrapper.getClassName();
        String data = recurrenceWrapper.getPayload();
        Models.RecurrenceData recurrenceData = (Models.RecurrenceData) JSON.deserialize(data, Type.forName(className));
        List<String> crons = recurrenceData.getCrons();
        MigrateCustomObjectService service = new MigrateCustomObjectService(sObjectName, bigObjectName, query, fieldMapping);

        for (Integer i = 0; i < crons.size(); i++) {
          String jobName = className + ': ' + System.now() + ' (' + i + ')';
          String jobId = System.schedule(jobName, crons[i], new MigrateCustomObjectScheduler(service, CHUNK_SIZE));
          msol__Migrate_Custom_Object_Store__c storeItem = generateStoreItem(
            jobId,
            jobName,
            sObjectName,
            bigObjectName,
            query,
            crons[i],
            fieldMapping
          );
          storeItems.add(storeItem);
        }
        insert storeItems;
      }
    } catch (Exception e) {
      throw new MigrateCustomObjectException('Main issue. ' + e.getMessage());
    }
  }

  private static msol__Migrate_Custom_Object_Store__c generateStoreItem(
    String jobId,
    String jobName,
    String sObjectName,
    String bigObjectName,
    String query,
    String cron,
    Map<String, String> fieldMapping
  ) {
    return new msol__Migrate_Custom_Object_Store__c(
      msol__Job_Id__c = jobId,
      msol__Job_Name__c = jobName,
      msol__SObject_Name__c = sObjectName,
      msol__Big_Object_Name__c = bigObjectName,
      msol__SOQL__c = query,
      msol__Cron_Expression__c = cron,
      msol__Field_Mapping__c = JSON.serializePretty(fieldMapping),
      msol__User_Id__c = UserInfo.getUserId()
    );
  }

  @AuraEnabled
  public static String getObjectNames(String objectType) {
    List<Models.PickListOption> pickListOptions = new List<Models.PickListOption>();

    String soql =
      'SELECT QualifiedApiName, DeveloperName, MasterLabel, Label, PluralLabel, ' +
      ' IsCustomizable, IsApexTriggerable, IsWorkflowEnabled, IsProcessEnabled, ' +
      ' KeyPrefix, IsCustomSetting, IsDeprecatedAndHidden, IsTriggerable, ' +
      ' IsIdEnabled, IsEverCreatable, IsEverUpdatable, IsFeedEnabled, IsQueryable ' +
      ' FROM EntityDefinition ' +
      ' WHERE IsCustomizable = true ' +
      ' AND IsQueryable = true ';

    if (objectType == 'big_object') {
      soql += 'AND IsIdEnabled = false';
    } else if (objectType == 'custom_object') {
      soql += 'AND IsIdEnabled = true';
    }

    for (EntityDefinition entity : Database.query(soql)) {
      pickListOptions.add(new Models.PickListOption(entity.Label, entity.QualifiedApiName));
    }

    pickListOptions.sort();

    return JSON.serialize(pickListOptions);
  }

  @AuraEnabled
  public static String getFieldDefinitionsByObjectName(String objectName) {
    List<Models.FieldDefinition> result = new List<Models.FieldDefinition>();
    Map<String, Schema.SObjectField> rawFields = Utils.getFieldsByObjectName(objectName);

    for (Schema.SObjectField rawField : rawFields.values()) {
      result.add(new Models.FieldDefinition(rawField.getDescribe()));
    }

    return JSON.serialize(result);
  }

  @AuraEnabled
  public static String getFieldsByObjectName(String objectName) {
    List<Models.PickListOption> result = new List<Models.PickListOption>();
    Map<String, Schema.SObjectField> rawFields = Utils.getFieldsByObjectName(objectName);

    for (Schema.SObjectField rawField : rawFields.values()) {
      Schema.DescribeFieldResult describe = rawField.getDescribe();
      String label = describe.getLabel();
      String value = describe.getName();
      String type = describe.getType().name();
      if (Utils.isValidField(describe)) {
        result.add(new Models.PickListOptionWithType(label, value, type));
      }
    }

    result.sort();

    return JSON.serialize(result);
  }

  @AuraEnabled
  public static String checkQuery(String query) {
    Models.UserQueryResponse response = new Models.UserQueryResponse();
    System.debug(query);
    if (String.isBlank(query)) {
      return JSON.serialize(response);
    }

    try {
      // String escapedQuery = String.escapeSingleQuotes(query);
      // System.debug(escapedQuery);
      Integer dataLength = Database.countQuery(query);
      response.setSuccess(true);
      response.setDataLength(dataLength);
    } catch (QueryException e) {
      response.setSuccess(false);
      response.setMessage(e.getMessage());
    }

    return JSON.serialize(response);
  }
}
