import createSvgIcon from '../../utils/util.js';
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  
  // Always ensure all sections are collapsed when opening the mobile menu
  if (!expanded && !isDesktop.matches) {
    // Explicitly set all dropdown sections to collapsed
    navSections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
      section.setAttribute('aria-expanded', 'false');
    });
  } else {
    // Desktop behavior or closing the menu
    toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  }
  
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * Sets nav utility icons
 */
function getNavUtils() {
  const utils = document.createElement('div');
  utils.classList.add('nav-utils');
  const search = createSvgIcon('search', 25);
  utils.append(search);
  const locale = createSvgIcon('locale', 25);
  utils.append(locale);
  const contact = createSvgIcon('contact', 25);
  utils.append(contact);
  const dot = createSvgIcon('dot', 25);
  utils.append(dot);
  const profile = createSvgIcon('profile-n', 35);
  utils.append(profile);
  return utils;
}

/**
 * Handle scrolling animation and functionality
 * @param {Element} navSections
 */
function handleScroll(navSections) {
  let lastPos = 0;

  document.addEventListener('scroll', () => {
    const scrollPos = window.scrollY
      || document.documentElement.scrollTop || document.body.scrollTop || 0;

    window.requestAnimationFrame(() => {
      toggleAllNavSections(navSections);
      const nav = document.querySelector('.nav-wrapper');
      const subnav = document.querySelector('.sub-menu-wrapper');
      const hid = nav.classList.contains('hide');
      if (!hid && scrollPos > lastPos && scrollPos > 100) {
        nav.classList.add('hide');
        if (subnav) subnav.classList.add('send-top');
      } else if (hid && scrollPos < lastPos) {
        nav.classList.remove('hide');
        if (subnav) subnav.classList.remove('send-top');
      }
      lastPos = scrollPos;
    });
  });
}

/**
 * Creates a close button for the dropdown
 * @param {Element} dropdown The dropdown element
 */
function createCloseButton(dropdown) {
  const closeButton = document.createElement('div');
  closeButton.className = 'dropdown-close';
  closeButton.setAttribute('aria-label', 'Close dropdown');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const parentLi = dropdown.closest('li');
    if (parentLi) {
      parentLi.setAttribute('aria-expanded', 'false');
    }
  });
  dropdown.prepend(closeButton);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        // Add close button to dropdown
        const dropdown = navSection.querySelector('ul');
        createCloseButton(dropdown);
        
        // Set all sections to collapsed by default
        navSection.setAttribute('aria-expanded', 'false');
      }
      navSection.addEventListener('click', (e) => {
        // Check if this is a regular link without dropdown
        const hasDropdown = navSection.querySelector('ul') !== null;
        
        // If it's a link without dropdown, let the link work normally
        if (!hasDropdown) {
          // If we're clicking directly on a link, let it work normally
          if (e.target.tagName === 'A') {
            return; // Allow the link to work normally
          }
          
          // If we're clicking on the paragraph that contains a link, trigger the link
          if (e.target.tagName === 'P') {
            const link = e.target.querySelector('a');
            if (link) {
              // Programmatically click the link
              link.click();
              return;
            }
          }
          
          return; // No dropdown to toggle
        }
        
        // Don't trigger if clicking on a child element that's not the main section
        if (e.target !== navSection && !navSection.contains(e.target.closest('p, a'))) {
          return;
        }
        
        // Prevent default to stop link navigation when clicking on dropdown headers
        if (e.target.tagName === 'A' || e.target.tagName === 'P') {
          e.preventDefault();
        }
        
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        
        if (isDesktop.matches) {
          // On desktop, close all sections first
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        } else {
          // On mobile, just toggle this section
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // global nav parts for local search user etc...
  const utilities = getNavUtils();
  nav.append(utilities);

  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  navWrapper.append(nav);
  const subMenu = document.querySelector('.sub-menu-wrapper');
  if (subMenu) {
    navWrapper.append(subMenu);
    block.parentElement.classList.add('has-submenu');
    const container = document.querySelector('.sub-menu-container');
    container.remove();
  }

  block.append(navWrapper);
  handleScroll(navSections);
}
