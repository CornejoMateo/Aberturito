import imageCompression from 'browser-image-compression';
import { isImage } from '@/utils/file-upload-utils';

const compressImage = async (file: File): Promise<File> => {
	const options = {
		maxSizeMB: 1,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
		fileType: 'image/webp',
	};

	const compressed = await imageCompression(file, options);

	const newFileName = file.name.replace(/\.[^/.]+$/, '.webp');

	return new File([compressed], newFileName, {
		type: 'image/webp',
	});
};

export const optimizeFile = async (file: File): Promise<File> => {
	if (isImage(file.type) && file.size > 500 * 1024) {
		return compressImage(file);
	}

	return file;
};
