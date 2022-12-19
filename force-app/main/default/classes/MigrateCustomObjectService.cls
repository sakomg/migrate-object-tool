public without sharing class MigrateCustomObjectService implements MigrateCustomObject {

    public enum ObjectType {
        CAMPAIGN_MEMBER,
        INDIVIDUAL_EMAIL_RESULT,
        WORK_ORDER,
        WORK_ORDER_LINE_ITEM
    }

    private final ObjectType objectType;
    private static final List<String> MISSING_BO_TYPES = new List<String> { 'BOOLEAN' };
    
    private static final Map<ObjectType, String> TYPE_TO_API_NAME = new Map<ObjectType, String> {
        ObjectType.CAMPAIGN_MEMBER => 'CampaignMember',
        ObjectType.INDIVIDUAL_EMAIL_RESULT => 'et4ae5__IndividualEmailResult__c',
        ObjectType.WORK_ORDER => 'WorkOrder',
        objectType.WORK_ORDER_LINE_ITEM => 'WorkOrderLineItem'
    };

    private static final Map<String, String> CUSTOM_TO_BO_OBJECT = new Map<String, String> {
        'CampaignMember' => 'MC_Campaign_Member__b',
        'et4ae5__IndividualEmailResult__c' => 'MC_Individual_Email_Result__b',
        'WorkOrder' => 'RepairOrder__b',
        'WorkOrderLineItem' => 'RepairOrderDetail__b'
    };

    public MigrateCustomObjectService() {}

    public MigrateCustomObjectService(ObjectType objectType) {
        this.objectType = objectType;
    }

    public String getObjectType() {
        return this.objectType.name();
    }

    public String getCustomObjectName() {
        return TYPE_TO_API_NAME.get(this.objectType);
    }

    public String getBigObjectName() {
        String sObjectName = TYPE_TO_API_NAME.get(this.objectType);
        return CUSTOM_TO_BO_OBJECT.get(sObjectName);
    }

    public void migrateAllObjects() {
        this.migrateCampaignMembers();
        this.migrateEmailResults();
        this.migrateWorkOrderLineItems();
        this.migrateWorkOrders();
    }

    public void migrateCampaignMembers() {
        MigrateCustomObjectService service = new MigrateCustomObjectService(
            MigrateCustomObjectService.ObjectType.CAMPAIGN_MEMBER
        );
        MigrateCustomObjectBatch batch = new MigrateCustomObjectBatch(service);
        Database.executeBatch(batch, 1500);
    }

    public void migrateEmailResults() {
        MigrateCustomObjectService service = new MigrateCustomObjectService(
            MigrateCustomObjectService.ObjectType.INDIVIDUAL_EMAIL_RESULT
        );
        MigrateCustomObjectBatch batch = new MigrateCustomObjectBatch(service);
        Database.executeBatch(batch, 1500);
    }

    public void migrateWorkOrders() {
        MigrateCustomObjectService service = new MigrateCustomObjectService(
            MigrateCustomObjectService.ObjectType.WORK_ORDER
        );
        MigrateCustomObjectBatch batch = new MigrateCustomObjectBatch(service);
        Database.executeBatch(batch, 1500);
    }

    public void migrateWorkOrderLineItems() {
        MigrateCustomObjectService service = new MigrateCustomObjectService(
            MigrateCustomObjectService.ObjectType.WORK_ORDER_LINE_ITEM
        );
        MigrateCustomObjectBatch batch = new MigrateCustomObjectBatch(service);
        Database.executeBatch(batch, 1500);
    }

    public String generateQuery(Integer additionalMonths) {
        String sObjectName = TYPE_TO_API_NAME.get(this.objectType);
        Set<String> fields = this.getFieldsBySObjectName(sObjectName).keySet();
        String query = 'SELECT ' + String.join(new List<String>(fields), ', ') +
            ' FROM ' + sObjectName +
            ' WHERE CreatedDate < LAST_N_MONTHS:' + String.valueOf(additionalMonths);
        
        return query;
    }

    public List<SObject> processMigrate(List<SObject> customObjectRecords) {
        List<SObject> result = new List<SObject>();
        String sObjectName = TYPE_TO_API_NAME.get(this.objectType);
        List<Schema.SObjectField> infoFields = this.getFieldsBySObjectName(sObjectName).values();
        Map<String, String> mappingCustomToBO = this.getCurrentMapping();

        for (SObject record : customObjectRecords) {
            SObject recordBO = Schema.getGlobalDescribe().get(CUSTOM_TO_BO_OBJECT.get(sObjectName)).newSObject();
            for (Schema.SObjectField customField : infoFields) {
                Schema.DescribeFieldResult describeField = customField.getDescribe();
                this.buildBORecord(record, recordBO, describeField, mappingCustomToBO);
            }
            result.add(recordBO);
        }

        return result;
    }

    private void buildBORecord(SObject record, SObject recordBO, Schema.DescribeFieldResult describeField, Map<String, String> mappingCustomToBO) {
        String field = describeField.getName();
        Object value = record.get(field);
        if (mappingCustomToBO.containsKey(field)) {
            if (MISSING_BO_TYPES.contains(describeField.getType().name().toUpperCase())) {
                recordBO.put(mappingCustomToBO.get(field), String.valueOf(value));
            } else {
                recordBO.put(mappingCustomToBO.get(field), value);
            }
        }
    }

    private Map<String, String> getCurrentMapping() {
        Map<String, String> result = new Map<String, String>();

        List<Migrate_Custom_Object_Setting__mdt> origSettings = [
            SELECT Id, Big_Object_Field__c, Custom_Object_Field__c
            FROM Migrate_Custom_Object_Setting__mdt
            WHERE Object_Type__c = :this.objectType.name()
        ];

        for (Migrate_Custom_Object_Setting__mdt mdtRecord : origSettings) {
            String customObjectField = mdtRecord.Custom_Object_Field__c;
            String bigObjectField = mdtRecord.Big_Object_Field__c;
            if (String.isNotBlank(customObjectField) && String.isNotBlank(bigObjectField)) {
                result.put(customObjectField, bigObjectField);
            }
        }

        return result;
    }

    public Map<String, Schema.SObjectField> getFieldsBySObjectName(String sObjectName) {
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe(); 
        Schema.SObjectType sobjType = globalDescribe.get(sObjectName); 
        Schema.DescribeSObjectResult describeResult = sobjType.getDescribe(); 
        Map<String, Schema.SObjectField> fieldsMap = describeResult.fields.getMap();
        return fieldsMap;
    }
}
