import { ProviderType } from '@videolab/shared';
import { IVideoProvider } from './provider.interface.js';
import { MockVideoProvider } from './mock.provider.js';
import { RunwayVideoProvider } from './runway.provider.js';
import { GoogleVeoVideoProvider } from './google.provider.js';

export class ProviderRegistry {
  private providers: Map<ProviderType, IVideoProvider> = new Map();

  constructor() {
    this.register(new MockVideoProvider());
    this.register(new RunwayVideoProvider());
    this.register(new GoogleVeoVideoProvider());
  }

  register(provider: IVideoProvider) {
    this.providers.set(provider.providerId as ProviderType, provider);
  }

  get(providerId: ProviderType): IVideoProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider adapter not found for type: ${providerId}`);
    }
    return provider;
  }
}

export const providerRegistry = new ProviderRegistry();
