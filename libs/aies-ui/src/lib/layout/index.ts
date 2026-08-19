/**
 * Layout scaffolds for host apps.
 */
export {
  AppShellComponent,
  type AppShellContentWidth,
  type AppShellLayoutPreview,
} from './app-shell.component';
export { AppShellContentHeaderComponent } from './app-shell-content-header.component';
export {
  AppShellHeaderComponent,
  type AppShellHeaderDensity,
  AppShellHeaderEndDirective,
  AppShellHeaderStartDirective,
} from './app-shell-header.component';
export { AppShellHeaderSlotDirective } from './app-shell-header-slot.directive';
export {
  type HeaderGreeting,
  headerGreetingFirstName,
  type HeaderGreetingPeriod,
  headerGreetingPeriod,
  type HeaderWeather,
  type HeaderWeatherKind,
  pickHeaderGreeting,
} from './header-greeting.util';
export { PageHeaderComponent } from './page-header.component';
