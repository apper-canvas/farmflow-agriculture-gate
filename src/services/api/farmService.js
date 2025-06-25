import farmsData from '../mockData/farms.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let farms = [...farmsData];

const farmService = {
  async getAll() {
    await delay(300);
    return [...farms];
  },

  async getById(id) {
    await delay(200);
    const farm = farms.find(f => f.Id === parseInt(id, 10));
    if (!farm) {
      throw new Error('Farm not found');
    }
    return { ...farm };
  },

  async create(farmData) {
    await delay(400);
    const maxId = farms.length > 0 ? Math.max(...farms.map(f => f.Id)) : 0;
    const newFarm = {
      ...farmData,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    farms.push(newFarm);
    return { ...newFarm };
  },

  async update(id, farmData) {
    await delay(350);
    const index = farms.findIndex(f => f.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Farm not found');
    }
    const updatedFarm = {
      ...farms[index],
      ...farmData,
      Id: farms[index].Id // Prevent Id modification
    };
    farms[index] = updatedFarm;
    return { ...updatedFarm };
  },

  async delete(id) {
    await delay(250);
    const index = farms.findIndex(f => f.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Farm not found');
    }
    const deletedFarm = farms.splice(index, 1)[0];
    return { ...deletedFarm };
  }
};

export default farmService;