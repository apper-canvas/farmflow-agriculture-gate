import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ApperIcon from '@/components/ApperIcon';
import { storageLocationService } from '@/services/api/storageLocationService';
import {
  setLocations, setLocationsLoading, setLocationsError,
  addLocation, updateLocation, removeLocation
} from '@/store/inventorySlice';

const StorageLocations = () => {
  const dispatch = useDispatch();
  const { locations, loading, error } = useSelector(state => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    location_name_c: '',
    location_description_c: '',
    location_type_c: '',
    Tags: ''
  });

  // Load locations on component mount
  useEffect(() => {
    loadLocations();
  }, []);

  // Filter locations based on search and type
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.location_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.location_description_c?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || location.location_type_c === filterType;
    
    return matchesSearch && matchesType;
  });

  const loadLocations = async () => {
    try {
      dispatch(setLocationsLoading(true));
      const data = await storageLocationService.getAllLocations();
      dispatch(setLocations(data));
    } catch (error) {
      console.error('Error loading storage locations:', error);
      dispatch(setLocationsError(error.message));
      toast.error('Failed to load storage locations');
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      location_name_c: '',
      location_description_c: '',
      location_type_c: '',
      Tags: ''
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setFormData({
      location_name_c: location.location_name_c || '',
      location_description_c: location.location_description_c || '',
      location_type_c: location.location_type_c || '',
      Tags: location.Tags || ''
    });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Are you sure you want to delete this storage location?')) return;

    try {
      await storageLocationService.deleteLocation(locationId);
      dispatch(removeLocation(locationId));
      toast.success('Storage location deleted successfully');
    } catch (error) {
      console.error('Error deleting storage location:', error);
      toast.error('Failed to delete storage location');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location_name_c.trim()) {
      toast.error('Location name is required');
      return;
    }

    if (!formData.location_type_c) {
      toast.error('Location type is required');
      return;
    }

    try {
      if (editingLocation) {
        const updatedLocation = await storageLocationService.updateLocation(editingLocation.Id, formData);
        dispatch(updateLocation(updatedLocation));
        toast.success('Storage location updated successfully');
      } else {
        const newLocation = await storageLocationService.createLocation(formData);
        dispatch(addLocation(newLocation));
        toast.success('Storage location created successfully');
      }
      setShowLocationForm(false);
    } catch (error) {
      console.error('Error saving storage location:', error);
      toast.error('Failed to save storage location');
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'Warehouse': return 'Warehouse';
      case 'Shed': return 'Home';
      case 'Field': return 'MapPin';
      case 'Silo': return 'Building';
      default: return 'MapPin';
    }
  };

  const getLocationColor = (type) => {
    switch (type) {
      case 'Warehouse': return 'primary';
      case 'Shed': return 'secondary';
      case 'Field': return 'success';
      case 'Silo': return 'accent';
      default: return 'default';
    }
  };

  if (loading.locations && locations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Storage Locations</h1>
        </div>
        <SkeletonLoader count={6} type="card" />
      </div>
    );
  }

  if (error.locations && locations.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Storage Locations"
          message={error.locations}
          onRetry={loadLocations}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Storage Locations</h1>
          <p className="text-gray-600 mt-1">Manage warehouses, sheds, fields, and storage facilities</p>
        </div>
        <Button
          onClick={handleAddLocation}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Storage Location
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Warehouse', 'Shed', 'Field', 'Silo'].map(type => {
          const count = locations.filter(loc => loc.location_type_c === type).length;
          return (
            <Card key={type} className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${getLocationColor(type)}/10 text-${getLocationColor(type)}`}>
                  <ApperIcon name={getLocationIcon(type)} size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">{type}s</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
          <Select
            placeholder="Filter by type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Warehouse', label: 'Warehouse' },
              { value: 'Shed', label: 'Shed' },
              { value: 'Field', label: 'Field' },
              { value: 'Silo', label: 'Silo' }
            ]}
          />
        </div>
      </Card>

      {/* Storage Locations Grid */}
      {filteredLocations.length === 0 ? (
        <EmptyState
          icon="Warehouse"
          title="No storage locations found"
          description="Start organizing your inventory by adding your first storage location."
          actionLabel="Add First Location"
          onAction={handleAddLocation}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <motion.div
              key={location.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card hover className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${getLocationColor(location.location_type_c)}/10 text-${getLocationColor(location.location_type_c)}`}>
                        <ApperIcon name={getLocationIcon(location.location_type_c)} size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {location.location_name_c || location.Name}
                        </h3>
                        <Badge
                          variant={getLocationColor(location.location_type_c)}
                          size="sm"
                        >
                          {location.location_type_c}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="Edit"
                        onClick={() => handleEditLocation(location)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="Trash2"
                        onClick={() => handleDeleteLocation(location.Id)}
                        className="text-error hover:text-error"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {location.location_description_c && (
                    <p className="text-sm text-gray-600">
                      {location.location_description_c}
                    </p>
                  )}

                  {/* Tags */}
                  {location.Tags && (
                    <div className="flex flex-wrap gap-1">
                      {location.Tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="default" size="xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t text-xs text-gray-500">
                    Created: {new Date(location.CreatedOn).toLocaleDateString()}
                    {location.ModifiedOn && location.ModifiedOn !== location.CreatedOn && (
                      <span className="ml-3">
                        Modified: {new Date(location.ModifiedOn).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Location Form Modal */}
      {showLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingLocation ? 'Edit Storage Location' : 'Add New Storage Location'}
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Location Name"
                value={formData.location_name_c}
                onChange={(e) => setFormData({...formData, location_name_c: e.target.value})}
                required
                placeholder="Enter location name"
              />
              
              <Select
                label="Location Type"
                value={formData.location_type_c}
                onChange={(e) => setFormData({...formData, location_type_c: e.target.value})}
                required
                options={[
                  { value: 'Warehouse', label: 'Warehouse' },
                  { value: 'Shed', label: 'Shed' },
                  { value: 'Field', label: 'Field' },
                  { value: 'Silo', label: 'Silo' }
                ]}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.location_description_c}
                  onChange={(e) => setFormData({...formData, location_description_c: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Describe the storage location..."
                />
              </div>
              
              <Input
                label="Tags"
                value={formData.Tags}
                onChange={(e) => setFormData({...formData, Tags: e.target.value})}
                placeholder="Enter tags separated by commas"
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLocation ? 'Update Location' : 'Create Location'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StorageLocations;