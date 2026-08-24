import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationRequest, OrganizationResponse } from '../model/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly orgApiEndpoint: string = environment.api_endpoint + '/organizations';
  private readonly httpClient: HttpClient = inject(HttpClient);

  public getOrganization(id: string): Observable<OrganizationResponse> {
    return this.httpClient.get<OrganizationResponse>(`/${this.orgApiEndpoint}/${id}`);
  }

  public checkExistOrgName(orgName: string): Observable<boolean> {
    return this.httpClient.post<boolean>(`${this.orgApiEndpoint}/check-exist-org-name`, orgName);
  }

  public creatOrganization(request: OrganizationRequest): Observable<OrganizationResponse> {
    return this.httpClient.post<OrganizationResponse>(`${this.orgApiEndpoint}`, request);
  }

  public creatOrganizationByUser(request: OrganizationRequest): Observable<OrganizationResponse> {
    return this.httpClient.post<OrganizationResponse>(`${this.orgApiEndpoint}/create-by-owner`, request);
  }

}
