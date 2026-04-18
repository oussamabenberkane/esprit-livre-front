/**
 * Onboarding tour step definitions.
 *
 * Each step:
 *  selector      — CSS selector of the target element (null = centred modal, no spotlight)
 *  placement     — where to render the tooltip: 'bottom' | 'top' | 'right' | 'center'
 *  titleKey      — i18n key for the tooltip title
 *  descKey       — i18n key for the tooltip description
 *  scrollIntoView— scroll the element into view before measuring (default false)
 *  skipIfHidden  — auto-skip when the element has zero dimensions (hidden at this breakpoint)
 *  isFinish      — marks the last step (controls CTA label)
 */

export const homeTourSteps = [
  {
    id: 'search',
    selector: '[data-tour="navbar-search"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.search.title',
    descKey: 'onboarding.home.search.desc',
  },
  // Mobile / tablet only — hamburger opens packs, favorites, language
  {
    id: 'menu',
    selector: '[data-tour="navbar-menu"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.menu.title',
    descKey: 'onboarding.home.menu.desc',
    skipIfHidden: true,
  },
  // Desktop / tablet only
  {
    id: 'language',
    selector: '[data-tour="navbar-language"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.language.title',
    descKey: 'onboarding.home.language.desc',
    skipIfHidden: true,
  },
  {
    id: 'packs',
    selector: '[data-tour="navbar-packs"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.packs.title',
    descKey: 'onboarding.home.packs.desc',
    skipIfHidden: true,
  },
  {
    id: 'cart',
    selector: '[data-tour="navbar-cart"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.cart.title',
    descKey: 'onboarding.home.cart.desc',
  },
  // Desktop / tablet only
  {
    id: 'favorites',
    selector: '[data-tour="navbar-favorites"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.favorites.title',
    descKey: 'onboarding.home.favorites.desc',
    skipIfHidden: true,
  },
  {
    id: 'user',
    selector: '[data-tour="navbar-user"]',
    placement: 'bottom',
    titleKey: 'onboarding.home.user.title',
    descKey: 'onboarding.home.user.desc',
  },
];

export const profileTourSteps = [
  {
    id: 'profile-header',
    selector: '[data-tour="profile-header"]',
    placement: 'bottom',
    titleKey: 'onboarding.profile.header.title',
    descKey: 'onboarding.profile.header.desc',
    scrollIntoView: true,
  },
  {
    id: 'profile-orders',
    selector: '[data-tour="profile-orders"]',
    placement: 'bottom',
    titleKey: 'onboarding.profile.orders.title',
    descKey: 'onboarding.profile.orders.desc',
    scrollIntoView: true,
  },
  {
    id: 'profile-favorites',
    selector: '[data-tour="profile-favorites-card"]',
    placement: 'bottom',
    titleKey: 'onboarding.profile.favorites.title',
    descKey: 'onboarding.profile.favorites.desc',
    scrollIntoView: true,
  },
  {
    id: 'profile-personal-info',
    selector: '[data-tour="profile-personal-info"]',
    placement: 'top',
    titleKey: 'onboarding.profile.personalInfo.title',
    descKey: 'onboarding.profile.personalInfo.desc',
    scrollIntoView: true,
  },
  {
    id: 'profile-shipping',
    selector: '[data-tour="profile-shipping"]',
    placement: 'top',
    titleKey: 'onboarding.profile.shipping.title',
    descKey: 'onboarding.profile.shipping.desc',
    scrollIntoView: true,
  },
  {
    id: 'profile-save',
    selector: '[data-tour="profile-save"]',
    placement: 'top',
    titleKey: 'onboarding.profile.save.title',
    descKey: 'onboarding.profile.save.desc',
    scrollIntoView: true,
  },
];
