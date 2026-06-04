export enum Routes {
  HOME = '/',
  LOGIN = '/login',
  SIGNUP = '/signup',
  EXPLORE = '/explore',
  VISUALIZER_DEMO = '/visualizer/demo',
  VISUALIZER = '/visualizer/:id',
  MY_VISUALS = '/my-visuals',
  NOT_FOUND = '*',
  SETTINGS = '/settings',
}

export function buildVisualizerPath(id: string): string {
  return Routes.VISUALIZER.replace(':id', encodeURIComponent(id));
}
