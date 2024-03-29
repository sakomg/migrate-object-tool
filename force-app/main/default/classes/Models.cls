public without sharing class Models {
  public virtual class PickListOption implements Comparable {
    private String label;
    private String value;

    public PickListOption(String label, String value) {
      this.label = label;
      this.value = value;
    }

    public Integer compareTo(Object compareTo) {
      PickListOption compareToOption = (PickListOption) compareTo;
      if (this.label == compareToOption.label) {
        return 0;
      }
      if (this.label > compareToOption.label) {
        return 1;
      }
      return -1;
    }
  }

  public class PickListOptionWithType extends PickListOption {
    private String type;

    public PickListOptionWithType(String label, String value, String type) {
      super(label, value);
      this.type = type;
    }
  }

  public class FieldDefinition {
    private String value;
    private String type;
    private Integer length;

    public FieldDefinition(Schema.DescribeFieldResult describe) {
      this.value = describe.getName();
      this.type = describe.getType().name();
      this.length = describe.getLength();
    }
  }

  public class UserQueryResponse {
    private Boolean success;
    private Integer dataLength;
    private String message;

    public Boolean isSuccess() {
      return this.success;
    }

    public Integer getDataLength() {
      return this.dataLength;
    }

    public String getMessage() {
      return this.message;
    }

    public void setSuccess(Boolean success) {
      this.success = success;
    }

    public void setDataLength(Integer length) {
      this.dataLength = length;
    }

    public void setMessage(String message) {
      this.message = message;
    }
  }

  public class AsyncJob {
    private String batchId;
    private String cronTriggerId;
    private String className;
    private Integer itemsProcessed;
    private Integer totalJobItems;
    private String jobType;
    private String status;
    private Integer numberOfErrors;
    private String methodName;

    public AsyncJob(AsyncApexJob origJob) {
      this.className = origJob.ApexClass.Name;
      this.itemsProcessed = origJob.JobItemsProcessed;
      this.totalJobItems = origJob.TotalJobItems;
      this.batchId = origJob.Id.to15();
      this.cronTriggerId = origJob.CronTriggerId;
      this.jobType = origJob.JobType;
      this.status = origJob.Status;
      this.numberOfErrors = origJob.NumberOfErrors;
      this.methodName = origJob.MethodName;
    }
  }

  public virtual class GeneralInformation {
    public virtual void wrapStore(msol__Migrate_Custom_Object_Store__c storeItem) {
    }
    public virtual void wrapCrone(CronTrigger cronItem) {
    }

    private String safeFormat(Datetime origDatetime) {
      return origDatetime != null ? origDatetime.format() : null;
    }
  }

  public class InitialGeneralInformation extends GeneralInformation {
    private String storeId;
    private String cronId;
    private String batchId;
    private String jobName;
    private String sObjectName;
    private String bigObjectName;
    private String query;
    private String cronExpression;
    private String fieldMapping;
    private String userId;
    private String timeZone;
    private String jobDetailName;
    private String jobDetailId;
    private Datetime endTime;
    private Datetime nextFireTime;
    private Datetime prevFireTime;
    private Datetime startTime;
    private String state;
    private Integer timesTriggered;
    private String jobType;
    private String recurrenceDetails;
    private Time migrateTime;
    private String period;
    private String icon;

    public InitialGeneralInformation() {
      super();
    }

    public override void wrapStore(msol__Migrate_Custom_Object_Store__c storeItem) {
      this.storeId = storeItem.Id;
      this.cronId = storeItem.isSet('msol__Cron_Id__c') ? storeItem.msol__Cron_Id__c : null;
      this.batchId = storeItem.isSet('msol__Batch_Id__c') ? storeItem.msol__Batch_Id__c : null;
      this.jobName = storeItem.isSet('msol__Job_Name__c') ? storeItem.msol__Job_Name__c : null;
      this.sObjectName = storeItem.isSet('msol__SObject_Name__c') ? storeItem.msol__SObject_Name__c : null;
      this.bigObjectName = storeItem.isSet('msol__Big_Object_Name__c') ? storeItem.msol__Big_Object_Name__c : null;
      this.query = storeItem.isSet('msol__SOQL__c') ? storeItem.msol__SOQL__c : null;
      this.fieldMapping = storeItem.isSet('msol__Field_Mapping__c') ? storeItem.msol__Field_Mapping__c : null;
      this.userId = storeItem.isSet('msol__User_Id__c') ? storeItem.msol__User_Id__c : null;
      this.recurrenceDetails = storeItem.isSet('msol__Recurrence_Details__c') ? storeItem.msol__Recurrence_Details__c : null;
      this.migrateTime = storeItem.isSet('msol__Migrate_Time__c') ? storeItem.msol__Migrate_Time__c : null;
      this.period = storeItem.isSet('msol__Period__c') ? storeItem.msol__Period__c : null;
      this.icon = storeItem.isSet('msol__Icon_Name__c') ? storeItem.msol__Icon_Name__c : null;
      this.timeZone = UserInfo.getTimeZone().toString();
    }

    public override void wrapCrone(CronTrigger cronItem) {
      this.cronExpression = cronItem.isSet('CronExpression') ? cronItem.CronExpression : null;
      this.jobDetailName = cronItem.isSet('CronJobDetailId') ? cronItem.CronJobDetail.Name : null;
      this.jobDetailId = cronItem.isSet('CronJobDetailId') ? cronItem.CronJobDetailId : null;
      this.endTime = cronItem.isSet('EndTime') ? cronItem.EndTime : null;
      this.nextFireTime = cronItem.isSet('NextFireTime') ? cronItem.NextFireTime : null;
      this.prevFireTime = cronItem.isSet('PreviousFireTime') ? cronItem.PreviousFireTime : null;
      this.startTime = cronItem.isSet('StartTime') ? cronItem.StartTime : null;
      this.state = cronItem.isSet('State') ? cronItem.State : null;
      this.timesTriggered = cronItem.isSet('TimesTriggered') ? cronItem.TimesTriggered : null;
      this.jobType = cronItem.isSet('CronJobDetailId') ? cronItem.CronJobDetail.JobType : null;
    }
  }

  public class TrackedGeneralInformation extends GeneralInformation {
    private String cronId;
    private String batchId;
    private String state;

    public TrackedGeneralInformation() {
      super();
    }

    public override void wrapStore(msol__Migrate_Custom_Object_Store__c storeItem) {
      this.cronId = storeItem.isSet('msol__Cron_Id__c') ? storeItem.msol__Cron_Id__c : null;
      this.batchId = storeItem.isSet('msol__Batch_Id__c') ? storeItem.msol__Batch_Id__c : null;
    }

    public override void wrapCrone(CronTrigger cronItem) {
      this.state = cronItem.isSet('State') ? cronItem.State : null;
    }
  }
}
