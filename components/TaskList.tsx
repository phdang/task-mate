import React from 'react';
import { Task } from '../generated/graphql-frontend';

interface Props {
  tasks: Task[];
}

const TaskList: React.FC<Props> = function TaskList({ tasks }) {
  return (
    <ul className='task-list'>
      {tasks.map((task) => {
        return (
          <li className='task-list-item' key={task.id}>
            {task.title} - {task.status}
          </li>
        );
      })}
    </ul>
  );
};

export default TaskList;
