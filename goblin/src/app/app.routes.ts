import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'workspace' },
    {
        path: 'workspace',
        loadComponent: () => import('./pages/workspace/workspace').then(component => component.Workspace) 
    },
    {
        path: '**',
        redirectTo: 'workspace'
    }
    ];
