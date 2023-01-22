public without sharing class MigrateCustomObjectController {
  private final static MigrateCustomObjectValidator VALIDATOR;
  private final static MigrateCustomObjectRepository REPOSITORY;
  private final static Integer CHUNK_SIZE = 1;

  static {
    VALIDATOR = new MigrateCustomObjectValidator();
    REPOSITORY = new MigrateCustomObjectRepository();
  }

  @AuraEnabled
  public static String getData(String requestType) {
    String userId = UserInfo.getUserId();
    List<msol__Migrate_Custom_Object_Store__c> storeData = REPOSITORY.getStoreData(userId, requestType);
    Map<Id, msol__Migrate_Custom_Object_Store__c> jobIdToStoreItem = collectJobIdToStoreItem(storeData);
    List<CronTrigger> cronTriggers = REPOSITORY.getScheduledJobsData(jobIdToStoreItem.keySet(), requestType);
    List<Models.GeneralInformation> result = new List<Models.GeneralInformation>();

    String className = Constants.GENERAL_INFORMATION_CLASS_NAME_BY_REQUEST_TYPE.get(requestType);
    Type type = Type.forName('msol', className);

    for (CronTrigger cronTrigger : cronTriggers) {
      msol__Migrate_Custom_Object_Store__c storeItem = jobIdToStoreItem.get(cronTrigger.Id);
      if (storeItem != null && cronTrigger != null) {
        Models.GeneralInformation generalInformationImpl = (Models.GeneralInformation) type.newInstance();
        generalInformationImpl.wrapStore(storeItem);
        generalInformationImpl.wrapCrone(cronTrigger);

        result.add(generalInformationImpl);
      }
    }

    return JSON.serialize(result);
  }

  @AuraEnabled
  public static String getBatchJobsData(List<String> batchIds) {
    List<Models.AsyncJob> result = new List<Models.AsyncJob>();

    if (batchIds.isEmpty()) {
      return JSON.serialize(result);
    }

    List<AsyncApexJob> jobs = REPOSITORY.getBatchJobsData(batchIds);

    for (AsyncApexJob job : jobs) {
      result.add(new Models.AsyncJob(job));
    }

    return JSON.serialize(result);
  }

  @AuraEnabled
  public static void abortJobById(String jobId) {
    if (String.isBlank(jobId)) {
      return;
    }
    try {
      List<msol__Migrate_Custom_Object_Store__c> store = [
        SELECT Id
        FROM msol__Migrate_Custom_Object_Store__c
        WHERE msol__Cron_Id__c = :jobId
      ];
      System.abortJob(jobId);
      delete store;
    } catch (Exception e) {
      throw new MigrateCustomObjectException('Abort issue. ' + e.getMessage());
    }
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
        Recurrence.RecurrenceWrapper recurrenceWrapper = (Recurrence.RecurrenceWrapper) JSON.deserialize(
          recurrence,
          Recurrence.RecurrenceWrapper.class
        );
        String className = recurrenceWrapper.getClassName();
        String data = recurrenceWrapper.getPayload();
        Recurrence.RecurrenceData recurrenceData = (Recurrence.RecurrenceData) JSON.deserialize(data, Type.forName(className));

        System.debug('recurrenceData ' + recurrenceData);
        List<String> crons = recurrenceData.getCrons();
        System.debug('crons ' + crons);
        MigrateCustomObjectService service = new MigrateCustomObjectService(sObjectName, bigObjectName, query, fieldMapping);

        for (Integer i = 0; i < crons.size(); i++) {
          String jobName = className + ': ' + System.now() + ' (' + i + ')';
          MigrateCustomObjectScheduler scheduler = new MigrateCustomObjectScheduler(service, CHUNK_SIZE);
          String cronId = System.schedule(jobName, crons[i], scheduler);
          msol__Migrate_Custom_Object_Store__c storeItem = generateStoreItem(
            cronId,
            jobName,
            sObjectName,
            bigObjectName,
            query,
            crons[i],
            fieldMapping,
            recurrenceData
          );
          storeItems.add(storeItem);
        }
        insert storeItems;
      }
    } catch (Exception e) {
      throw new MigrateCustomObjectException('Main issue. ' + e.getMessage());
    }
  }

  private static Map<Id, msol__Migrate_Custom_Object_Store__c> collectJobIdToStoreItem(
    List<msol__Migrate_Custom_Object_Store__c> storeData
  ) {
    Map<Id, msol__Migrate_Custom_Object_Store__c> result = new Map<Id, msol__Migrate_Custom_Object_Store__c>();
    for (msol__Migrate_Custom_Object_Store__c item : storeData) {
      String jobId = item.msol__Cron_Id__c;
      if (String.isNotBlank(jobId)) {
        result.put(jobId, item);
      }
    }
    return result;
  }

  private static msol__Migrate_Custom_Object_Store__c generateStoreItem(
    String cronId,
    String jobName,
    String sObjectName,
    String bigObjectName,
    String query,
    String cron,
    Map<String, String> fieldMapping,
    Recurrence.RecurrenceData recurrenceData
  ) {
    return new msol__Migrate_Custom_Object_Store__c(
      msol__Recurrence_Details__c = recurrenceData.getSelectedValues(),
      msol__Migrate_Time__c = recurrenceData.getMigrateTime(),
      msol__Period__c = recurrenceData.getPeriod(),
      msol__Cron_Id__c = cronId,
      msol__Job_Name__c = jobName,
      msol__SObject_Name__c = sObjectName,
      msol__Big_Object_Name__c = bigObjectName,
      msol__SOQL__c = query,
      msol__Cron_Expression__c = cron,
      msol__Field_Mapping__c = JSON.serializePretty(fieldMapping),
      msol__User_Id__c = UserInfo.getUserId(),
      msol__Icon_Name__c = Utils.getIconBySObjectName(sObjectName)
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
