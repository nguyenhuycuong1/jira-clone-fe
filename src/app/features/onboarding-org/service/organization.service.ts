import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationResponse } from '../model/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly orgApiEndpoint: string = environment.api_endpoint + 'organizations';
  private readonly httpClient: HttpClient = inject(HttpClient);

  public getOrganization(id: string): Observable<OrganizationResponse> {
    return this.httpClient.get<OrganizationResponse>(`/${this.orgApiEndpoint}/organizations/${id}`);
  }

}
