public without sharing class MigrateCustomObjectController {
  @AuraEnabled
  public static void processMigrate(String sObjectName, String bigObjectName, Map<String, String> fieldMapping) {
    try {
      MigrateCustomObjectService service = new MigrateCustomObjectService(sObjectName, bigObjectName, fieldMapping);
      Database.executeBatch(new MigrateCustomObjectBatch(service), 2000);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
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
      ' WHERE IsCustomizable = true ';

    if (objectType == 'big_object') {
      // TODO: add enum
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
      if (Utils.isValidField(describe)) {
        result.add(new Models.PickListOption(label, value));
      }
    }

    result.sort();

    return JSON.serialize(result);
  }
}
