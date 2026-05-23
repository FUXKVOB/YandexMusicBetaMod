export interface Feature {
  name: string;
  init: () => void | Promise<void>;
  destroy?: () => void;
}

export class FeatureRegistry {
  private features: Feature[] = [];

  register(feature: Feature): void {
    this.features.push(feature);
  }

  async initAll(): Promise<void> {
    for (const feature of this.features) {
      try {
        console.log(`[Mod] Initializing feature: ${feature.name}`);
        await feature.init();
      } catch (error) {
        console.error(`[Mod] Failed to init feature ${feature.name}:`, error);
      }
    }
  }

  destroyAll(): void {
    for (const feature of this.features) {
      try {
        feature.destroy?.();
      } catch (error) {
        console.error(`[Mod] Failed to destroy feature ${feature.name}:`, error);
      }
    }
  }
}

export const registry = new FeatureRegistry();
