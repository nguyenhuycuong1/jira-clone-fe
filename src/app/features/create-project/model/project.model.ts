/** Kiểu project: Scrum (sprint-based) hoặc Kanban (flow-based). */
export enum ProjectType {
  SCRUM = 'SCRUM',
  KANBAN = 'KANBAN',
}

/** Phân loại trạng thái workflow — dùng để tô màu chấm trạng thái. */
export enum StatusState {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/** Một trạng thái (cột) trong workflow của project. */
export interface WorkflowStatus {
  name: string;
  state: StatusState;
}

/** Dạng dữ liệu workflow dùng trong UI — thêm id ổn định để theo dõi khi kéo thả. */
export interface WorkflowStatusItem extends WorkflowStatus {
  id: string;
}

export interface CreateProjectRequest {
  name: string;
  key: string;
  description: string;
  type: ProjectType;
  workflow: WorkflowStatus[];
}

export interface ProjectResponse {
  id: string;
  name: string;
  key: string;
  description: string;
  type: ProjectType;
  workflow: WorkflowStatus[];
  createAt: string | Date;
}
