public without sharing class Utils {
  public static String getIconBySObjectName(String sObjectName) {
    String u = 'standard:template';
    List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
    List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
    List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

    for (Schema.DescribeTabSetResult tsr : tabSetDesc) {
      tabDesc.addAll(tsr.getTabs());
    }

    for (Schema.DescribeTabResult tr : tabDesc) {
      if (sObjectName == tr.getSobjectName()) {
        if (tr.isCustom() == true) {
          iconDesc.addAll(tr.getIcons());
        } else {
          u = 'standard:' + sObjectName.toLowerCase();
        }
      }
    }
    for (Schema.DescribeIconResult ir : iconDesc) {
      if (ir.getContentType() == 'image/svg+xml') {
        u = 'custom:' + ir.getUrl().substringBetween('custom/', '.svg').substringBefore('_');
        break;
      }
    }
    return u;
  }

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