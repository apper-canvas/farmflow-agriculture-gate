import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...tasksData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id, 10));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async getByFarmId(farmId) {
    await delay(250);
    return tasks.filter(t => t.farmId === parseInt(farmId, 10)).map(t => ({ ...t }));
  },

  async getPending() {
    await delay(200);
    return tasks.filter(t => !t.completed).map(t => ({ ...t }));
  },

  async create(taskData) {
    await delay(400);
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      farmId: parseInt(taskData.farmId, 10),
      cropId: taskData.cropId ? parseInt(taskData.cropId, 10) : null,
      completed: false
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await delay(350);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      Id: tasks[index].Id, // Prevent Id modification
      farmId: parseInt(taskData.farmId || tasks[index].farmId, 10),
      cropId: taskData.cropId ? parseInt(taskData.cropId, 10) : null
    };
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async toggleComplete(id) {
    await delay(200);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks[index].completed = !tasks[index].completed;
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    const deletedTask = tasks.splice(index, 1)[0];
    return { ...deletedTask };
  }
};

export default taskService;