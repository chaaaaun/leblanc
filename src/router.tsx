import { lazy } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  createHashHistory,
} from '@tanstack/react-router';
import { getBean, getBrew } from './db';
import { RootLayout } from './layouts/RootLayout';

const BeanForm = lazy(() => import('./components/BeanForm').then(d => ({ default: d.BeanForm })));
const BrewForm = lazy(() => import('./components/BrewForm').then(d => ({ default: d.BrewForm })));
const Settings = lazy(() => import('./components/Settings').then(d => ({ default: d.Settings })));
const BrewsList = lazy(() => import('./pages/BrewsList').then(d => ({ default: d.BrewsList })));
const BeansList = lazy(() => import('./pages/BeansList').then(d => ({ default: d.BeansList })));

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BrewsList,
});

const beansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/beans',
  component: BeansList,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const addRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add',
  component: BeanForm,
});

const addBrewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-brew',
  validateSearch: (search: Record<string, unknown>) => ({
    fromId: Number(search.fromId) || undefined,
  }),
  loaderDeps: ({ search: { fromId } }) => ({ fromId }),
  loader: async ({ deps: { fromId } }) => {
    if (fromId) {
      const brew = await getBrew(fromId);
      if (brew) {
        // Return brew without ID to treat as new entry
        const { id, ...rest } = brew;
        return { ...rest, date: new Date().toISOString().split('T')[0] };
      }
    }
    return undefined;
  },
  component: AddBrewWrapper,
});

function AddBrewWrapper() {
  const initialData = addBrewRoute.useLoaderData();
  return <BrewForm initialData={initialData} />;
}

const editBrewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-brew/$brewId',
  loader: async ({ params }) => {
    const brew = await getBrew(Number(params.brewId));
    if (!brew) throw new Error('Brew not found');
    return brew;
  },
  component: EditBrew,
});

function EditBrew() {
  const brew = editBrewRoute.useLoaderData();
  return <BrewForm initialData={brew} />;
}

const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit/$beanId',
  loader: async ({ params }) => {
    const bean = await getBean(Number(params.beanId));
    if (!bean) throw new Error('Bean not found');
    return bean;
  },
  component: EditBean,
});

function EditBean() {
  const bean = editRoute.useLoaderData();
  return <BeanForm initialData={bean} />;
}

const routeTree = rootRoute.addChildren([indexRoute, beansRoute, settingsRoute, addRoute, editRoute, addBrewRoute, editBrewRoute]);

const hashHistory = createHashHistory();

export const router = createRouter({ routeTree, history: hashHistory });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
