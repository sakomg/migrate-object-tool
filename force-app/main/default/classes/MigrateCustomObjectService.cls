public without sharing class MigrateCustomObjectService implements MigrateCustomObject {
  private final String sObjectName;
  private final String bigObjectName;
  private final Map<String, String> fieldMapping;
  private final Map<String, Schema.SObjectField> fieldsDescibe;

  public MigrateCustomObjectService(String sObjectName, String bigObjectName, Map<String, String> fieldMapping) {
    this.sObjectName = sObjectName;
    this.bigObjectName = bigObjectName;
    this.fieldMapping = fieldMapping;
    this.fieldsDescibe = Utils.getFieldsByObjectName(sObjectName);
  }

  public String getSObjectName() {
    return this.sObjectName;
  }

  public String getBigObjectName() {
    return this.bigObjectName;
  }

  public Map<String, String> getFieldMapping() {
    return this.fieldMapping;
  }

  public String generateQuery(Integer additionalMonths) {
    Set<String> fields = this.fieldsDescibe.keySet();
    String query =
      'SELECT ' +
      String.join(new List<String>(fields), ', ') +
      ' FROM ' +
      this.sObjectName +
      ' WHERE CreatedDate < LAST_N_MONTHS:' +
      String.valueOf(additionalMonths);

    return query;
  }

  public List<SObject> processMigrate(List<SObject> customObjectRecords) {
    List<SObject> result = new List<SObject>();
    List<Schema.SObjectField> infoFields = this.fieldsDescibe.values();

    for (SObject record : customObjectRecords) {
      SObject recordBO = Schema.getGlobalDescribe().get(this.bigObjectName).newSObject();
      for (Schema.SObjectField customField : infoFields) {
        Schema.DescribeFieldResult describeField = customField.getDescribe();
        this.buildBORecord(record, recordBO, describeField);
      }
      result.add(recordBO);
    }

    return result;
  }

  private void buildBORecord(SObject record, SObject recordBO, Schema.DescribeFieldResult describeField) {
    String field = describeField.getName();
    Object value = record.get(field);
    if (this.fieldMapping.containsKey(field)) {
      if (Constants.MISSING_BO_TYPES.contains(describeField.getType().name().toUpperCase())) {
        recordBO.put(this.fieldMapping.get(field), String.valueOf(value));
      } else {
        recordBO.put(this.fieldMapping.get(field), value);
      }
    }
  }
}
