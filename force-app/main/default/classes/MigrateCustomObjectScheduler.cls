public with sharing class MigrateCustomObjectScheduler implements Schedulable {
  private MigrateCustomObjectService service;
  private Integer chunkSize = 150;

  public MigrateCustomObjectScheduler(MigrateCustomObjectService service, Integer chunkSize) {
    this.service = service;
    this.chunkSize = chunkSize;
  }

  public void execute(SchedulableContext sc) {
    Database.executeBatch(new MigrateCustomObjectBatch(this.service), this.chunkSize);
  }
}