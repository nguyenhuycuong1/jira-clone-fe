import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AppButtonComponent } from '../../shared/app-button/app-button.component';
import { BaseComponent } from '../../shared/base/base.component';
import { ProjectService } from './service/project.service';
import {
  CreateProjectRequest,
  ProjectResponse,
  ProjectType,
  StatusState,
  WorkflowStatusItem,
} from './model/project.model';

interface TypeOption {
  value: ProjectType;
  label: string;
  desc: string;
  icon: string;
}

interface StateMeta {
  label: string;
  dot: string;
  icon: string;
}

interface StateOption extends StateMeta {
  value: StatusState;
}

const STATE_META: Record<StatusState, StateMeta> = {
  [StatusState.TO_DO]: { label: 'To Do', dot: 'var(--info)', icon: 'clock-circle' },
  [StatusState.IN_PROGRESS]: { label: 'In Progress', dot: 'var(--warning)', icon: 'sync' },
  [StatusState.DONE]: { label: 'Done', dot: 'var(--success)', icon: 'check-circle' },
};

@Component({
  selector: 'create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  imports: [
    AppButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    NzIconModule,
    NzInputModule,
  ],
})
export default class CreateProjectComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  protected readonly stateMeta = STATE_META;
  protected readonly statusState = StatusState;

  protected readonly typeOptions: TypeOption[] = [
    { value: ProjectType.SCRUM, label: 'Scrum', desc: 'Sprint-based', icon: 'schedule' },
    { value: ProjectType.KANBAN, label: 'Kanban', desc: 'Flow-based', icon: 'appstore' },
  ];

  protected readonly stateOptions: StateOption[] = (
    Object.values(StatusState) as StatusState[]
  ).map((s) => ({ value: s, ...STATE_META[s] }));

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    key: ['', [Validators.required, Validators.pattern(/^[A-Z][A-Z0-9]{1,9}$/)]],
    description: [''],
    type: [ProjectType.SCRUM, [Validators.required]],
  });

  protected readonly workflow = signal<WorkflowStatusItem[]>([
    { id: this.newId(), name: 'To Do', state: StatusState.TO_DO },
    { id: this.newId(), name: 'In Progress', state: StatusState.IN_PROGRESS },
    { id: this.newId(), name: 'Done', state: StatusState.DONE },
  ]);

  private keyEdited = false;
  private idSeq = 0;

  // ── Tên & key ───────────────────────────────────────────────
  protected onNameInput(): void {
    if (this.keyEdited) return;
    const name = this.form.get('name')?.value ?? '';
    this.form.get('key')?.setValue(this.suggestKey(name), { emitEvent: false });
  }

  protected onKeyInput(): void {
    const ctrl = this.form.get('key');
    if (!ctrl) return;
    this.keyEdited = true;
    const normalized = (ctrl.value ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
    if (normalized !== ctrl.value) {
      ctrl.setValue(normalized, { emitEvent: false });
    }
  }

  protected get keyPreview(): string {
    return this.form.get('key')?.value || 'KEY';
  }

  // ── Loại project ────────────────────────────────────────────
  protected selectType(value: ProjectType): void {
    this.form.get('type')?.setValue(value, { emitEvent: false });
  }

  // ── Workflow ────────────────────────────────────────────────
  protected addStatus(): void {
    this.workflow.update((list) => [
      ...list,
      { id: this.newId(), name: `Trạng thái ${list.length + 1}`, state: StatusState.TO_DO },
    ]);
  }

  protected removeStatus(id: string): void {
    this.workflow.update((list) => list.filter((s) => s.id !== id));
  }

  protected renameStatus(id: string, name: string): void {
    this.workflow.update((list) =>
      list.map((s) => (s.id === id ? { ...s, name } : s)),
    );
  }

  protected changeStatusState(id: string, state: StatusState): void {
    this.workflow.update((list) =>
      list.map((s) => (s.id === id ? { ...s, state } : s)),
    );
  }

  protected onDropStatus(event: CdkDragDrop<WorkflowStatusItem[]>): void {
    const list = [...this.workflow()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.workflow.set(list);
  }

  // ── Submit / nav ────────────────────────────────────────────
  protected onCreate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.handleFormErrors();
      return;
    }
    if (this.workflow().length === 0) {
      this.toast.error('Workflow cần ít nhất một trạng thái!');
      return;
    }

    const request: CreateProjectRequest = {
      name: this.form.get('name')!.value!.trim(),
      key: this.form.get('key')!.value!,
      description: this.form.get('description')?.value ?? '',
      type: this.form.get('type')!.value as ProjectType,
      workflow: this.workflow().map(({ name, state }) => ({
        name: name.trim(),
        state,
      })),
    };

    this.projectService.createProject(request).subscribe({
      next: () => {
        this.toast.success('Tạo project thành công!');
        this.router.navigate(['/home']).then(() => {});
      },
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'Không thể tạo project. Vui lòng thử lại!');
      },
    });
  }

  protected onBack(): void {
    this.router.navigate(['/home']).then(() => {});
  }

  private handleFormErrors(): void {
    const keyCtrl = this.form.get('key');
    if (this.form.get('name')?.hasError('required')) {
      this.toast.error('Vui lòng nhập tên project!');
    } else if (keyCtrl?.hasError('required')) {
      this.toast.error('Vui lòng nhập project key!');
    } else if (keyCtrl?.hasError('pattern')) {
      this.toast.error('Project key gồm 2-10 ký tự, bắt đầu bằng chữ in hoa (A-Z, 0-9)!');
    }
  }

  private newId(): string {
    return `wf-${Date.now().toString(36)}-${this.idSeq++}`;
  }

  private suggestKey(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10);
  }
}
