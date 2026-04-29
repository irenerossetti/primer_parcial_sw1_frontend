import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
import { LoginComponent } from './pages/login/login';
import { ActivityDiagramComponent } from './pages/activity-diagram/activity-diagram';
import { rolGuard } from './core/guards/auth.guard';

// Importar componentes
import { DashboardComponent } from './pages/dashboard/dashboard';
import { TramitesComponent } from './pages/tramites/tramites';
import { DepartamentosComponent } from './pages/departamentos/departamentos';
import { PoliticasComponent } from './pages/politicas/politicas';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { FuncionarioComponent } from './pages/funcionario/funcionario';
import { ClienteComponent } from './pages/cliente/cliente';
import { CuellosBotuellaComponent } from './pages/cuellos-botella/cuellos-botella.component';
import { TemplateLibraryComponent } from './pages/template-library/template-library';
import { FormEditorComponent } from './pages/form-editor/form-editor.component';
import { UMLDiagramComponent } from './pages/uml-diagram/uml-diagram.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [rolGuard(['ADMIN', 'FUNCIONARIO', 'CLIENTE'])],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'cuellos-botella', component: CuellosBotuellaComponent },
      // ADMIN
      { path: 'tramites', component: TramitesComponent },
      { path: 'diagramador', component: ActivityDiagramComponent },
      { path: 'diagramador-uml/:id', component: UMLDiagramComponent },
      { path: 'departamentos', component: DepartamentosComponent },
      { path: 'politicas', component: PoliticasComponent },
      { path: 'politicas/:id/formulario', component: FormEditorComponent },
      { path: 'templates', component: TemplateLibraryComponent },
      { path: 'usuarios', component: UsuariosComponent },
      // FUNCIONARIO
      { path: 'funcionario', component: FuncionarioComponent },
      // CLIENTE
      { path: 'cliente', component: ClienteComponent },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];