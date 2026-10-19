import { Outlet } from 'react-router-dom';

/** The shared fixed brand link is rendered once at the app level. */
export function MovementLayout() {
  return <Outlet />;
}
