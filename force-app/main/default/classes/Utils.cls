public without sharing class Utils {
  public static Map<String, Schema.SObjectField> getFieldsByObjectName(String sObjectName) {
    Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
    Schema.SObjectType sobjType = globalDescribe.get(sObjectName);
    Schema.DescribeSObjectResult describeResult = sobjType.getDescribe();
    Map<String, Schema.SObjectField> fieldsMap = describeResult.fields.getMap();
    return fieldsMap;
  }

  public static Boolean isValidField(Schema.DescribeFieldResult describe) {
    if (describe == null) {
      return false;
    }

    if (Constants.SYSTEM_FIELDS.contains(describe.getName())) {
      return false;
    }

    return true;
  }
}
