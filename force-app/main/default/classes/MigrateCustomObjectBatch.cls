public without sharing class MigrateCustomObjectBatch implements Database.Batchable<SObject>, Database.Stateful {
    private MigrateCustomObjectService service;
    private MigrateCustomObjectLogger logger;

    private Integer totalSizeError = 0;
    private Integer totalSizeSuccess = 0;

    public MigrateCustomObjectBatch(MigrateCustomObjectService service) {
        this.service = service;
        String entryPoint = 'Process migrate Custom Objects. Custom Object Name: ' +
            service.getCustomObjectName() + ', Big Object Name: ' + service.getBigObjectName() +
            ', Type: ' + service.getObjectType();
        this.logger = new MigrateCustomObjectLogger(entryPoint);
    }

    public Database.QueryLocator start(Database.BatchableContext context) {
        Integer additionalMonths = 2;
        String query = this.service.generateQuery(additionalMonths);
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext context, List<SObject> scope) {
        try {
            String messageBeforeProcess = String.format(
                'Processing "{0}" Object "{1}".',
                new List<Object> { scope.size(), this.service.getCustomObjectName() }
            );
            this.logger.log(messageBeforeProcess);
            List<SObject> bigObjects = this.service.processMigrate(scope);
            String messageAfterProcess = String.format(
                'Processed "{0}" Object: "{1}".',
                new List<Object> { bigObjects.size(), this.service.getBigObjectName() }
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

                    String finalMessage = String.format(
                        'Created "{0}". Errors: "{1}"',
                        new List<Object> { successIds.size(), errors }
                    );
                    this.logger.log(finalMessage);

                    String insertMessage = String.format(
                        'Custom Objects: "{0}" Big Objects: "{1}" Created: "{2}" Error IDs: "{3}"',
                        new List<Object> { successIds.size(), bigObjects.size(), result.size(), errors.keySet() }
                    );

                    this.logger.insertLog(MigrateCustomObjectLogger.Status.WARNING, insertMessage);

                }

                if (!customObjectsToDelete.isEmpty()) {
                    delete customObjectsToDelete;
                }
            }
        } catch (Exception e) {
            this.logger.insertLog(MigrateCustomObjectLogger.Status.ERROR, 'Error cause: ' + e.getMessage() + ' | ' + e.getStackTraceString());
        }
    }

    public void finish(Database.BatchableContext context) {
        String finishedMessage = 'Finished. Success size: ' + this.totalSizeSuccess + '; Error size: ' + this.totalSizeError;
        this.logger.insertLog(MigrateCustomObjectLogger.Status.DONE, finishedMessage);
    }
}
