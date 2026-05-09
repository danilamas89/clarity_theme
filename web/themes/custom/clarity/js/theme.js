/**
 * @file
 * Clarity — main JS entry point.
 *
 * - Alpine.js global stores (sidebar, theme)
 * - Drupal behaviors wrapper for DOM-ready hooks
 * - Vanilla JS utilities
 *
 * Alpine.js is loaded before this file (weight: -1 in libraries.yml),
 * so Alpine.store() is available at alpine:init time.
 */

(function (Drupal, drupalSettings) {
  'use strict';

  /* ============================================================
     Alpine.js global stores
     ============================================================ */

  document.addEventListener('alpine:init', () => {

    /**
     * Sidebar collapsed state.
     * Persisted in localStorage so it survives page reloads.
     */
    Alpine.store('sidebar', {
      collapsed: localStorage.getItem('at-sidebar-collapsed') === 'true',

      toggle() {
        this.collapsed = !this.collapsed;
        localStorage.setItem('at-sidebar-collapsed', this.collapsed);
        document.documentElement.dataset.sidebarCollapsed = this.collapsed;
        // Update the page shell attribute for CSS targeting.
        const page = document.querySelector('.at-page');
        if (page) {
          page.dataset.sidebarCollapsed = this.collapsed;
        }
      },

      init() {
        // Apply persisted state on page load.
        const page = document.querySelector('.at-page');
        if (page && this.collapsed) {
          page.dataset.sidebarCollapsed = 'true';
        }
      },
    });

    /**
     * Theme (dark mode) toggle.
     * Post-v1 feature — store is registered now so templates can reference it
     * without errors, even when dark mode is not fully implemented.
     */
    Alpine.store('theme', {
      dark: localStorage.getItem('at-theme') === 'dark',

      toggle() {
        this.dark = !this.dark;
        const value = this.dark ? 'dark' : 'light';
        localStorage.setItem('at-theme', value);
        document.documentElement.setAttribute('data-theme', value);
      },

      init() {
        if (this.dark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      },
    });

  });

  /* ============================================================
     Drupal behaviors
     ============================================================ */

  /**
   * Initialize Alpine stores that require DOM on first attach.
   */
  Drupal.behaviors.clarityInit = {
    attach(context, settings) {
      // Run only once on the full document.
      if (context !== document) return;

      // Init sidebar collapsed state from Alpine store after Alpine is ready.
      document.addEventListener('alpine:initialized', () => {
        Alpine.store('sidebar').init();
        Alpine.store('theme').init();
      }, { once: true });
    },
  };

  /**
   * Mobile sidebar overlay — close sidebar when overlay is clicked.
   */
  Drupal.behaviors.claritySidebarOverlay = {
    attach(context, settings) {
      const overlay = context.querySelector
        ? context.querySelector('.at-sidebar-overlay')
        : null;

      if (!overlay) return;

      overlay.addEventListener('click', () => {
        const sidebar = document.querySelector('.at-sidebar');
        if (sidebar) {
          sidebar.classList.remove('is-open');
          overlay.classList.remove('is-active');
        }
      });
    },
  };

  /**
   * Auto-dismiss messages after a delay (optional — requires data attribute).
   *
   * Usage in Twig: <div class="at-message" data-auto-dismiss="5000">
   */
  Drupal.behaviors.clarityAutoDismiss = {
    attach(context, settings) {
      const messages = context.querySelectorAll
        ? context.querySelectorAll('.at-message[data-auto-dismiss]')
        : [];

      messages.forEach((el) => {
        const delay = parseInt(el.dataset.autoDismiss, 10) || 5000;
        setTimeout(() => {
          el.style.transition = 'opacity 300ms ease';
          el.style.opacity = '0';
          setTimeout(() => el.remove(), 300);
        }, delay);
      });
    },
  };

  /**
   * Dropbutton — position the dropdown with fixed coords so it escapes the
   * table wrapper's overflow-x: auto clipping context.
   */
  Drupal.behaviors.clarityDropbutton = {
    attach(context, settings) {
      const wrappers = context.querySelectorAll
        ? context.querySelectorAll('.dropbutton-wrapper')
        : [];

      wrappers.forEach((wrapper) => {
        if (wrapper.dataset.atDropbutton) return;
        wrapper.dataset.atDropbutton = '1';

        const widget = wrapper.querySelector('.dropbutton-widget');
        if (!widget) return;

        wrapper.addEventListener('mouseenter', () => {
          const rect = widget.getBoundingClientRect();
          widget.style.position = 'fixed';
          widget.style.top = rect.top + 'px';
          widget.style.right = (window.innerWidth - rect.right) + 'px';
          widget.style.left = 'auto';
          widget.style.minWidth = rect.width + 'px';
        });

        wrapper.addEventListener('mouseleave', () => {
          widget.style.position = '';
          widget.style.top = '';
          widget.style.right = '';
          widget.style.left = '';
          widget.style.minWidth = '';
        });
      });
    },
  };

  /**
   * Flyout nav — align each flyout panel vertically with its parent item.
   * Uses fixed positioning so it escapes sidebar overflow:hidden.
   */
  Drupal.behaviors.clarityNavFlyout = {
    attach(context, settings) {
      const items = context.querySelectorAll
        ? context.querySelectorAll('.at-nav-item')
        : [];

      items.forEach((item) => {
        const flyout = item.querySelector(':scope > .at-nav-flyout');
        if (!flyout) return;

        item.addEventListener('mouseenter', () => {
          const itemRect = item.getBoundingClientRect();
          const parentFlyout = item.closest('.at-nav-flyout');

          if (parentFlyout) {
            // Nested flyout: align to the right edge of the parent flyout panel.
            const parentRect = parentFlyout.getBoundingClientRect();
            flyout.style.left = (parentRect.right + 4) + 'px';
          } else {
            // Top-level flyout: align to the right edge of the sidebar.
            const sidebar = document.querySelector('.at-sidebar');
            const sidebarRight = sidebar ? sidebar.getBoundingClientRect().right : 220;
            flyout.style.left = (sidebarRight + 4) + 'px';
          }

          flyout.style.top = itemRect.top + 'px';
        });
      });
    },
  };

  /**
   * Focus trap for modals.
   * Works with the .at-modal element; call openModal / closeModal utilities.
   */
  Drupal.behaviors.clarityFocusTrap = {
    attach(context, settings) {
      const modals = context.querySelectorAll
        ? context.querySelectorAll('.at-modal')
        : [];

      modals.forEach((modal) => {
        modal.addEventListener('keydown', trapFocus);
      });
    },
  };

  /* ============================================================
     Utilities
     ============================================================ */

  /**
   * Trap keyboard focus within a modal element.
   *
   * @param {KeyboardEvent} event
   */
  function trapFocus(event) {
    if (event.key !== 'Tab') return;

    const focusable = this.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

})(Drupal, drupalSettings);
