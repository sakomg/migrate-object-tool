public without sharing class MigrateCustomObjectLogger {
  public enum Status {
    SUCCESS,
    ERROR,
    WARNING,
    INFO,
    DONE
  }

  public class Log {
    DateTime timeStamp;
    String text;

    public Log(String text) {
      this.text = text;
      this.timeStamp = DateTime.now();
    }

    public override String toString() {
      return '[' + this.timeStamp + '] : ' + text + ' \n';
    }
  }

  private List<Log> logList;
  private String entryPoint;
  private msol__Migrate_Custom_Object_Setting__c setting;

  public MigrateCustomObjectLogger(String entryPoint) {
    this.setting = msol__Migrate_Custom_Object_Setting__c.getOrgDefaults();
    this.entryPoint = entryPoint;
    this.logList = new List<Log>();
  }

  public void log(String text) {
    this.logList.add(new Log(text));
  }

  public String insertLog(Status status, String message) {
    String executionMessage = message.length() > 255 ? message.substring(0, 255) : message;
    Migrate_Custom_Object_Log__c executionLog = new Migrate_Custom_Object_Log__c(
      Status__c = status.name(),
      Message__c = executionMessage,
      Entry_Point__c = this.entryPoint
    );
    this.insertLog(executionLog);

    if (!this.logList.isEmpty()) {
      this.createLogRecord(this.logList, executionLog.Id);
    }

    return executionLog.Id;
  }

  private void createLogRecord(List<Log> logList, String parentRecordId) {
    String result = '';
    for (Log log : logList) {
      result += log.toString();
    }

    this.insertLog(
      new Attachment(ParentId = parentRecordId, Name = 'process.log', ContentType = 'text/rtf', Body = Blob.valueOf(result))
    );
  }

  private void insertLog(SObject record) {
    if (this.setting.msol__Enable_Logs__c) {
      insert record;
    }
  }
}
