/**
 * Decorates the viya-facts block.
 * @param {Element} block The viya-facts block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  
  if (rows.length < 2) return;

  const statsRow = rows[0];
  const descriptionsRow = rows[1];

  const statsCells = [...statsRow.children];
  const descriptionsCells = [...descriptionsRow.children];

  const container = document.createElement('div');
  container.className = 'viya-facts-container';

  statsCells.forEach((statCell, index) => {
    const descriptionCell = descriptionsCells[index];
    
    const factItem = document.createElement('div');
    factItem.className = 'viya-fact-item';

    const badge = document.createElement('div');
    badge.className = 'viya-fact-badge';

    const label = statCell.querySelector('p:first-child strong');
    const stat = statCell.querySelector('h2');
    const description = statCell.querySelector('p:last-child strong');

    if (label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'viya-fact-label';
      labelEl.textContent = label.textContent;
      badge.appendChild(labelEl);
    }

    if (stat) {
      const statEl = document.createElement('div');
      statEl.className = 'viya-fact-stat';
      statEl.textContent = stat.textContent;
      badge.appendChild(statEl);
    }

    if (description) {
      const descEl = document.createElement('div');
      descEl.className = 'viya-fact-description';
      descEl.textContent = description.textContent;
      badge.appendChild(descEl);
    }

    factItem.appendChild(badge);

    if (descriptionCell) {
      const content = document.createElement('div');
      content.className = 'viya-fact-content';
      
      const paragraphs = descriptionCell.querySelectorAll('p');
      paragraphs.forEach(p => {
        content.appendChild(p.cloneNode(true));
      });

      factItem.appendChild(content);
    }

    container.appendChild(factItem);
  });

  block.replaceChildren(container);
}
