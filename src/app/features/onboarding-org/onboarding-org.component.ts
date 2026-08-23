import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppButtonComponent } from '../../shared/app-button/app-button.component';
import { BaseComponent } from '../../shared/base/base.component';
import { AuthService } from '../../core/auth/auth.service';

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
  ],
})
export default class OnboardingOrgComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly step = signal<Step>('select');
  protected readonly mode = signal<Mode>('create');
  protected readonly doneInfo = signal<DoneInfo | null>(null);

  // Dữ liệu mẫu chỉ để preview UI — thay bằng API khi tích hợp
  protected readonly sampleOrgs: OrgSample[] = [
    { slug: 'acme-software', name: 'Acme Software', members: 24, tag: 'Dev', tagColor: 'blue', color: 'teal' },
    { slug: 'nova-design', name: 'Nova Design', members: 12, tag: 'Design', tagColor: 'purple', color: 'purple' },
    { slug: 'mega-market', name: 'Mega Market', members: 40, tag: 'Marketing', tagColor: 'orange', color: 'amber' },
  ];

  protected readonly teamTypes = [
    { value: 'dev', label: 'Phát triển phần mềm' },
    { value: 'design', label: 'Thiết kế & sáng tạo' },
    { value: 'marketing', label: 'Marketing & Truyền thông' },
    { value: 'ops', label: 'Vận hành & Hỗ trợ' },
    { value: 'other', label: 'Khác' },
  ];

  // Tên field orgName/slug đồng bộ với OrganizationRequest (model/organization.model.ts)
  protected createForm = this.fb.group({
    orgName: ['', [Validators.required, Validators.minLength(3)]],
    slug: [
      '',
      [Validators.required, Validators.pattern(/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/)],
    ],
    teamType: [''],
    description: [''],
  });

  protected joinForm = this.fb.group({
    orgKey: ['', [Validators.required]],
  });

  private slugEdited = false;

  protected greeting(): string {
    return this.account?.displayName || this.account?.username || 'Bạn';
  }

  protected choose(mode: Mode): void {
    this.mode.set(mode);
    this.step.set('form');
  }

  protected backToSelect(): void {
    this.step.set('select');
  }

  protected onNameInput(): void {
    if (!this.slugEdited) {
      const slug = this.toSlug(this.createForm.get('orgName')?.value ?? '');
      this.createForm.patchValue({ slug });
    }
  }

  protected onSlugInput(): void {
    this.slugEdited = true;
  }

  protected onCreate(): void {
    if (this.createForm.invalid) {
      this.handleCreateFormErrors();
      return;
    }
    const orgName = this.createForm.get('orgName')?.value ?? '';
    const slug = this.createForm.get('slug')?.value ?? '';
    this.doneInfo.set({
      title: 'Đã tạo organization thành công',
      description: `Organization "${orgName}" của bạn đã sẵn sàng. Hãy mời đội ngũ của bạn bắt đầu làm việc cùng.`,
      rows: [
        { label: 'Tên organization', value: orgName },
        { label: 'Mã organization', value: slug },
        { label: 'URL truy cập', value: `jira-clone.app/${slug}` },
      ],
    });
    this.step.set('done');
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

  private handleCreateFormErrors(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.get('orgName')?.hasError('required')) {
      this.toast.error('Tên organization không được bỏ trống!');
      return;
    }
    if (this.createForm.get('orgName')?.hasError('minlength')) {
      this.toast.error('Tên organization phải có tối thiểu 3 ký tự!');
      return;
    }
    if (this.createForm.get('slug')?.hasError('required')) {
      this.toast.error('Mã organization không được bỏ trống!');
      return;
    }
    if (this.createForm.get('slug')?.hasError('pattern')) {
      this.toast.error('Mã chỉ gồm chữ thường, số và dấu gạch nối!');
    }
  }

  private handleJoinFormError(): void {
    this.joinForm.markAllAsTouched();
    if (this.joinForm.get('orgKey')?.hasError('required')) {
      this.toast.error('Nhập mã organization hoặc email mời!');
    }
  }
}