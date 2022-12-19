public interface MigrateCustomObject {
    String generateQuery(Integer additionalMonths);
    List<SObject> processMigrate(List<SObject> customObjectRecords);
    void migrateAllObjects();
}