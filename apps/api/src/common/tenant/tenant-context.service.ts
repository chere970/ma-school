
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

type Store = {
  tenantId: string;
  userId?: string;
};

@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<Store>();

  run(store: Store, callback: () => void) {
    this.storage.run(store, callback);
  }

  getTenantId(): string {
    const store = this.storage.getStore();

    if (!store?.tenantId) {
      throw new Error('TenantContext not initialized');
    }

    return store.tenantId;
  }

  getUserId() {
    return this.storage.getStore()?.userId;
  }
}
