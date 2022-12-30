public interface MigrateCustomObject {
  String generateQuery();
  List<SObject> processMigrate(List<SObject> customObjectRecords);
}
