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
    String cron;
    String period;
    Time migrateTime;

    public virtual String getCron() {
      return null;
    }

    private void setCron(List<Object> params) {
      String seconds = String.valueOf(this.migrateTime.second());
      String minutes = String.valueOf(this.migrateTime.minute());
      String hours = String.valueOf(this.migrateTime.hour());
      List<Object> times = new List<Object>{ seconds, minutes, hours };
      times.addAll(params);
      this.cron = String.format('{0} {1} {2} {3} {4} {5} {6}', times);
    }
  }

  public class RecurrenceDataDaily extends RecurrenceData {
    List<String> selectedValues; // [1,2,3,4,5,6,7]

    public override String getCron() {
      List<Object> params = new List<Object>{ '1/1', '*', '?', '*' };
      this.setCron(params);
      return this.cron;
    }
  }

  public class RecurrenceDataWeekly extends RecurrenceData {
    List<String> selectedValues; // [1,4,7]

    public override String getCron() {
      List<String> selectedDayValues = new List<String>();

      for (String value : this.selectedValues) {
        String shortDay = Constants.DAY_BY_NUMBER.get(value);
        if (shortDay != null) {
          selectedDayValues.add(shortDay);
        }
      }

      List<Object> params = new List<Object>{ String.join(selectedDayValues, ','), '*', '?', '*' };
      this.setCron(params);
      return this.cron;
    }
  }

  public class RecurrenceDataMonthly extends RecurrenceData {
    List<String> selectedValues;

    public override String getCron() {
      return 'monthly';
    }
  }

  public class RecurrenceDataYearly extends RecurrenceData {
    List<TimePeriod> selectedValues;

    public override String getCron() {
      return 'yearly';
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
}