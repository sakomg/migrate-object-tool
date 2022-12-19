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
}
