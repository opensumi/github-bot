export class NodeAnalyticsEngineDataset implements AnalyticsEngineDataset {
  writeDataPoint(event?: AnalyticsEngineDataPoint | undefined): void {
    console.log(`NodeAnalyticsEngineDataset ~ writeDataPoint ~ event:`, event);
  }
}
