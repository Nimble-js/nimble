export interface RouteRoot {
    routes: {url: string, key: string}[]
    onInternalNavigate(event: any, pathRequested: string): void;
    currentRouteKey: string;
}