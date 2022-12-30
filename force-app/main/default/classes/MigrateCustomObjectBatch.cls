public without sharing class MigrateCustomObjectBatch implements Database.Batchable<SObject>, Database.Stateful {
  private MigrateCustomObjectService service;
  private MigrateCustomObjectLogger logger;

  private Integer totalSizeError = 0;
  private Integer totalSizeSuccess = 0;

  public MigrateCustomObjectBatch(MigrateCustomObjectService service) {
    this.service = service;
    String entryPoint =
      'Process migrate Custom Objects. Custom Object Name: ' +
      service.getSObjectName() +
      ', Big Object Name: ' +
      service.getBigObjectName();
    this.logger = new MigrateCustomObjectLogger(entryPoint);
  }

  public Database.QueryLocator start(Database.BatchableContext context) {
    String query = this.service.generateQuery();
    this.logger.log('Query: ' + query);
    return Database.getQueryLocator(query);
  }

  public void execute(Database.BatchableContext context, List<SObject> scope) {
    try {
      String messageBeforeProcess = String.format(
        'Processing "{0}" Object "{1}" Mapping: "{2}".',
        new List<Object>{ scope.size(), this.service.getSObjectName(), this.service.getFieldMapping() }
      );
      this.logger.log(messageBeforeProcess);
      List<SObject> bigObjects = this.service.processMigrate(scope);
      String messageAfterProcess = String.format(
        'Processed "{0}" Object: "{1}".',
        new List<Object>{ bigObjects.size(), this.service.getBigObjectName() }
      );
      this.logger.log(messageAfterProcess);
      if (!bigObjects.isEmpty()) {
        List<Id> successIds = new List<Id>();
        Map<Id, List<String>> errors = new Map<Id, List<String>>();
        List<SObject> customObjectsToDelete = new List<SObject>();
        List<Database.SaveResult> result = null;

        if (!Test.isRunningTest()) {
          result = Database.insertImmediate(bigObjects);
        } else {
          result = new List<Database.SaveResult>();
        }
        for (Integer i = 0; i < result.size(); i++) {
          if (result[i].isSuccess()) {
            successIds.add(scope[i].Id);
          } else {
            List<String> errItem = new List<String>();
            for (Database.Error err : result[i].getErrors()) {
              errItem.add(err.getMessage());
            }
            errors.put(scope[i].Id, errItem);
          }
        }

        this.totalSizeSuccess += successIds.size();

        if (successIds.size() == scope.size()) {
          customObjectsToDelete.addAll(scope);
        } else {
          for (SObject record : scope) {
            if (successIds.contains(String.valueOf(record.get('Id')))) {
              customObjectsToDelete.add(record);
            }
          }

          this.totalSizeError += errors.keySet().size();

          String finalMessage = String.format('Created "{0}". Errors: "{1}"', new List<Object>{ successIds.size(), errors });
          this.logger.log(finalMessage);

          String insertMessage = String.format(
            'Custom Objects: "{0}" Big Objects: "{1}" Created: "{2}" Error IDs: "{3}"',
            new List<Object>{ successIds.size(), bigObjects.size(), result.size(), errors.keySet() }
          );

          this.logger.insertLog(MigrateCustomObjectLogger.Status.WARNING, insertMessage);
        }

        if (!customObjectsToDelete.isEmpty()) {
          Database.delete(customObjectsToDelete, false);
        }
      }
      this.logger.insertLog(MigrateCustomObjectLogger.Status.SUCCESS, 'OK');
    } catch (Exception e) {
      this.logger.insertLog(
        MigrateCustomObjectLogger.Status.ERROR,
        'Error cause: ' + e.getMessage() + ' | ' + e.getStackTraceString()
      );
    } finally {
      this.publishEventToBar(context);
    }
  }

  public void finish(Database.BatchableContext context) {
    String finishedMessage = 'Finished. Success size: ' + this.totalSizeSuccess + '; Error size: ' + this.totalSizeError;
    this.logger.insertLog(MigrateCustomObjectLogger.Status.DONE, finishedMessage);
  }

  private Database.SaveResult publishEventToBar(Database.BatchableContext context) {
    Batch_Process__e bpEvent = new Batch_Process__e();

    AsyncApexJob job = [
      SELECT Id, Status, NumberOfErrors, JobItemsProcessed, TotalJobItems
      FROM AsyncApexJob
      WHERE Id = :context.getJobId()
    ];

    bpEvent.Batch_Id__c = context.getJobId();
    bpEvent.Apex_Class__c = String.valueOf(this).substring(0, String.valueOf(this).indexOf(':'));
    bpEvent.Chunks_Total__c = Integer.valueOf(job.TotalJobItems);
    bpEvent.Chunks_Processed__c = Integer.valueOf(job.JobItemsProcessed);
    bpEvent.Object_Name__c = this.service.getSObjectName();
    bpEvent.Big_Object_Name__c = this.service.getBigObjectName();

    Database.SaveResult result = EventBus.publish(bpEvent);

    return result;
  }
}
