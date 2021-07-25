import React from 'react';
import { Task } from '../generated/graphql-frontend';
import TaskListItem from './TaskListItem';

interface Props {
  tasks: Task[];
}

const TaskList: React.FC<Props> = function TaskList({ tasks }) {
  return (
    <ul className='task-list'>
      {tasks.map((task) => {
        return <TaskListItem key={task.id} task={task} />;
      })}
    </ul>
  );
};

export default TaskList;
