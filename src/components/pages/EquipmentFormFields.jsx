import React, { useEffect, useState } from 'react';
import farmService from '@/services/api/farmService';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import { toast } from 'react-toastify';

const EquipmentFormFields = ({ formData, handleFormChange }) => {
  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(false);

  // Load farms for lookup field
  useEffect(() => {
    const loadFarms = async () => {
      setFarmsLoading(true);
      try {
        const farmData = await farmService.getAll();
        setFarms(farmData);
      } catch (error) {
        console.error('Error loading farms:', error);
        toast.error('Failed to load farms');
      } finally {
        setFarmsLoading(false);
      }
    };

    loadFarms();
  }, []);

  // Prepare options for Select components
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Under Maintenance', label: 'Under Maintenance' },
    { value: 'Retired', label: 'Retired' }
  ];

  const maintenanceStatusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Not Required', label: 'Not Required' }
  ];

  const farmOptions = farms.map(farm => ({
    value: farm.Id.toString(),
    label: farm.name
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Equipment Name"
          value={formData.equipmentName_c}
          onChange={(e) => handleFormChange('equipmentName_c', e.target.value)}
          required
        />
        <Input
          label="Model"
          value={formData.model_c}
          onChange={(e) => handleFormChange('model_c', e.target.value)}
        />
        <Input
          label="Manufacturer"
          value={formData.manufacturer_c}
          onChange={(e) => handleFormChange('manufacturer_c', e.target.value)}
        />
        <Input
          label="Serial Number"
          value={formData.serialNumber_c}
          onChange={(e) => handleFormChange('serialNumber_c', e.target.value)}
        />
        <Input
          label="Cost"
          type="number"
          step="0.01"
          value={formData.cost_c}
          onChange={(e) => handleFormChange('cost_c', e.target.value)}
        />
        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate_c}
          onChange={(e) => handleFormChange('purchaseDate_c', e.target.value)}
        />
        <Input
          label="Location"
          value={formData.location_c}
          onChange={(e) => handleFormChange('location_c', e.target.value)}
        />
        <Select
          label="Status"
          value={formData.status_c}
          options={statusOptions}
          onChange={(e) => handleFormChange('status_c', e.target.value)}
          placeholder="Select status..."
          required
        />
        <Select
          label="Maintenance Status"
          value={formData.maintenanceStatus_c}
          options={maintenanceStatusOptions}
          onChange={(e) => handleFormChange('maintenanceStatus_c', e.target.value)}
          placeholder="Select maintenance status..."
          required
        />
        <Select
          label="Farm"
          value={formData.farm_c}
          options={farmOptions}
          onChange={(e) => handleFormChange('farm_c', e.target.value)}
          placeholder={farmsLoading ? "Loading farms..." : "Select farm..."}
          disabled={farmsLoading}
        />
      </div>
      <div className="space-y-4">
        <Input
          label="Description"
          type="textarea"
          rows={3}
          value={formData.description_c}
          onChange={(e) => handleFormChange('description_c', e.target.value)}
          placeholder="Enter equipment description..."
        />
      </div>
    </>
  );
};

export default EquipmentFormFields;