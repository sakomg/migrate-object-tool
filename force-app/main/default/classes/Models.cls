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
    List<String> crons;
    String period;
    Time migrateTime;

    public List<String> getCrons() {
      if (crons == null) {
        this.setCrons();
      }

      return this.crons;
    }

    public virtual void setCrons() {
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
    List<String> selectedValues; // [1,2,3,4,5,6,7]

    public override void setCrons() {
      List<Object> params = new List<Object>{ '1/1', '*', '?', '*' };
      this.addCron(params);
    }
  }

  public class RecurrenceDataWeekly extends RecurrenceData {
    List<String> selectedValues; // [1,4,7]

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
  }

  public class RecurrenceDataMonthly extends RecurrenceData {
    List<String> selectedValues;

    public override void setCrons() {
      List<Object> params = new List<Object>{ String.join(this.selectedValues, ','), '*', '?', '*' };
      this.addCron(params);
    }
  }

  public class RecurrenceDataYearly extends RecurrenceData {
    List<TimePeriod> selectedValues;

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

  public class GeneralInformation {
    private List<msol__Migrate_Custom_Object_Store__c> storeItems;
    List<CronTrigger> cronItems;

    public GeneralInformation(List<msol__Migrate_Custom_Object_Store__c> storeItems, List<CronTrigger> cronItems) {
      this.storeItems = storeItems;
      this.cronItems = cronItems;
    }
  }
}
