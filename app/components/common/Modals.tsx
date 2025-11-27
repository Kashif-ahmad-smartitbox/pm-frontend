import NewTaskModal from "../NewTaskModal";
import { Note, Task, User } from "./TaskCard2";
import TaskNotesModal from "../TaskNotesModal";
import NewProjectModal from "../NewProjectModal";
import UpdateTaskModal from "../UpdateTaskModal";
import EditProjectModal from "../EditProjectModal";
import ConfirmationModal from "../ConfirmationModal";
import UserManagementModal from "../UserManagementModal";
import ProjectTypeManagementModal from "../ProjectTypeManagementModal";
import AllTasksModal from "../AllTasksModal";

type ProjectStatus = "planned" | "active" | "completed" | "overdue";

interface DeleteConfirmState {
  type: "project" | "task" | null;
  id: string | null;
  name: string;
}

interface ProjectType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Project {
  _id: string;
  projectName: string;
  location: string;
  projectManager: User;
  projectType: ProjectType;
  startDate: string;
  endDate: string;
  createdBy: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProjectData {
  project: Project;
  taskStats: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      done: number;
    };
    byPriority: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    overdue: number;
  };
  tasks: Task[];
  assignees: User[];
  recentNotes: Array<{
    taskId: string;
    taskTitle: string;
    noteId: string;
    text: string;
    createdAt: string;
    author: User;
  }>;
}

// Task Stats Interface
interface TaskStats {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    done: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  overdue: number;
}

interface ModalsProps {
  selectedTask: Task | null;
  showNewProjectModal: boolean;
  showNewTaskModal: boolean;
  showEditProjectModal: boolean;
  showUserManagementModal: boolean;
  showProjectTypesModal: boolean;
  showUpdateTaskModal: boolean;
  showAllTasksModal: boolean;
  editingTask: Task | null;
  editingProject: Project | null;
  deleteConfirm: DeleteConfirmState;
  selectedProject: ProjectData | null;
  allTasks?: Task[];
  taskStats?: TaskStats;
  onCloseModal: () => void;
  onNoteAdded: (note: Note) => void;
  onNewProjectCreated: () => void;
  onNewTaskCreated: () => void;
  onProjectUpdated: () => void;
  onTaskUpdated: () => void;
  onProjectTypeCreated: () => void;
  onConfirmDelete: () => void;
  onCloseNewProjectModal: () => void;
  onCloseNewTaskModal: () => void;
  onCloseEditProjectModal: () => void;
  onCloseUserManagementModal: () => void;
  onCloseProjectTypesModal: () => void;
  onCloseUpdateTaskModal: () => void;
  onCloseAllTasksModal: () => void;
  onCloseDeleteConfirm: () => void;
  currentUser: User;
  onRefresh: () => void;
  // Add these new props for task interactions
  onTaskClick?: (task: Task) => void;
  onChatClick?: (task: Task) => void;
}

const Modals: React.FC<ModalsProps> = ({
  selectedTask,
  showNewProjectModal,
  showNewTaskModal,
  showEditProjectModal,
  showUserManagementModal,
  showProjectTypesModal,
  showUpdateTaskModal,
  showAllTasksModal,
  editingTask,
  editingProject,
  deleteConfirm,
  selectedProject,
  allTasks = [],
  taskStats,
  onCloseModal,
  onNoteAdded,
  onNewProjectCreated,
  onNewTaskCreated,
  onProjectUpdated,
  onTaskUpdated,
  onProjectTypeCreated,
  onConfirmDelete,
  onCloseNewProjectModal,
  onCloseNewTaskModal,
  onCloseEditProjectModal,
  onCloseUserManagementModal,
  onCloseProjectTypesModal,
  onCloseUpdateTaskModal,
  onCloseAllTasksModal,
  onCloseDeleteConfirm,
  currentUser,
  onRefresh,
  // Add handlers for task interactions
  onTaskClick,
  onChatClick,
}) => {
  // Handle task click from AllTasksModal
  const handleTaskClick = (task: Task) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
    // Close the All Tasks modal when a task is clicked
    onCloseAllTasksModal();
  };

  // Handle chat click from AllTasksModal
  const handleChatClick = (task: Task) => {
    if (onChatClick) {
      onChatClick(task);
    }
    // Close the All Tasks modal when chat is clicked
    onCloseAllTasksModal();
  };

  return (
    <>
      {selectedTask && (
        <TaskNotesModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={onCloseModal}
          onNoteAdded={onNoteAdded}
          onRefresh={onRefresh}
          currentUser={currentUser}
        />
      )}

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={onCloseNewProjectModal}
        onProjectCreated={onNewProjectCreated}
      />

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={onCloseNewTaskModal}
        onTaskCreated={onNewTaskCreated}
        projectId={selectedProject?.project._id || ""}
      />

      <UpdateTaskModal
        isOpen={showUpdateTaskModal}
        onClose={onCloseUpdateTaskModal}
        onTaskUpdated={onTaskUpdated}
        task={editingTask}
      />

      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={onCloseEditProjectModal}
        onProjectUpdated={onProjectUpdated}
        project={editingProject}
      />

      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={onCloseUserManagementModal}
        onUserCreated={onProjectTypeCreated}
      />

      <ProjectTypeManagementModal
        isOpen={showProjectTypesModal}
        onClose={onCloseProjectTypesModal}
        onProjectTypeCreated={onProjectTypeCreated}
      />

      {/* All Tasks Modal with chat functionality */}
      <AllTasksModal
        isOpen={showAllTasksModal}
        onClose={onCloseAllTasksModal}
        allTasks={allTasks}
        taskStats={taskStats}
        onTaskClick={handleTaskClick}
        onChatClick={handleChatClick}
      />

      <ConfirmationModal
        isOpen={deleteConfirm.type !== null}
        onClose={onCloseDeleteConfirm}
        onConfirm={onConfirmDelete}
        title={`Delete ${
          deleteConfirm.type === "project" ? "Project" : "Task"
        }`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default Modals;
