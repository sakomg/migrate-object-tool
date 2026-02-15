public with sharing class MigrateCustomObjectScheduler implements Schedulable {
  private MigrateCustomObjectService service;
  private Integer chunkSize;

  public MigrateCustomObjectScheduler() {
    this.service = new MigrateCustomObjectService(
      'Account',
      'Account__b',
      'SELECT Id, Name FROM Account',
      new Map<String, String>{ 'Name' => 'Name__c' }
    );
    this.chunkSize = 10;
  }

  public MigrateCustomObjectScheduler(MigrateCustomObjectService service, Integer chunkSize) {
    this.service = service;
    this.chunkSize = chunkSize;
  }

  public void execute(SchedulableContext sc) {
    String batchId = Database.executeBatch(new MigrateCustomObjectBatch(this.service), this.chunkSize);
    String cronId = sc.getTriggerId().to15();
    List<msol__Migrate_Custom_Object_Store__c> store = this.getStoreByCronId(cronId);
    if (!store.isEmpty()) {
      msol__Migrate_Custom_Object_Store__c item = store.get(0);
      item.msol__Batch_Id__c = batchId;
      Database.update(item, false);
    }
  }

  private List<msol__Migrate_Custom_Object_Store__c> getStoreByCronId(String cronId) {
    return [
      SELECT Id, msol__Batch_Id__c
      FROM msol__Migrate_Custom_Object_Store__c
      WHERE msol__Cron_Id__c = :cronId
    ];
  }
}