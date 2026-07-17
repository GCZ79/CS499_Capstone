// src/test-providers.ts
import { TestComponentRenderer } from '@angular/core/testing';

class StubTestComponentRenderer extends TestComponentRenderer {

  override insertRootElement(rootElementId: string) {
    const root = document.createElement('div');
    root.id = rootElementId;
    document.body.appendChild(root);
  }

  override removeAllRootElements() {
    document.querySelectorAll('[id^="root"]').forEach(el => el.remove());
  }
}

export default [
  {
    provide: TestComponentRenderer,
    useClass: StubTestComponentRenderer
  }
];
