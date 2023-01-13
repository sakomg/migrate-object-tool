public without sharing class MigrateCustomObjectController {
  private final static MigrateCustomObjectValidator VALIDATOR;

  static {
    VALIDATOR = new MigrateCustomObjectValidator();
  }

  @AuraEnabled
  public static String getScheduledJobs() {
    List<Models.AsyncJob> result = new List<Models.AsyncJob>();
    List<AsyncApexJob> origJobs = [
      SELECT Id, ApexClassId, ApexClass.Name, JobItemsProcessed, JobType, Status, NumberOfErrors, MethodName
      FROM AsyncApexJob
      WHERE JobType IN ('ScheduledApex')
    ];

    for (AsyncApexJob origJob : origJobs) {
      result.add(new Models.AsyncJob(origJob));
    }

    return JSON.serialize(result);
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
      System.debug('raw: ' + recurrence);
      if (VALIDATOR.validateMigrateParams(sObjectName, bigObjectName, query, fieldMapping, recurrence)) {
        Models.RecurrenceWrapper recurrenceWrapper = (Models.RecurrenceWrapper) JSON.deserialize(
          recurrence,
          Models.RecurrenceWrapper.class
        );
        String className = recurrenceWrapper.getClassName();
        String data = recurrenceWrapper.getPayload();
        Integer chunkSize = 2000;
        Models.RecurrenceData recurrenceData = (Models.RecurrenceData) JSON.deserialize(data, Type.forName(className));
        System.debug('recurrenceData: ' + recurrenceData);
        List<String> crons = recurrenceData.getCrons();
        System.debug('crons: ' + crons);
        MigrateCustomObjectService service = new MigrateCustomObjectService(sObjectName, bigObjectName, query, fieldMapping);

        for (Integer i = 0; i < crons.size(); i++) {
          System.schedule(
            className + ': ' + DateTime.now() + ' (' + sObjectName + ' -> ' + bigObjectName + ') ' + i,
            crons[i],
            new MigrateCustomObjectScheduler(service, chunkSize)
          );
        }
      }
    } catch (Exception e) {
      throw new MigrateCustomObjectException('Main issue. ' + e.getMessage());
    }
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
