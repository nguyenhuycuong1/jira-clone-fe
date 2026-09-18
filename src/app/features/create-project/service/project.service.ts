import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateProjectRequest,
  ProjectResponse,
} from '../model/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly projectApiEndpoint: string = environment.api_endpoint + '/projects';
  private readonly httpClient: HttpClient = inject(HttpClient);

  public createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.httpClient.post<ProjectResponse>(`${this.projectApiEndpoint}`, request);
  }

  public checkExistProjectKey(key: string): Observable<boolean> {
    return this.httpClient.post<boolean>(
      `${this.projectApiEndpoint}/check-exist-key`,
      key,
    );
  }
}
