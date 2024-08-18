# TODO List Project using Redis Container

## Overview

This project is a full-stack TODO List application that utilizes Redis as a data store. The project is divided into two main parts:

1. **Backend** (`backend`): A Node.js and Express.js server that handles API requests for managing TODO items, using Redis for data storage.
2. **Frontend** (`frontend`): A React.js application that provides a user interface for interacting with the TODO list.

The application supports adding, updating, deleting, and viewing tasks, with real-time synchronization between the frontend and the Redis-based backend.

## Project Structure
```
redis-todo-project/
├── README.md               # Project documentation
├── LICENSE                 # Project license (MIT)
├── todo-app/               # Backend application
│   ├── node_modules/       # Node.js dependencies
│   ├── package-lock.json   # Dependency tree lock file
│   ├── package.json        # Backend dependencies and scripts
│   └── server.js           # Main server file for backend logic
├── todo-app-frontend/      # Frontend application
│   ├── README.md           # Frontend-specific documentation
│   ├── node_modules/       # Node.js dependencies
│   ├── public/             # Public assets (index.html, etc.)
│   ├── src/                # React components and application logic
│   ├── eslint.config.js    # ESLint configuration for code linting
│   ├── package-lock.json   # Dependency tree lock file
│   ├── package.json        # Frontend dependencies and scripts
│   └── vite.config.js      # Vite configuration for frontend build
```


## Prerequisites
- **Node.js**: Ensure that Node.js is installed on your system.
- **Docker**: This project uses Docker to run a Redis container.

## Running Redis with Docker
To run Redis using Docker, use the following command:

docker run --name redis-container -d -p 6379:6379 redis

This will pull the Redis image from Docker Hub (if not already present) and start a Redis container named redis-container.

## Usage
**Add Task**: Use the input field to add a new task.
**View Tasks**: The tasks are displayed in real-time from the Redis data store.
**Edit Task**: Click on a task to edit its content.
**Delete Task**: Click the trash icon next to a task to delete it.
**Mark as Completed**: Click on the checkmark icon to mark a task as completed.


## License
This project is licensed under the MIT License.

