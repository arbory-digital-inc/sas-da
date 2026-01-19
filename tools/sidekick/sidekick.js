import initQuickEdit from '../quick-edit/quick-edit.js';

export default async function sidekick(sk) {
  sk.addEventListener('custom:quick-edit', initQuickEdit);
}