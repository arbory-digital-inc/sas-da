/**
 * Decorates the impact-data block.
 * @param {Element} block The impact-data block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const legendItems = block.querySelector('ul');
  
  if (!picture || !legendItems) return;
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'impact-data-chart';
  chartContainer.append(picture);
  
  const legendContainer = document.createElement('div');
  legendContainer.className = 'impact-data-legend';
  legendContainer.append(legendItems);
  
  block.replaceChildren(chartContainer, legendContainer);
}
