public without sharing class Utils {

    public static Map<String, Schema.SObjectField> getFieldsBySObjectName(String sObjectName) {
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe(); 
        Schema.SObjectType sobjType = globalDescribe.get(sObjectName); 
        Schema.DescribeSObjectResult describeResult = sobjType.getDescribe(); 
        Map<String, Schema.SObjectField> fieldsMap = describeResult.fields.getMap();
        return fieldsMap;
    }

}
