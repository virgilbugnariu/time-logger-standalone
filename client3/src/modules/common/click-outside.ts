function clickOutside(node: HTMLElement) {
  const handleClick = (event) => {
    if (!node.contains(event.target) && !event.target.closest('.optionsContainer')) {
      node.dispatchEvent(new CustomEvent('outclick'));
    }
  }

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
}

export default clickOutside;
