public with sharing class MigrateCustomObjectController {

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

        String soql = 'SELECT QualifiedApiName, DeveloperName, MasterLabel, Label, PluralLabel, ' + 
            ' IsCustomizable, IsApexTriggerable, IsWorkflowEnabled, IsProcessEnabled, ' +
            ' KeyPrefix, IsCustomSetting, IsDeprecatedAndHidden, IsTriggerable, ' +
            ' IsIdEnabled, IsEverCreatable, IsEverUpdatable, IsFeedEnabled, IsQueryable ' +
        ' FROM EntityDefinition ' +
        ' WHERE IsCustomizable = true ';

        if (objectType == 'big_object') { // TODO: add enum
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
    public static String getSObjectsNames() {
        List<Models.PickListOption> pickListOptions = new List<Models.PickListOption>();

        for(Schema.SObjectType objTyp : Schema.getGlobalDescribe().values()){
            Schema.DescribeSObjectResult objDescription = objTyp.getDescribe();
            
            if (isAvailableSObject(objDescription)) {
                pickListOptions.add(new Models.PickListOption(objDescription.getLabel(), objDescription.getName()));
            }
        }

        return JSON.serialize(pickListOptions);
    }

    private static Boolean isAvailableSObject(Schema.DescribeSObjectResult objDescription) {
        Boolean result = objDescription.isDeletable() && !objDescription.isCustomSetting();
        String name = objDescription.getName();
        
        if (objDescription.isCustom()) {
            result = result && name.endsWithIgnoreCase('__c');
        } else {
            for (String nameEnd : Constants.UNAVAILABLE_STANDARD_SOBJECTS_ENDS) {
                result = result && !name.endsWithIgnoreCase(nameEnd);
            }
        }
    
        return result; 
    }
}