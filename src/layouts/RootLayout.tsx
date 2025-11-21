import { useState, Suspense } from 'react';
import { Outlet, Link } from '@tanstack/react-router';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { Spinner } from "@heroui/spinner";

export function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Brews", path: "/" },
    { name: "Beans", path: "/beans" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar isBordered maxWidth="xl" onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">Leblanc</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name}>
              <Link 
                to={item.path} 
                className="text-foreground data-[status=active]:font-bold" 
                activeProps={{ 'data-status': 'active' } as any}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.name}>
              <Link
                to={item.path}
                className="w-full"
                activeProps={{ 'data-status': 'active' } as any}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      <main className="container mx-auto max-w-4xl p-4">
        <Suspense fallback={<div className="flex justify-center p-10"><Spinner size="lg" /></div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}