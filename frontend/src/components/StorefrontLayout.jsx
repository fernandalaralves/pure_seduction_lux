import { Outlet } from 'react-router-dom';
import StorefrontHeader from './StorefrontHeader';
import StorefrontFooter from './StorefrontFooter';

export default function StorefrontLayout() {
  return (
    <div className="storefront">
      <StorefrontHeader />
      <main>
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
