public with sharing class Recurrence {
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
      System.debug('setCron ' + cron);

      if (this.crons == null) {
        this.crons = new List<String>{ cron };
      } else {
        this.crons.add(cron);
      }
    }
  }

  public class RecurrenceDataOnce extends RecurrenceData {
    public List<String> selectedValues;

    public override void setCrons() {
      Datetime now = Datetime.now();
      Integer day = now.day();
      Integer year = now.year();
      Integer hours = now.hour();
      Integer minutes = now.minute();
      Integer seconds = now.second() + 10;
      Integer millisec = now.millisecond();
      this.migrateTime = Time.newInstance(hours, minutes, seconds, millisec);
      List<Object> params = new List<Object>{ day, now.format('MMM').toUpperCase(), '?', year };
      this.addCron(params);
    }

    public override String getSelectedValues() {
      return JSON.serializePretty(this.selectedValues);
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
}