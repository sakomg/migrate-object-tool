public with sharing class MigrateCustomObjectValidator {
  public Boolean validateMigrateParams(
    String sObjectName,
    String bigObjectName,
    String query,
    Map<String, String> fieldMapping,
    String recurrence
  ) {
    String baseMessage = 'Invalid process migrate params. ';
    if (String.isBlank(sObjectName)) {
      throw new MigrateCustomObjectException(baseMessage + 'SObject Name cannot be empty.');
    }
    if (String.isBlank(bigObjectName)) {
      throw new MigrateCustomObjectException(baseMessage + 'Big Object Name cannot be empty.');
    }
    if (String.isBlank(query)) {
      throw new MigrateCustomObjectException(baseMessage + 'Query cannot be empty.');
    }
    if (fieldMapping == null || fieldMapping.isEmpty()) {
      throw new MigrateCustomObjectException(baseMessage + 'Please, complete mapping for fields.');
    }
    if (String.isBlank(recurrence)) {
      throw new MigrateCustomObjectException(baseMessage + 'There isn\'t recurrence data.');
    }
    return true;
  }
}
