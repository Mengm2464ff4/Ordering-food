import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'  // Changed
import { getFoods, createFood, updateFood, deleteFood, toggleFoodAvailability } from '../../api/adminApi'
import { generateImageUrl } from '../../utils/generateImageUrl'
import axios from '../../api/axios'
import AdminFoodTable from '../../components/admin/AdminFoodTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { FiPlus, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Foods = () => {
  const queryClient = useQueryClient()
  const [ isAddModalOpen, setIsAddModalOpen ] = useState( false )
  const [ editingFood, setEditingFood ] = useState( null )
  const [ formData, setFormData ] = useState( {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: '',
    preparationTime: 15,
    isAvailable: true,
    isPopular: false,
  } )
  const [ imagePreview, setImagePreview ] = useState( '' )
  const [ isSubmitting, setIsSubmitting ] = useState( false )

  const { data: foodsData, isLoading, refetch } = useQuery( {
    queryKey: [ 'adminFoods' ],
    queryFn: () => getFoods( { limit: 100 } )
  } )

  const createMutation = useMutation( createFood, {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminFoods' ] } )
      toast.success( 'Food added successfully' )
      resetForm()
      setIsAddModalOpen( false )
    },
    onError: ( error ) => {
      toast.error( error.response?.data?.message || 'Failed to add food' )
    },
  } )

  const updateMutation = useMutation( ( { id, data } ) => updateFood( id, data ), {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminFoods' ] } )
      toast.success( 'Food updated successfully' )
      resetForm()
      setEditingFood( null )
    },
    onError: ( error ) => {
      toast.error( error.response?.data?.message || 'Failed to update food' )
    },
  } )

  const deleteMutation = useMutation( deleteFood, {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminFoods' ] } )
      toast.success( 'Food deleted successfully' )
    },
    onError: ( error ) => {
      toast.error( error.response?.data?.message || 'Failed to delete food' )
    },
  } )

  const toggleAvailabilityMutation = useMutation( ( { id, isAvailable } ) => toggleFoodAvailability( id, isAvailable ), {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminFoods' ] } )
      toast.success( 'Food availability updated' )
    },
  } )

  // const handleImageUpload = async (e) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   const reader = new FileReader()
  //   reader.onloadend = () => {
  //     setImagePreview(reader.result)
  //   }
  //   reader.readAsDataURL(file)

  //   const uploadFormData = new FormData()
  //   uploadFormData.append('image', file)

  //   try {
  //     const response = await axios.post('/upload', uploadFormData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     })
  //     if (response.data.imageUrl) {
  //       setFormData(prev => ({ ...prev, image: response.data.imageUrl }))
  //       toast.success('Image uploaded!')
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Failed to upload image')
  //   }
  // }
  const handleImageUpload = async ( e ) => {
    const file = e.target.files[ 0 ];
    if ( !file ) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview( reader.result );
    reader.readAsDataURL( file );

    const uploadFormData = new FormData();
    uploadFormData.append( 'image', file );

    try {
      const response = await axios.post( '/upload', uploadFormData );

      if ( response.data?.imageUrl ) {
        setFormData( prev => ( { ...prev, image: response.data.imageUrl } ) );
        toast.success( 'Image uploaded successfully!' );
      }
    } catch ( error ) {
      const status = error.response?.status
      if ( status === 401 || status === 403 ) {
        toast.error( 'Not authorized. Log out and sign in again with an admin account.' )
        return
      }
      toast.error( error.response?.data?.message || 'Failed to upload image' )
    }
  };

  const handleSubmit = ( e ) => {
    e.preventDefault()

    if ( !formData.image?.trim() ) {
      toast.error( 'Please upload a food image before saving' )
      return
    }
    if ( formData.description.trim().length < 10 ) {
      toast.error( 'Description must be at least 10 characters' )
      return
    }

    setIsSubmitting( true )

    const foodData = {
      ...formData,
      price: parseFloat( formData.price ),
      ingredients: formData.ingredients.split( ',' ).map( i => i.trim() ).filter( i => i ),
      preparationTime: parseInt( formData.preparationTime ),
    }

    if ( editingFood ) {
      updateMutation.mutate( { id: editingFood._id, data: foodData } )
    } else {
      createMutation.mutate( foodData )
    }
    setIsSubmitting( false )
  }

  const handleEdit = ( food ) => {
    setEditingFood( food )
    setFormData( {
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      ingredients: food.ingredients?.join( ', ' ) || '',
      preparationTime: food.preparationTime || 15,
      isAvailable: food.isAvailable,
      isPopular: food.isPopular || false,
    } )
    setImagePreview( food.image )
  }

  const handleDelete = ( id ) => {
    deleteMutation.mutate( id )
  }

  const handleToggleAvailability = ( id, isAvailable ) => {
    toggleAvailabilityMutation.mutate( { id, isAvailable } )
  }

  const resetForm = () => {
    setFormData( {
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      ingredients: '',
      preparationTime: 15,
      isAvailable: true,
      isPopular: false,
    } )
    setImagePreview( '' )
    setEditingFood( null )
  }

  const categories = [
    'Khmer Food', 'Noodles', 'Rice', 'Seafood', 'Desserts', 'Beverages', 'Salads', 'Soups'
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant's menu items</p>
        </div>
        <Button onClick={() => setIsAddModalOpen( true )} className="flex items-center gap-2">
          <FiPlus /> Add New Food
        </Button>
      </div>

      <AdminFoodTable
        foods={foodsData?.foods}
        loading={isLoading}
        onEdit={( id, data ) => updateMutation.mutate( { id, data } )}
        onDelete={handleDelete}
        onAdd={( data ) => createMutation.mutate( data )}
        onToggleAvailability={handleToggleAvailability}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingFood}
        onClose={() => {
          setIsAddModalOpen( false )
          setEditingFood( null )
          resetForm()
        }}
        title={editingFood ? 'Edit Food' : 'Add New Food'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Image *</label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={generateImageUrl( imagePreview )} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview( '' )
                      setFormData( prev => ( { ...prev, image: '' } ) )
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500">
                  <FiUpload className="text-gray-400" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <p className="text-xs text-gray-500">Recommended: 400x400px, Max 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Food Name"
              name="name"
              value={formData.name}
              onChange={( e ) => setFormData( { ...formData, name: e.target.value } )}
              required
            />
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={( e ) => setFormData( { ...formData, price: e.target.value } )}
              required
            />
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={( e ) => setFormData( { ...formData, category: e.target.value } )}
              options={categories.map( c => ( { value: c, label: c } ) )}
              required
            />
            <Input
              label="Preparation Time (minutes)"
              type="number"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={( e ) => setFormData( { ...formData, preparationTime: e.target.value } )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={( e ) => setFormData( { ...formData, description: e.target.value } )}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (comma-separated)</label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={( e ) => setFormData( { ...formData, ingredients: e.target.value } )}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Rice, Chicken, Vegetables"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={( e ) => setFormData( { ...formData, isAvailable: e.target.checked } )}
                className="w-4 h-4 text-orange-500"
              />
              <span>Available for order</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={( e ) => setFormData( { ...formData, isPopular: e.target.checked } )}
                className="w-4 h-4 text-orange-500"
              />
              <span>Mark as Popular</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : ( editingFood ? 'Update Food' : 'Add Food' )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen( false )
                setEditingFood( null )
                resetForm()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Foods