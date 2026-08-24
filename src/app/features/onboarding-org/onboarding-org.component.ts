import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppButtonComponent } from '../../shared/app-button/app-button.component';
import { BaseComponent } from '../../shared/base/base.component';
import { AuthService } from '../../core/auth/auth.service';
import { OrganizationRequest, OrganizationResponse } from './model/organization.model';
import { OrganizationService } from './service/organization.service';

export interface OrgSample {
  slug: string;
  name: string;
  members: number;
  tag: string;
  tagColor: string;
  color: 'teal' | 'purple' | 'amber';
}

interface DoneInfo {
  title: string;
  description: string;
  rows: { label: string; value: string }[];
}

type Step = 'select' | 'form' | 'done';
type Mode = 'create' | 'join';

@Component({
  selector: 'onboarding-org',
  templateUrl: './onboarding-org.component.html',
  styleUrls: ['./onboarding-org.component.scss'],
  imports: [
    AppButtonComponent,
    ReactiveFormsModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    FormsModule,
  ],
})
export default class OnboardingOrgComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly organizationService = inject(OrganizationService);

  protected readonly step = signal<Step>('select');
  protected readonly mode = signal<Mode>('create');
  protected readonly doneInfo = signal<DoneInfo | null>(null);

  protected createFrom: OrganizationRequest = {
    orgName: '',
    slug: '',
    description: '',
    status: 'active'
  }

  // Dữ liệu mẫu chỉ để preview UI — thay bằng API khi tích hợp
  protected readonly sampleOrgs: OrgSample[] = [
    {
      slug: 'acme-software',
      name: 'Acme Software',
      members: 24,
      tag: 'Dev',
      tagColor: 'blue',
      color: 'teal',
    },
    {
      slug: 'nova-design',
      name: 'Nova Design',
      members: 12,
      tag: 'Design',
      tagColor: 'purple',
      color: 'purple',
    },
    {
      slug: 'mega-market',
      name: 'Mega Market',
      members: 40,
      tag: 'Marketing',
      tagColor: 'orange',
      color: 'amber',
    },
  ];

  protected readonly teamTypes = [
    { value: 'dev', label: 'Phát triển phần mềm' },
    { value: 'design', label: 'Thiết kế & sáng tạo' },
    { value: 'marketing', label: 'Marketing & Truyền thông' },
    { value: 'ops', label: 'Vận hành & Hỗ trợ' },
    { value: 'other', label: 'Khác' },
  ];

  protected joinForm = this.fb.group({
    orgKey: ['', [Validators.required]],
  });

  private slugEdited = false;

  protected choose(mode: Mode): void {
    this.mode.set(mode);
    this.step.set('form');
  }

  protected backToSelect(): void {
    this.step.set('select');
  }

  protected onSlugInput(): void {
    this.slugEdited = true;
  }

  protected onCheckExistOrgName(orgName: string): void {
    this.organizationService.checkExistOrgName(orgName).subscribe({
      next: (isExist: boolean) => {
        if (isExist) {
          this.toast.error('Tên tổ chức đã tồn tại. Vui lòng thử tên khác!');
        } else {
          this.choose('create');
        }
      },
      error: err => {
        this.toast.error(err.error.error);
      }
    })
  }

  protected onCreate(): void {
    this.organizationService.creatOrganizationByUser(this.createFrom).subscribe({
      next: (res: OrganizationResponse) => {
        this.toast.success('Tạo tổ chức thành công!');
      },
      error: (err) => {
        this.toast.error(err.error.error);
      },
    });
  }

  protected onJoin(): void {
    if (this.joinForm.invalid) {
      this.handleJoinFormError();
      return;
    }
    const orgKey = this.joinForm.get('orgKey')?.value ?? '';
    this.doneInfo.set({
      title: 'Đã gửi lời tham gia',
      description: `Chúng tôi đã gửi lời mời tham gia organization "${orgKey}". Bạn sẽ nhận được thông báo khi quản trị viên chấp thuận.`,
      rows: [
        { label: 'Organization', value: orgKey },
        { label: 'Trạng thái', value: 'Đang chờ chấp thuận' },
      ],
    });
    this.step.set('done');
  }

  protected joinSample(org: OrgSample): void {
    this.doneInfo.set({
      title: `Đã tham gia "${org.name}"`,
      description: 'Bạn đã trở thành thành viên của organization. Hãy bắt đầu làm việc ngay thôi.',
      rows: [
        { label: 'Tên organization', value: org.name },
        { label: 'Mã organization', value: org.slug },
        { label: 'URL truy cập', value: `jira-clone.app/${org.slug}` },
      ],
    });
    this.step.set('done');
  }

  protected goToHome(): void {
    this.router.navigate(['/home']).then(() => {});
  }

  protected logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']).then(() => {});
    });
  }

  private toSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private handleCreateFormErrors(): void {}

  private handleJoinFormError(): void {
    this.joinForm.markAllAsTouched();
    if (this.joinForm.get('orgKey')?.hasError('required')) {
      this.toast.error('Nhập mã organization hoặc email mời!');
    }
  }
}
