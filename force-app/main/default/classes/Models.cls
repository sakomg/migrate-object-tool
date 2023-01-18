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

  public virtual class RecurrenceData {
    private List<String> crons;
    private String period;
    private Time migrateTime;

    public List<String> getCrons() {
      if (crons == null) {
        this.setCrons();
      }

      return this.crons;
    }

    public virtual void setCrons() {
    }

    public virtual String getSelectedValues() {
      return null;
    }

    public Time getMigrateTime() {
      return this.migrateTime;
    }

    public String getPeriod() {
      return this.period;
    }

    private void addCron(List<Object> params) {
      String seconds = String.valueOf(this.migrateTime.second());
      String minutes = String.valueOf(this.migrateTime.minute());
      String hours = String.valueOf(this.migrateTime.hour());
      List<Object> times = new List<Object>{ seconds, minutes, hours };
      times.addAll(params);
      String cron = String.format('{0} {1} {2} {3} {4} {5} {6}', times);
      System.debug('setCron' + cron);

      if (this.crons == null) {
        this.crons = new List<String>{ cron };
      } else {
        this.crons.add(cron);
      }
    }
  }

  public class RecurrenceDataDaily extends RecurrenceData {
    public List<String> selectedValues; // [1,2,3,4,5,6,7]

    public override void setCrons() {
      List<Object> params = new List<Object>{ '1/1', '*', '?', '*' };
      this.addCron(params);
    }

    public override String getSelectedValues() {
      return JSON.serializePretty(this.selectedValues);
    }
  }

  public class RecurrenceDataWeekly extends RecurrenceData {
    public List<String> selectedValues; // [1,4,7]

    public override void setCrons() {
      List<String> selectedDayValues = new List<String>();

      for (String value : this.selectedValues) {
        String shortDay = Constants.DAY_BY_NUMBER.get(value);
        if (shortDay != null) {
          selectedDayValues.add(shortDay);
        }
      }

      List<Object> params = new List<Object>{ '?', '*', String.join(selectedDayValues, ','), '*' };
      this.addCron(params);
    }

    public override String getSelectedValues() {
      return JSON.serializePretty(this.selectedValues);
    }
  }

  public class RecurrenceDataMonthly extends RecurrenceData {
    public List<String> selectedValues;

    public override void setCrons() {
      List<Object> params = new List<Object>{ String.join(this.selectedValues, ','), '*', '?', '*' };
      this.addCron(params);
    }

    public override String getSelectedValues() {
      return JSON.serializePretty(this.selectedValues);
    }
  }

  public class RecurrenceDataYearly extends RecurrenceData {
    public List<TimePeriod> selectedValues;

    public override void setCrons() {
      Map<Integer, List<Integer>> monthToDays = new Map<Integer, List<Integer>>();

      for (TimePeriod timePeriod : this.selectedValues) {
        if (monthToDays.containsKey(timePeriod.month)) {
          monthToDays.get(timePeriod.month).add(timePeriod.day);
        } else {
          monthToDays.put(timePeriod.month, new List<Integer>{ timePeriod.day });
        }
      }

      for (Integer month : monthToDays.keySet()) {
        List<Integer> days = monthToDays.get(month);
        if (days == null) {
          continue;
        }
        days.sort();
        List<Object> params = new List<Object>{ String.join(days, ','), month, '?', '*' };
        this.addCron(params);
      }
    }

    public override String getSelectedValues() {
      return JSON.serializePretty(this.selectedValues);
    }
  }

  public class TimePeriod {
    Integer day;
    Integer month;
  }

  public class RecurrenceWrapper {
    private String className;
    private String payload;

    public String getClassName() {
      return this.className;
    }

    public String getPayload() {
      return this.payload;
    }
  }

  public class AsyncJob {
    private String jobId;
    private String className;
    private Integer itemsProcessed;
    private String jobType;
    private String status;
    private Integer numberOfErrors;
    private String methodName;

    public AsyncJob(AsyncApexJob origJob) {
      this.className = origJob.ApexClass.Name;
      this.itemsProcessed = origJob.JobItemsProcessed;
      this.jobId = origJob.Id;
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
    private String jobId;
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
      this.jobId = storeItem.isSet('msol__Job_Id__c') ? storeItem.msol__Job_Id__c : null;
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
    private String jobId;
    private String state;

    public TrackedGeneralInformation() {
      super();
    }

    public override void wrapStore(msol__Migrate_Custom_Object_Store__c storeItem) {
      this.jobId = storeItem.isSet('msol__Job_Id__c') ? storeItem.msol__Job_Id__c : null;
    }

    public override void wrapCrone(CronTrigger cronItem) {
      this.state = cronItem.isSet('State') ? cronItem.State : null;
    }
  }
}
