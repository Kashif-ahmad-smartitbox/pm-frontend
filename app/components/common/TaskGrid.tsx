import TaskCard2, { Task } from "./TaskCard2";

const TaskGrid = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onApproveTask,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onApproveTask?: (task: Task) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
    {tasks.map((task) => (
      <TaskCard2
        key={task._id}
        task={task}
        onTaskClick={onTaskClick}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onApproveTask={onApproveTask}
      />
    ))}
  </div>
);

export default TaskGrid;
