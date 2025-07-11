// Shared Components
export * from './components/loading-spinner/loading-spinner.component';
export * from './components/button/button.component';
export * from './components/avatar/avatar.component';
export * from './components/modal/modal.component';

// Shared Pipes
export * from './pipes/time-ago.pipe';

// Shared Components Array for Module
export const SHARED_COMPONENTS = [
  // Components would be imported here for module declaration
];

// Shared Pipes Array for Module
export const SHARED_PIPES = [
  // Pipes would be imported here for module declaration
];

// Shared Declarations (Components + Pipes)
export const SHARED_DECLARATIONS = [
  ...SHARED_COMPONENTS,
  ...SHARED_PIPES
]; 