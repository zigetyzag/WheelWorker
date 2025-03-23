import { supabase } from './supabaseClient';

// Interface for file upload response
export interface FileUploadResponse {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  path: string;
}

/**
 * Uploads a file to Supabase storage
 * @param file The file to upload
 * @param bucketName The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns Promise with the upload response or error
 */
export const uploadFile = async (
  file: File,
  bucketName: string = 'chat-attachments',
  folder: string = ''
): Promise<{ data: FileUploadResponse | null; error: Error | null }> => {
  try {
    // Create a unique file path to prevent overwrites
    const timestamp = new Date().getTime();
    const filePath = folder 
      ? `${folder}/${timestamp}_${file.name}` 
      : `${timestamp}_${file.name}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    // Return formatted response
    const uploadResponse: FileUploadResponse = {
      id: `file-${timestamp}`,
      name: file.name,
      type: file.type,
      url: publicUrlData.publicUrl,
      size: file.size,
      path: data.path
    };
    
    return { data: uploadResponse, error: null };
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Uploads multiple files to Supabase storage
 * @param files Array of files to upload
 * @param bucketName The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns Promise with an array of upload responses
 */
export const uploadMultipleFiles = async (
  files: File[],
  bucketName: string = 'chat-attachments',
  folder: string = ''
): Promise<FileUploadResponse[]> => {
  // For demo purposes, we'll create mock responses instead of actual uploads
  // In a production app, you would use the uploadFile function for each file
  
  return Promise.all(
    files.map(async (file) => {
      const timestamp = new Date().getTime();
      
      // Mock response - in a real app, this would call uploadFile
      return {
        id: `file-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file), // This is temporary and only works in the browser session
        size: file.size,
        path: folder ? `${folder}/${timestamp}_${file.name}` : `${timestamp}_${file.name}`
      };
    })
  );
};

/**
 * Deletes a file from Supabase storage
 * @param path The file path to delete
 * @param bucketName The storage bucket name
 * @returns Promise with success status or error
 */
export const deleteFile = async (
  path: string,
  bucketName: string = 'chat-attachments'
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error during file deletion:', error);
    return { success: false, error: error as Error };
  }
};

// Function to determine if a file is an image
export const isImageFile = (file: File | { type: string }): boolean => {
  return file.type.startsWith('image/');
};

// Function to determine if a file is a document
export const isDocumentFile = (file: File | { type: string }): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];
  
  return documentTypes.includes(file.type);
};

// Format file size for display (e.g., 1.5 MB)
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};