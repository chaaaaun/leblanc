import { RouterProvider } from '@tanstack/react-router';
import { HeroUIProvider } from "@heroui/system";
import { router } from './router';
import { ThemeProvider } from './theme/ThemeProvider';

export function App() {
  return (
    <ThemeProvider>
      <HeroUIProvider>
        <RouterProvider router={router} />
      </HeroUIProvider>
    </ThemeProvider>
  );
}
